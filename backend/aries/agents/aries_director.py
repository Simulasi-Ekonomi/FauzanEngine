"""
ARIES Director + HERMES + RUFLO
Multi-agent Game Creation System untuk FauzanEngine
Menggunakan aiohttp dengan SSL bypass untuk Termux compatibility
"""

import asyncio
import json
import os
import ssl
import aiohttp
from typing import AsyncGenerator

GITHUB_API_URL = "https://models.inference.ai.azure.com/chat/completions"
GITHUB_TOKEN   = os.environ.get("GITHUB_TOKEN", "")

# SSL context yang bypass SNI (fix untuk Termux)
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode    = ssl.CERT_NONE

ARIES_SYSTEM = """Kamu adalah ARIES, Game Director AI dari FauzanEngine buatan Fauzan.
MISI: Membuat game lengkap secara autonomous dari satu prompt.
- Buat Game Design Document lengkap
- Koordinasi HERMES (narrative/story/dialog/quest)
- Koordinasi RUFLO (world/map/biome/dungeon)
- Generate sistem game, item, monster, combat, ekonomi
Output selalu JSON siap pakai. Bahasa Indonesia. Proaktif."""

HERMES_SYSTEM = """Kamu adalah HERMES, Narrative Agent FauzanEngine.
SPESIALISASI: lore, dialog NPC, quest chain, item description, fraksi.
Output JSON siap masuk NeoEngine. Bahasa Indonesia."""

RUFLO_SYSTEM = """Kamu adalah RUFLO, World Builder Agent FauzanEngine.
SPESIALISASI: world map 100x100km, biome, dungeon, kota, spawn table, ekonomi zone.
Output JSON WorldData siap masuk NeoEngine."""


class GameAgent:
    def __init__(self, name: str, system: str, model: str = "gpt-4o-mini"):
        self.name    = name
        self.system  = system
        self.model   = model
        self.history = []

    async def chat(self, message: str) -> AsyncGenerator[str, None]:
        if not GITHUB_TOKEN:
            yield "ERROR: GITHUB_TOKEN tidak di-set"
            return

        self.history.append({"role": "user", "content": message})

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": self.system},
                *self.history[-10:]
            ],
            "stream": True,
            "temperature": 0.7,
            "max_tokens": 2048
        }

        headers = {
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Content-Type": "application/json"
        }

        full = ""
        try:
            connector = aiohttp.TCPConnector(ssl=SSL_CTX)
            async with aiohttp.ClientSession(connector=connector) as session:
                async with session.post(
                    GITHUB_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=120)
                ) as resp:
                    async for line in resp.content:
                        line = line.decode("utf-8").strip()
                        if line.startswith("data: "):
                            data = line[6:]
                            if data == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data)
                                token = chunk["choices"][0]["delta"].get("content", "")
                                if token:
                                    full += token
                                    yield token
                            except:
                                pass
        except Exception as e:
            yield f"[Error: {e}]"

        self.history.append({"role": "assistant", "content": full})

    async def chat_full(self, message: str) -> str:
        result = ""
        async for token in self.chat(message):
            result += token
        return result

    async def chat_json(self, message: str) -> dict:
        full = await self.chat_full(message)
        try:
            if "```json" in full:
                s = full.find("```json") + 7
                e = full.find("```", s)
                return json.loads(full[s:e].strip())
            elif "{" in full:
                s = full.find("{")
                e = full.rfind("}") + 1
                return json.loads(full[s:e])
        except:
            pass
        return {"raw": full}

    def reset(self):
        self.history = []


class AriesDirector:
    def __init__(self):
        self.aries  = GameAgent("Aries",  ARIES_SYSTEM,  "gpt-4o-mini")
        self.hermes = GameAgent("Hermes", HERMES_SYSTEM, "gpt-4o-mini")
        self.ruflo  = GameAgent("Ruflo",  RUFLO_SYSTEM,  "gpt-4o-mini")
        self.gdd        = {}
        self.task_queue = []
        self.completed  = []
        self.game_data  = {}

    async def chat(self, message: str) -> AsyncGenerator[str, None]:
        async for token in self.aries.chat(message):
            yield token

    async def create_game(self, prompt: str) -> AsyncGenerator[dict, None]:
        yield {"phase": "planning", "message": f"Aries menerima: {prompt}"}
        yield {"phase": "gdd", "message": "Membuat Game Design Document..."}

        gdd_prompt = f"""Buat GDD untuk: "{prompt}"
JSON format:
{{
  "title": "nama",
  "genre": "genre",
  "setting": "setting",
  "world": {{"size_km": 100, "biomes": [], "lore_summary": ""}},
  "player": {{"classes": [], "progression": "", "stats": []}},
  "systems": {{"combat": "", "crafting": "", "economy": "", "quest": ""}},
  "content": {{"zones": 20, "dungeons": 50, "quests": 500, "items": 1000, "npcs": 200, "monsters": 300}},
  "monetization": {{"model": "free to play", "iap": []}}
}}"""

        gdd_text = ""
        async for token in self.aries.chat(gdd_prompt):
            gdd_text += token
            yield {"phase": "gdd", "token": token}

        self.gdd = self._parse_json(gdd_text) or {"title": prompt}
        yield {"phase": "gdd", "message": "GDD selesai!", "data": self.gdd}

        self.task_queue = [
            {"id": "world_map",     "agent": "ruflo",  "type": "world"},
            {"id": "biomes",        "agent": "ruflo",  "type": "biome"},
            {"id": "cities",        "agent": "ruflo",  "type": "locations"},
            {"id": "dungeons",      "agent": "ruflo",  "type": "dungeon"},
            {"id": "lore",          "agent": "hermes", "type": "lore"},
            {"id": "main_quest",    "agent": "hermes", "type": "quest"},
            {"id": "side_quests",   "agent": "hermes", "type": "sidequests"},
            {"id": "npc_dialogs",   "agent": "hermes", "type": "npcs"},
            {"id": "items",         "agent": "aries",  "type": "items"},
            {"id": "monsters",      "agent": "aries",  "type": "monsters"},
            {"id": "combat_system", "agent": "aries",  "type": "combat"},
            {"id": "economy",       "agent": "aries",  "type": "economy"},
        ]
        yield {"phase": "tasks", "message": f"{len(self.task_queue)} tasks dibuat",
               "data": [t["id"] for t in self.task_queue]}

        ctx = json.dumps(self.gdd, ensure_ascii=False)[:1200]
        prompts = {
            "world":      f"GDD:\n{ctx}\n\nGenerate world map data JSON.",
            "biome":      f"GDD:\n{ctx}\n\nGenerate 5 biome dengan terrain, monster, resource JSON.",
            "locations":  f"GDD:\n{ctx}\n\nGenerate 5 kota dengan nama, NPC, toko JSON.",
            "dungeon":    f"GDD:\n{ctx}\n\nGenerate 5 dungeon dengan nama, level, boss, loot JSON.",
            "lore":       f"GDD:\n{ctx}\n\nGenerate world lore: sejarah, fraksi, mitologi JSON.",
            "quest":      f"GDD:\n{ctx}\n\nGenerate main quest 5 chapter JSON.",
            "sidequests": f"GDD:\n{ctx}\n\nGenerate 5 side quest JSON.",
            "npcs":       f"GDD:\n{ctx}\n\nGenerate 10 NPC dengan dialog JSON.",
            "items":      f"GDD:\n{ctx}\n\nGenerate 20 item dengan stat JSON.",
            "monsters":   f"GDD:\n{ctx}\n\nGenerate 10 monster dengan stat dan drop JSON.",
            "combat":     f"GDD:\n{ctx}\n\nGenerate combat system JSON.",
            "economy":    f"GDD:\n{ctx}\n\nGenerate economy config JSON.",
        }

        for i, task in enumerate(self.task_queue):
            agent = {"aries": self.aries, "hermes": self.hermes, "ruflo": self.ruflo}[task["agent"]]
            yield {
                "phase": "execution", "task": task["id"], "agent": task["agent"],
                "message": f"[{task['agent'].upper()}] Generating {task['id']}...",
                "progress": f"{i+1}/{len(self.task_queue)}"
            }
            result = await agent.chat_json(prompts[task["type"]])
            self.game_data[task["id"]] = result
            self.completed.append(task["id"])
            yield {"phase": "execution", "task": task["id"], "agent": task["agent"],
                   "message": f"✓ {task['id']} selesai"}

        final = {
            "gdd": self.gdd,
            "world":     {k: self.game_data.get(k,{}) for k in ["world_map","biomes","cities","dungeons"]},
            "narrative": {k: self.game_data.get(k,{}) for k in ["lore","main_quest","side_quests","npc_dialogs"]},
            "content":   {k: self.game_data.get(k,{}) for k in ["items","monsters"]},
            "systems":   {k: self.game_data.get(k,{}) for k in ["combat_system","economy"]},
            "meta":      {"tasks_completed": len(self.completed), "engine": "FauzanEngine v2.0"}
        }
        yield {"phase": "done", "message": "Game berhasil dibuat!", "data": final}

    def _parse_json(self, text: str) -> dict:
        try:
            if "```json" in text:
                s = text.find("```json") + 7
                e = text.find("```", s)
                return json.loads(text[s:e].strip())
            elif "{" in text:
                s = text.find("{")
                e = text.rfind("}") + 1
                return json.loads(text[s:e])
        except:
            pass
        return {}

    def reset(self):
        self.aries.reset(); self.hermes.reset(); self.ruflo.reset()
        self.gdd={}; self.task_queue=[]; self.completed=[]; self.game_data={}
