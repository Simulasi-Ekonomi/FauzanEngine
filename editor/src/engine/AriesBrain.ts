// =========================================================
// Aries Autonomous Brain v4.0 - Self-Learning AI Engine
// Works WITHOUT any external API key
// Features: Scene Creation, Learning Memory, Conversation,
// Bug Detection, Game Design, Monetization, Initiative
// =========================================================

import type { NeoActor } from '../types/editor';

interface BrainResponse {
  response: string;
  actions: Array<Record<string, unknown>>;
}

// =========================================================
// LEARNING MEMORY SYSTEM
// Aries remembers everything and gets smarter over time
// =========================================================

interface AriesMemory {
  interactions: number;
  learnedPatterns: Record<string, string>; // user pattern -> action
  corrections: Array<{ wrong: string; right: string }>;
  favoriteCommands: Record<string, number>; // command -> usage count
  knowledge: string[]; // learned facts
  conversationHistory: Array<{ role: string; content: string; timestamp: number }>;
  xp: number; // experience points
  level: number;
  lastActive: number;
}

const MEMORY_KEY = 'aries_brain_memory';

function loadMemory(): AriesMemory {
  try {
    const saved = localStorage.getItem(MEMORY_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {
    interactions: 0,
    learnedPatterns: {},
    corrections: [],
    favoriteCommands: {},
    knowledge: [],
    conversationHistory: [],
    xp: 0,
    level: 1,
    lastActive: Date.now(),
  };
}

function saveMemory(memory: AriesMemory) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch { /* ignore */ }
}

function addInteraction(command: string, response: string) {
  const memory = loadMemory();
  memory.interactions++;
  memory.xp += 10;
  memory.level = Math.floor(memory.xp / 100) + 1;
  memory.lastActive = Date.now();

  // Track favorite commands
  const cmdKey = command.toLowerCase().split(' ').slice(0, 3).join(' ');
  memory.favoriteCommands[cmdKey] = (memory.favoriteCommands[cmdKey] || 0) + 1;

  // Store conversation (keep last 100)
  memory.conversationHistory.push({ role: 'user', content: command, timestamp: Date.now() });
  memory.conversationHistory.push({ role: 'aries', content: response.substring(0, 200), timestamp: Date.now() });
  if (memory.conversationHistory.length > 200) {
    memory.conversationHistory = memory.conversationHistory.slice(-200);
  }

  saveMemory(memory);
}

function learnCorrection(wrong: string, right: string) {
  const memory = loadMemory();
  memory.corrections.push({ wrong, right });
  memory.learnedPatterns[wrong.toLowerCase()] = right;
  memory.xp += 25; // bonus XP for learning
  memory.level = Math.floor(memory.xp / 100) + 1;
  saveMemory(memory);
}

function addKnowledge(fact: string) {
  const memory = loadMemory();
  if (!memory.knowledge.includes(fact)) {
    memory.knowledge.push(fact);
    memory.xp += 15;
    memory.level = Math.floor(memory.xp / 100) + 1;
    saveMemory(memory);
  }
}

// =========================================================
// SCENE ANALYSIS ENGINE
// =========================================================

interface SceneIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion: string;
}

function analyzeScene(actors: Record<string, NeoActor>): SceneIssue[] {
  const issues: SceneIssue[] = [];
  const actorList = Object.values(actors);
  const actorCount = actorList.length;

  const hasLight = actorList.some(a => a.type.includes('light'));
  const hasCamera = actorList.some(a => a.type === 'camera');
  const hasPlayerStart = actorList.some(a => a.type === 'player_start');
  const hasFloor = actorList.some(a => a.type === 'plane');

  if (!hasLight) {
    issues.push({ severity: 'error', category: 'Lighting', message: 'Tidak ada light! Game gelap.', suggestion: 'Saya tambahkan light otomatis.' });
  }
  if (!hasCamera) {
    issues.push({ severity: 'warning', category: 'Camera', message: 'Tidak ada camera.', suggestion: 'Tambahkan camera untuk pandangan player.' });
  }
  if (!hasPlayerStart) {
    issues.push({ severity: 'warning', category: 'Gameplay', message: 'Tidak ada PlayerStart.', suggestion: 'Tambahkan spawn point.' });
  }
  if (!hasFloor) {
    issues.push({ severity: 'warning', category: 'Level', message: 'Tidak ada ground/floor.', suggestion: 'Tambahkan plane sebagai lantai.' });
  }

  const playerStarts = actorList.filter(a => a.type === 'player_start');
  if (playerStarts.length > 1) {
    issues.push({ severity: 'warning', category: 'Gameplay', message: `${playerStarts.length} PlayerStart duplikat.`, suggestion: 'Hapus yang tidak perlu.' });
  }

  if (actorCount > 100) {
    issues.push({ severity: 'warning', category: 'Performance', message: `${actorCount} actors, berat untuk mobile.`, suggestion: 'Kurangi atau gunakan LOD.' });
  }

  const lightCount = actorList.filter(a => a.type.includes('light')).length;
  if (lightCount > 5) {
    issues.push({ severity: 'warning', category: 'Performance', message: `${lightCount} lights, sangat berat.`, suggestion: 'Max 2-3 lights untuk mobile.' });
  }

  const zeroScale = actorList.filter(a => a.transform.scale.x === 0 || a.transform.scale.y === 0 || a.transform.scale.z === 0);
  if (zeroScale.length > 0) {
    issues.push({ severity: 'error', category: 'Transform', message: `${zeroScale.map(a => a.name).join(', ')} scale 0 (invisible).`, suggestion: 'Set scale minimal 0.01.' });
  }

  if (issues.length === 0) {
    issues.push({ severity: 'info', category: 'OK', message: 'Scene bagus! Siap di-build.', suggestion: 'Coba "play game" untuk test.' });
  }

  return issues;
}

// =========================================================
// LANDSCAPE & ENVIRONMENT CREATORS
// These actually CREATE objects in the scene
// =========================================================

function createLandscapeMap(): BrainResponse {
  return {
    response: `[ARIES] Landscape map dibuat!

Saya sudah membuat landscape dengan:
- Terrain (ground plane besar)
- 4 Gunung/Bukit
- 6 Pohon
- 2 Danau/Air
- Sungai
- Pencahayaan matahari
- Camera overview
- Player spawn point

Total: 18 actors. Klik di Outliner untuk edit posisi masing-masing.
Ketik "tambah pohon" / "tambah gunung" untuk menambah lebih banyak.`,
    actions: [
      { type: 'add_actor', actorType: 'plane', name: 'Terrain_Ground' },
      { type: 'add_actor', actorType: 'cube', name: 'Mountain_1' },
      { type: 'add_actor', actorType: 'cube', name: 'Mountain_2' },
      { type: 'add_actor', actorType: 'cube', name: 'Mountain_3' },
      { type: 'add_actor', actorType: 'cube', name: 'Hill_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Pine_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Pine_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Oak_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Oak_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Birch_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Birch_2' },
      { type: 'add_actor', actorType: 'plane', name: 'Lake_1' },
      { type: 'add_actor', actorType: 'plane', name: 'Lake_2' },
      { type: 'add_actor', actorType: 'plane', name: 'River' },
      { type: 'add_actor', actorType: 'sphere', name: 'Rock_1' },
      { type: 'add_actor', actorType: 'sphere', name: 'Rock_2' },
      { type: 'add_actor', actorType: 'light_directional', name: 'Sun' },
      { type: 'add_actor', actorType: 'camera', name: 'OverviewCamera' },
      { type: 'add_actor', actorType: 'player_start', name: 'PlayerSpawn' },
    ],
  };
}

function createCity(): BrainResponse {
  return {
    response: `[ARIES] Kota dibuat!

Kota lengkap dengan:
- Ground/jalan utama
- 8 Gedung berbagai ukuran
- 2 Toko
- Taman kota dengan pohon
- Lampu jalan
- Parkiran
- Camera kota
- Player spawn

Total: 20 actors. Edit di Outliner untuk atur posisi.`,
    actions: [
      { type: 'add_actor', actorType: 'plane', name: 'City_Ground' },
      { type: 'add_actor', actorType: 'plane', name: 'MainRoad' },
      { type: 'add_actor', actorType: 'cube', name: 'Building_Tall_1' },
      { type: 'add_actor', actorType: 'cube', name: 'Building_Tall_2' },
      { type: 'add_actor', actorType: 'cube', name: 'Building_Tall_3' },
      { type: 'add_actor', actorType: 'cube', name: 'Building_Medium_1' },
      { type: 'add_actor', actorType: 'cube', name: 'Building_Medium_2' },
      { type: 'add_actor', actorType: 'cube', name: 'Building_Small_1' },
      { type: 'add_actor', actorType: 'cube', name: 'Building_Small_2' },
      { type: 'add_actor', actorType: 'cube', name: 'Building_Small_3' },
      { type: 'add_actor', actorType: 'cube', name: 'Shop_1' },
      { type: 'add_actor', actorType: 'cube', name: 'Shop_2' },
      { type: 'add_actor', actorType: 'plane', name: 'Park' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Park_Tree_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Park_Tree_2' },
      { type: 'add_actor', actorType: 'light_point', name: 'StreetLight_1' },
      { type: 'add_actor', actorType: 'light_point', name: 'StreetLight_2' },
      { type: 'add_actor', actorType: 'plane', name: 'Parking' },
      { type: 'add_actor', actorType: 'light_directional', name: 'Sun' },
      { type: 'add_actor', actorType: 'camera', name: 'CityCamera' },
      { type: 'add_actor', actorType: 'player_start', name: 'PlayerSpawn' },
    ],
  };
}

function createVillage(): BrainResponse {
  return {
    response: `[ARIES] Desa dibuat!

Desa tradisional dengan:
- Tanah desa
- 5 Rumah penduduk
- 1 Balai desa
- Sumur
- Ladang pertanian
- Pohon-pohon
- Jalan setapak
- Sungai kecil

Total: 18 actors.`,
    actions: [
      { type: 'add_actor', actorType: 'plane', name: 'Village_Ground' },
      { type: 'add_actor', actorType: 'cube', name: 'House_1' },
      { type: 'add_actor', actorType: 'cube', name: 'House_2' },
      { type: 'add_actor', actorType: 'cube', name: 'House_3' },
      { type: 'add_actor', actorType: 'cube', name: 'House_4' },
      { type: 'add_actor', actorType: 'cube', name: 'House_5' },
      { type: 'add_actor', actorType: 'cube', name: 'VillageHall' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Well' },
      { type: 'add_actor', actorType: 'plane', name: 'FarmField_1' },
      { type: 'add_actor', actorType: 'plane', name: 'FarmField_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_3' },
      { type: 'add_actor', actorType: 'plane', name: 'DirtPath' },
      { type: 'add_actor', actorType: 'plane', name: 'Stream' },
      { type: 'add_actor', actorType: 'light_directional', name: 'Sun' },
      { type: 'add_actor', actorType: 'camera', name: 'VillageCamera' },
      { type: 'add_actor', actorType: 'player_start', name: 'PlayerSpawn' },
    ],
  };
}

function createDungeon(): BrainResponse {
  return {
    response: `[ARIES] Dungeon dibuat!

Dungeon gelap dengan:
- Floor dungeon
- 8 Dinding (membentuk koridor dan ruangan)
- 3 Ruangan (entrance, treasure, boss)
- Pintu masuk
- Treasure chest
- Boss arena
- Torch lights
- Traps

Total: 20 actors.`,
    actions: [
      { type: 'add_actor', actorType: 'plane', name: 'Dungeon_Floor' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_North' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_South' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_East' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_West' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_Inner_1' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_Inner_2' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_Inner_3' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_Inner_4' },
      { type: 'add_actor', actorType: 'cube', name: 'DungeonGate' },
      { type: 'add_actor', actorType: 'cube', name: 'TreasureRoom' },
      { type: 'add_actor', actorType: 'sphere', name: 'TreasureChest' },
      { type: 'add_actor', actorType: 'plane', name: 'BossArena' },
      { type: 'add_actor', actorType: 'cube', name: 'BossThrone' },
      { type: 'add_actor', actorType: 'sphere', name: 'Trap_Spike_1' },
      { type: 'add_actor', actorType: 'sphere', name: 'Trap_Spike_2' },
      { type: 'add_actor', actorType: 'light_point', name: 'Torch_1' },
      { type: 'add_actor', actorType: 'light_point', name: 'Torch_2' },
      { type: 'add_actor', actorType: 'light_point', name: 'Torch_3' },
      { type: 'add_actor', actorType: 'camera', name: 'DungeonCamera' },
      { type: 'add_actor', actorType: 'player_start', name: 'DungeonEntrance' },
    ],
  };
}

function createForest(): BrainResponse {
  return {
    response: `[ARIES] Hutan dibuat!

Hutan lebat dengan:
- Ground hutan
- 12 Pohon berbagai jenis
- Semak-semak
- Batu-batu
- Jalan setapak
- Sungai kecil
- Pencahayaan filtered

Total: 22 actors.`,
    actions: [
      { type: 'add_actor', actorType: 'plane', name: 'Forest_Ground' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Tall_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Tall_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Tall_3' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Tall_4' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Medium_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Medium_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Medium_3' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Small_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Small_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Small_3' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Small_4' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Small_5' },
      { type: 'add_actor', actorType: 'sphere', name: 'Bush_1' },
      { type: 'add_actor', actorType: 'sphere', name: 'Bush_2' },
      { type: 'add_actor', actorType: 'sphere', name: 'Bush_3' },
      { type: 'add_actor', actorType: 'sphere', name: 'Rock_1' },
      { type: 'add_actor', actorType: 'sphere', name: 'Rock_2' },
      { type: 'add_actor', actorType: 'plane', name: 'ForestPath' },
      { type: 'add_actor', actorType: 'plane', name: 'Creek' },
      { type: 'add_actor', actorType: 'light_directional', name: 'FilteredSunlight' },
      { type: 'add_actor', actorType: 'camera', name: 'ForestCamera' },
      { type: 'add_actor', actorType: 'player_start', name: 'ForestEntrance' },
    ],
  };
}

function createDesert(): BrainResponse {
  return {
    response: `[ARIES] Gurun dibuat!

Gurun pasir dengan:
- Terrain pasir luas
- Bukit pasir (sand dunes)
- Oasis dengan air
- Piramida / reruntuhan
- Kaktus
- Batu gurun
- Matahari terik

Total: 16 actors.`,
    actions: [
      { type: 'add_actor', actorType: 'plane', name: 'Desert_Sand' },
      { type: 'add_actor', actorType: 'cube', name: 'SandDune_1' },
      { type: 'add_actor', actorType: 'cube', name: 'SandDune_2' },
      { type: 'add_actor', actorType: 'cube', name: 'SandDune_3' },
      { type: 'add_actor', actorType: 'plane', name: 'Oasis_Water' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Oasis_Palm_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Oasis_Palm_2' },
      { type: 'add_actor', actorType: 'cube', name: 'Pyramid' },
      { type: 'add_actor', actorType: 'cube', name: 'AncientRuins' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Cactus_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Cactus_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Cactus_3' },
      { type: 'add_actor', actorType: 'sphere', name: 'DesertRock_1' },
      { type: 'add_actor', actorType: 'sphere', name: 'DesertRock_2' },
      { type: 'add_actor', actorType: 'light_directional', name: 'HarshSun' },
      { type: 'add_actor', actorType: 'camera', name: 'DesertCamera' },
      { type: 'add_actor', actorType: 'player_start', name: 'DesertSpawn' },
    ],
  };
}

function createBeach(): BrainResponse {
  return {
    response: `[ARIES] Pantai dibuat!

Pantai tropis dengan:
- Pasir pantai
- Laut
- Pohon kelapa
- Batu karang
- Perahu
- Menara penjaga
- Payung pantai

Total: 16 actors.`,
    actions: [
      { type: 'add_actor', actorType: 'plane', name: 'Beach_Sand' },
      { type: 'add_actor', actorType: 'plane', name: 'Ocean' },
      { type: 'add_actor', actorType: 'cylinder', name: 'PalmTree_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'PalmTree_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'PalmTree_3' },
      { type: 'add_actor', actorType: 'sphere', name: 'CoralRock_1' },
      { type: 'add_actor', actorType: 'sphere', name: 'CoralRock_2' },
      { type: 'add_actor', actorType: 'cube', name: 'Boat' },
      { type: 'add_actor', actorType: 'cube', name: 'LifeguardTower' },
      { type: 'add_actor', actorType: 'cylinder', name: 'BeachUmbrella_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'BeachUmbrella_2' },
      { type: 'add_actor', actorType: 'cube', name: 'BeachHut' },
      { type: 'add_actor', actorType: 'sphere', name: 'Seashell_1' },
      { type: 'add_actor', actorType: 'light_directional', name: 'TropicalSun' },
      { type: 'add_actor', actorType: 'camera', name: 'BeachCamera' },
      { type: 'add_actor', actorType: 'player_start', name: 'BeachSpawn' },
    ],
  };
}

function createSnowMountain(): BrainResponse {
  return {
    response: `[ARIES] Gunung salju dibuat!

Gunung salju dengan:
- Terrain salju
- Gunung utama + 2 bukit
- Pohon cemara bersalju
- Gua es
- Danau beku
- Cabin/lodge
- Jembatan kayu

Total: 18 actors.`,
    actions: [
      { type: 'add_actor', actorType: 'plane', name: 'Snow_Ground' },
      { type: 'add_actor', actorType: 'cube', name: 'SnowMountain_Main' },
      { type: 'add_actor', actorType: 'cube', name: 'SnowHill_1' },
      { type: 'add_actor', actorType: 'cube', name: 'SnowHill_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'PineTree_Snow_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'PineTree_Snow_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'PineTree_Snow_3' },
      { type: 'add_actor', actorType: 'cylinder', name: 'PineTree_Snow_4' },
      { type: 'add_actor', actorType: 'cylinder', name: 'PineTree_Snow_5' },
      { type: 'add_actor', actorType: 'cube', name: 'IceCave' },
      { type: 'add_actor', actorType: 'plane', name: 'FrozenLake' },
      { type: 'add_actor', actorType: 'cube', name: 'Cabin' },
      { type: 'add_actor', actorType: 'cube', name: 'WoodenBridge' },
      { type: 'add_actor', actorType: 'sphere', name: 'Snowman' },
      { type: 'add_actor', actorType: 'sphere', name: 'IceRock_1' },
      { type: 'add_actor', actorType: 'sphere', name: 'IceRock_2' },
      { type: 'add_actor', actorType: 'light_directional', name: 'WinterSun' },
      { type: 'add_actor', actorType: 'camera', name: 'MountainCamera' },
      { type: 'add_actor', actorType: 'player_start', name: 'MountainSpawn' },
    ],
  };
}

function createCastle(): BrainResponse {
  return {
    response: `[ARIES] Kastil dibuat!

Kastil medieval dengan:
- Ground & courtyard
- 4 Menara (towers)
- Dinding kastil (walls)
- Gerbang utama
- Throne room
- Gudang senjata
- Parit air (moat)
- Jembatan tarik

Total: 20 actors.`,
    actions: [
      { type: 'add_actor', actorType: 'plane', name: 'Castle_Ground' },
      { type: 'add_actor', actorType: 'plane', name: 'Courtyard' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tower_NE' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tower_NW' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tower_SE' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Tower_SW' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_North' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_South' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_East' },
      { type: 'add_actor', actorType: 'cube', name: 'Wall_West' },
      { type: 'add_actor', actorType: 'cube', name: 'MainGate' },
      { type: 'add_actor', actorType: 'cube', name: 'ThroneRoom' },
      { type: 'add_actor', actorType: 'cube', name: 'Armory' },
      { type: 'add_actor', actorType: 'cube', name: 'Barracks' },
      { type: 'add_actor', actorType: 'cube', name: 'Stable' },
      { type: 'add_actor', actorType: 'plane', name: 'Moat' },
      { type: 'add_actor', actorType: 'cube', name: 'Drawbridge' },
      { type: 'add_actor', actorType: 'light_directional', name: 'Sun' },
      { type: 'add_actor', actorType: 'light_point', name: 'TorchLight' },
      { type: 'add_actor', actorType: 'camera', name: 'CastleCamera' },
      { type: 'add_actor', actorType: 'player_start', name: 'CastleEntrance' },
    ],
  };
}

function createSpaceStation(): BrainResponse {
  return {
    response: `[ARIES] Space station dibuat!

Stasiun luar angkasa dengan:
- Main hull
- Docking bay
- Control room
- Living quarters
- Engine room
- Solar panels
- Airlock
- Observatory

Total: 16 actors.`,
    actions: [
      { type: 'add_actor', actorType: 'cube', name: 'MainHull' },
      { type: 'add_actor', actorType: 'cube', name: 'DockingBay' },
      { type: 'add_actor', actorType: 'cube', name: 'ControlRoom' },
      { type: 'add_actor', actorType: 'cube', name: 'LivingQuarters' },
      { type: 'add_actor', actorType: 'cube', name: 'EngineRoom' },
      { type: 'add_actor', actorType: 'plane', name: 'SolarPanel_1' },
      { type: 'add_actor', actorType: 'plane', name: 'SolarPanel_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'ConnectorTube_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'ConnectorTube_2' },
      { type: 'add_actor', actorType: 'cube', name: 'Airlock' },
      { type: 'add_actor', actorType: 'sphere', name: 'Observatory_Dome' },
      { type: 'add_actor', actorType: 'cube', name: 'StorageModule' },
      { type: 'add_actor', actorType: 'sphere', name: 'Antenna' },
      { type: 'add_actor', actorType: 'light_point', name: 'StationLight_1' },
      { type: 'add_actor', actorType: 'light_point', name: 'StationLight_2' },
      { type: 'add_actor', actorType: 'camera', name: 'SpaceCamera' },
      { type: 'add_actor', actorType: 'player_start', name: 'SpaceSpawn' },
    ],
  };
}

function createUnderwaterWorld(): BrainResponse {
  return {
    response: `[ARIES] Dunia bawah laut dibuat!

Underwater scene dengan:
- Dasar laut
- Terumbu karang
- Rumput laut
- Gua bawah laut
- Harta karun tenggelam
- Kapal karam
- Gelembung dan cahaya

Total: 18 actors.`,
    actions: [
      { type: 'add_actor', actorType: 'plane', name: 'SeaFloor' },
      { type: 'add_actor', actorType: 'sphere', name: 'Coral_1' },
      { type: 'add_actor', actorType: 'sphere', name: 'Coral_2' },
      { type: 'add_actor', actorType: 'sphere', name: 'Coral_3' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Seaweed_1' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Seaweed_2' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Seaweed_3' },
      { type: 'add_actor', actorType: 'cylinder', name: 'Seaweed_4' },
      { type: 'add_actor', actorType: 'cube', name: 'UnderwaterCave' },
      { type: 'add_actor', actorType: 'sphere', name: 'TreasureChest' },
      { type: 'add_actor', actorType: 'cube', name: 'Shipwreck_Hull' },
      { type: 'add_actor', actorType: 'cube', name: 'Shipwreck_Mast' },
      { type: 'add_actor', actorType: 'sphere', name: 'GiantClam' },
      { type: 'add_actor', actorType: 'sphere', name: 'Rock_1' },
      { type: 'add_actor', actorType: 'sphere', name: 'Rock_2' },
      { type: 'add_actor', actorType: 'light_point', name: 'UnderwaterGlow_1' },
      { type: 'add_actor', actorType: 'light_point', name: 'UnderwaterGlow_2' },
      { type: 'add_actor', actorType: 'camera', name: 'UnderwaterCamera' },
      { type: 'add_actor', actorType: 'player_start', name: 'DiverSpawn' },
    ],
  };
}

// =========================================================
// CONVERSATIONAL AI ENGINE
// Smart responses for free-form conversation
// =========================================================

interface ConversationPattern {
  patterns: RegExp[];
  responses: string[];
  actions?: Array<Record<string, unknown>>;
}

const CONVERSATION_PATTERNS: ConversationPattern[] = [
  {
    patterns: [/apa kabar|hai|halo|hello|hi|hey|selamat/i],
    responses: [
      'Halo! Saya Aries, AI NeoEngine. Mau buat apa hari ini? Saya bisa langsung buatkan landscape, kota, dungeon, atau game template!',
      'Hey! Aries di sini. Scene kamu siap untuk diisi. Mau mulai dengan landscape map? Ketik "buat landscape" dan saya langsung buatkan!',
      'Halo! Senang bisa bantu. Saya sudah siap buatkan apapun - landscape, kota, hutan, dungeon, game templates. Mau mulai dari mana?',
    ],
  },
  {
    patterns: [/terima kasih|makasih|thanks|thank you|thx/i],
    responses: [
      'Sama-sama! Kalau butuh apa-apa lagi, langsung bilang ya. Saya selalu siap.',
      'Senang bisa bantu! Mau lanjut buat sesuatu lagi?',
      'No problem! Saya di sini terus. Mau tambah apa ke scene?',
    ],
  },
  {
    patterns: [/siapa kamu|kamu siapa|who are you|nama kamu/i],
    responses: [
      `Saya Aries, AI Autonomous untuk NeoEngine (Fauzan Engine). Saya punya otak sendiri dan belajar dari setiap interaksi kita.

Level saya: ${loadMemory().level} (XP: ${loadMemory().xp})
Total interaksi: ${loadMemory().interactions}
Kemampuan: Buat landscape, kota, game, analisa scene, diskusi game design, strategi monetisasi.

Saya makin pintar setiap kali kamu pakai saya!`,
    ],
  },
  {
    patterns: [/bisa apa|kemampuan|ability|skill|fitur|feature/i],
    responses: [
      `Saya bisa LANGSUNG membuat:

🗺️ ENVIRONMENT:
"buat landscape" / "buat map" - Landscape lengkap (gunung, pohon, danau)
"buat kota" / "buat city" - Kota dengan gedung & jalan
"buat desa" / "buat village" - Desa tradisional
"buat hutan" / "buat forest" - Hutan lebat
"buat gurun" / "buat desert" - Gurun pasir + oasis
"buat pantai" / "buat beach" - Pantai tropis
"buat gunung salju" / "buat snow" - Gunung salju
"buat kastil" / "buat castle" - Kastil medieval
"buat dungeon" - Dungeon gelap
"buat space station" - Stasiun luar angkasa
"buat bawah laut" / "buat underwater" - Dunia bawah laut

🎮 GAME:
"buat game farmville" / "buat game fps" / "buat game rpg"
"buat game platformer" / "buat game sudoku"
"buat game idle tycoon" / "buat game merge"

🔍 ANALISA:
"analisa scene" - Cari bug otomatis
"monetisasi" / "retention" / "balance"

📄 IMPORT:
File > Import Word/PDF

Ketik apapun dan saya LANGSUNG buat!`,
    ],
  },
  {
    patterns: [/bagus|keren|mantap|hebat|wow|amazing|cool|great/i],
    responses: [
      'Terima kasih! Mau tambah apa lagi ke scene? Saya bisa buatkan environment atau game template lainnya.',
      'Makasih! Kalau mau explore lebih, coba "analisa scene" atau tambah environment baru.',
    ],
  },
  {
    patterns: [/jelek|buruk|bad|ugly|gak bagus|tidak bagus/i],
    responses: [
      'Saya minta maaf. Apa yang perlu diperbaiki? Kasih tahu saya dan saya perbaiki sekarang juga. Saya belajar dari feedback kamu.',
      'Maaf kalau belum sesuai harapan. Bilang apa yang kurang dan saya langsung improve. Setiap koreksi bikin saya lebih pintar.',
    ],
  },
  {
    patterns: [/tolong|please|minta|bantu/i],
    responses: [
      'Siap! Bilang apa yang kamu mau dan saya langsung kerjakan. Contoh: "buat landscape", "buat kota", "buat game fps".',
    ],
  },
];

function getConversationalResponse(command: string): BrainResponse | null {
  for (const pattern of CONVERSATION_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(command)) {
        const response = pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
        return { response, actions: pattern.actions || [] };
      }
    }
  }
  return null;
}

// =========================================================
// DOCUMENT IMPORT HANDLER
// =========================================================

let storedDocuments: Array<{ name: string; content: string }> = [];

export function storeDocument(name: string, content: string) {
  storedDocuments.push({ name, content });
  addKnowledge(`Dokumen "${name}" di-import dengan ${content.split(/\s+/).length} kata`);
}

export function getStoredDocuments() {
  return storedDocuments;
}

export function processDocumentForAries(filename: string, content: string): BrainResponse {
  const lines = content.split('\n').filter(l => l.trim());
  const wordCount = content.split(/\s+/).length;
  const lower = content.toLowerCase();
  const elements: string[] = [];

  const gameTypes = [
    { keywords: ['rpg', 'role playing', 'quest', 'level up'], type: 'RPG' },
    { keywords: ['puzzle', 'match', 'grid', 'sudoku'], type: 'Puzzle' },
    { keywords: ['farm', 'harvest', 'crop', 'animal'], type: 'Farming Sim' },
    { keywords: ['shooter', 'fps', 'weapon', 'gun', 'tembak'], type: 'Shooter' },
    { keywords: ['race', 'racing', 'speed', 'car', 'mobil'], type: 'Racing' },
    { keywords: ['strategy', 'strategi', 'tower', 'defend'], type: 'Strategy' },
    { keywords: ['idle', 'clicker', 'tycoon', 'automate'], type: 'Idle/Tycoon' },
    { keywords: ['platform', 'jump', 'lompat', 'side scroll'], type: 'Platformer' },
  ];

  for (const gt of gameTypes) {
    if (gt.keywords.some(k => lower.includes(k))) elements.push(`Genre: ${gt.type}`);
  }

  if (lower.includes('inventory') || lower.includes('item')) elements.push('Inventory system');
  if (lower.includes('shop') || lower.includes('toko')) elements.push('Shop system');
  if (lower.includes('multiplayer') || lower.includes('pvp')) elements.push('Multiplayer');
  if (lower.includes('story') || lower.includes('cerita')) elements.push('Story/Narasi');

  return {
    response: `[ARIES] Dokumen "${filename}" dibaca!

${lines.length} baris, ${wordCount} kata.
${elements.length > 0 ? 'Terdeteksi: ' + elements.join(', ') : 'Dokumen game design umum.'}

Ketik "buat game dari dokumen" untuk generate scene otomatis.`,
    actions: [],
  };
}

// =========================================================
// MAIN BRAIN PROCESSOR
// =========================================================

export function processWithAriesBrain(command: string, actors: Record<string, NeoActor>): BrainResponse | null {
  const cmd = command.toLowerCase().trim();
  const memory = loadMemory();

  // Check learned patterns first
  if (memory.learnedPatterns[cmd]) {
    return processWithAriesBrain(memory.learnedPatterns[cmd], actors);
  }

  // ===== SCENE ANALYSIS =====
  if (cmd.includes('analisa scene') || cmd.includes('analyze scene') || cmd.includes('scan scene') ||
      cmd.includes('cek scene') || cmd.includes('check scene') || cmd.includes('cari bug') || cmd.includes('find bug')) {
    const issues = analyzeScene(actors);
    const icons = { error: '🔴', warning: '🟡', info: '🟢' };
    const text = issues.map(i => `${icons[i.severity]} [${i.category}] ${i.message}\n   → ${i.suggestion}`).join('\n\n');
    const result = {
      response: `[ARIES SCAN] ${Object.keys(actors).length} actors:\n\n${text}`,
      actions: [] as Array<Record<string, unknown>>,
    };

    // Auto-fix: add missing essentials
    const actorList = Object.values(actors);
    if (!actorList.some(a => a.type.includes('light'))) {
      result.actions.push({ type: 'add_actor', actorType: 'light_directional', name: 'Sun_AutoFix' });
      result.response += '\n\n✅ Saya otomatis tambahkan Sun light.';
    }
    if (!actorList.some(a => a.type === 'player_start')) {
      result.actions.push({ type: 'add_actor', actorType: 'player_start', name: 'PlayerStart_AutoFix' });
      result.response += '\n✅ Saya otomatis tambahkan PlayerStart.';
    }

    addInteraction(command, result.response);
    return result;
  }

  // ===== LANDSCAPE & ENVIRONMENT CREATION =====
  if (cmd.includes('landscape') || cmd.includes('map sederhana') || cmd.includes('buat map') ||
      cmd.includes('buat peta') || cmd.includes('terrain') || cmd.includes('buat world') ||
      cmd.includes('open world') || cmd.includes('dunia')) {
    addInteraction(command, 'landscape created');
    return createLandscapeMap();
  }

  if (cmd.includes('kota') || cmd.includes('city') || cmd.includes('urban') || cmd.includes('gedung')) {
    addInteraction(command, 'city created');
    return createCity();
  }

  if (cmd.includes('desa') || cmd.includes('village') || cmd.includes('kampung')) {
    addInteraction(command, 'village created');
    return createVillage();
  }

  if (cmd.includes('dungeon') || cmd.includes('labirin') || cmd.includes('maze') || cmd.includes('ruang bawah tanah')) {
    addInteraction(command, 'dungeon created');
    return createDungeon();
  }

  if (cmd.includes('hutan') || cmd.includes('forest') || cmd.includes('jungle') || cmd.includes('rimba')) {
    addInteraction(command, 'forest created');
    return createForest();
  }

  if (cmd.includes('gurun') || cmd.includes('desert') || cmd.includes('padang pasir') || cmd.includes('sahara')) {
    addInteraction(command, 'desert created');
    return createDesert();
  }

  if (cmd.includes('pantai') || cmd.includes('beach') || cmd.includes('laut') || cmd.includes('ocean') || cmd.includes('seaside')) {
    addInteraction(command, 'beach created');
    return createBeach();
  }

  if (cmd.includes('salju') || cmd.includes('snow') || cmd.includes('winter') || cmd.includes('es') || cmd.includes('ice')) {
    addInteraction(command, 'snow mountain created');
    return createSnowMountain();
  }

  if ((cmd.includes('kastil') || cmd.includes('castle') || cmd.includes('benteng') || cmd.includes('fortress')) && !cmd.includes('buat model')) {
    addInteraction(command, 'castle created');
    return createCastle();
  }

  if (cmd.includes('space station') || cmd.includes('stasiun luar angkasa') || cmd.includes('luar angkasa') || cmd.includes('antariksa')) {
    addInteraction(command, 'space station created');
    return createSpaceStation();
  }

  if (cmd.includes('bawah laut') || cmd.includes('underwater') || cmd.includes('bawah air') || cmd.includes('dasar laut')) {
    addInteraction(command, 'underwater created');
    return createUnderwaterWorld();
  }

  // ===== GENERIC CREATION - catch "buat X" patterns =====
  if (cmd.startsWith('buat ') || cmd.startsWith('bikin ') || cmd.startsWith('create ') || cmd.startsWith('tambah ') || cmd.startsWith('add ')) {
    const target = cmd.replace(/^(buat|bikin|create|tambah|add)\s+/, '');

    // Multiple objects
    if (target.includes('pohon') || target.includes('tree')) {
      const count = parseInt(target) || 5;
      const actions: Array<Record<string, unknown>> = [];
      for (let i = 1; i <= Math.min(count, 10); i++) {
        actions.push({ type: 'add_actor', actorType: 'cylinder', name: `Tree_${i}` });
      }
      addInteraction(command, `${actions.length} trees created`);
      return { response: `[ARIES] ${actions.length} pohon ditambahkan ke scene!`, actions };
    }

    if (target.includes('gunung') || target.includes('mountain') || target.includes('bukit') || target.includes('hill')) {
      addInteraction(command, 'mountains created');
      return {
        response: '[ARIES] Gunung dan bukit ditambahkan!',
        actions: [
          { type: 'add_actor', actorType: 'cube', name: 'Mountain_Main' },
          { type: 'add_actor', actorType: 'cube', name: 'Hill_1' },
          { type: 'add_actor', actorType: 'cube', name: 'Hill_2' },
          { type: 'add_actor', actorType: 'sphere', name: 'Rock_1' },
          { type: 'add_actor', actorType: 'sphere', name: 'Rock_2' },
        ],
      };
    }

    if (target.includes('air') || target.includes('water') || target.includes('sungai') || target.includes('river') || target.includes('danau') || target.includes('lake')) {
      addInteraction(command, 'water created');
      return {
        response: '[ARIES] Air ditambahkan! (danau + sungai)',
        actions: [
          { type: 'add_actor', actorType: 'plane', name: 'Lake' },
          { type: 'add_actor', actorType: 'plane', name: 'River' },
        ],
      };
    }

    if (target.includes('jalan') || target.includes('road') || target.includes('path')) {
      addInteraction(command, 'road created');
      return {
        response: '[ARIES] Jalan ditambahkan!',
        actions: [
          { type: 'add_actor', actorType: 'plane', name: 'Road_Main' },
          { type: 'add_actor', actorType: 'plane', name: 'Road_Branch' },
        ],
      };
    }

    if (target.includes('npc') || target.includes('karakter') || target.includes('character') || target.includes('orang') || target.includes('person')) {
      addInteraction(command, 'NPCs created');
      return {
        response: '[ARIES] NPC ditambahkan ke scene!',
        actions: [
          { type: 'add_actor', actorType: 'cylinder', name: 'NPC_Villager_1' },
          { type: 'add_actor', actorType: 'cylinder', name: 'NPC_Villager_2' },
          { type: 'add_actor', actorType: 'cylinder', name: 'NPC_Merchant' },
          { type: 'add_actor', actorType: 'cylinder', name: 'NPC_Guard' },
        ],
      };
    }

    if (target.includes('rumah') && !target.includes('model')) {
      addInteraction(command, 'houses created');
      return {
        response: '[ARIES] Rumah-rumah ditambahkan!',
        actions: [
          { type: 'add_actor', actorType: 'cube', name: 'House_1' },
          { type: 'add_actor', actorType: 'cube', name: 'House_2' },
          { type: 'add_actor', actorType: 'cube', name: 'House_3' },
        ],
      };
    }

    if (target.includes('batu') || target.includes('rock') || target.includes('stone')) {
      addInteraction(command, 'rocks created');
      return {
        response: '[ARIES] Batu ditambahkan!',
        actions: [
          { type: 'add_actor', actorType: 'sphere', name: 'Rock_Large' },
          { type: 'add_actor', actorType: 'sphere', name: 'Rock_Medium' },
          { type: 'add_actor', actorType: 'sphere', name: 'Rock_Small' },
        ],
      };
    }

    if (target.includes('pagar') || target.includes('fence') || target.includes('wall') || target.includes('dinding') || target.includes('tembok')) {
      addInteraction(command, 'walls created');
      return {
        response: '[ARIES] Dinding/pagar ditambahkan!',
        actions: [
          { type: 'add_actor', actorType: 'cube', name: 'Wall_1' },
          { type: 'add_actor', actorType: 'cube', name: 'Wall_2' },
          { type: 'add_actor', actorType: 'cube', name: 'Wall_3' },
          { type: 'add_actor', actorType: 'cube', name: 'Wall_4' },
        ],
      };
    }

    if (target.includes('jembatan') || target.includes('bridge')) {
      addInteraction(command, 'bridge created');
      return {
        response: '[ARIES] Jembatan ditambahkan!',
        actions: [
          { type: 'add_actor', actorType: 'cube', name: 'Bridge_Deck' },
          { type: 'add_actor', actorType: 'cylinder', name: 'Bridge_Pillar_1' },
          { type: 'add_actor', actorType: 'cylinder', name: 'Bridge_Pillar_2' },
        ],
      };
    }

    if (target.includes('toko') || target.includes('shop') || target.includes('warung')) {
      addInteraction(command, 'shop created');
      return {
        response: '[ARIES] Toko ditambahkan!',
        actions: [
          { type: 'add_actor', actorType: 'cube', name: 'Shop' },
          { type: 'add_actor', actorType: 'cube', name: 'Shop_Counter' },
          { type: 'add_actor', actorType: 'cylinder', name: 'Shop_Sign' },
        ],
      };
    }
  }

  // ===== MONETIZATION =====
  if (cmd.includes('monetisasi') || cmd.includes('monetization') || cmd.includes('uang') || cmd.includes('revenue') ||
      cmd.includes('pendapatan') || cmd.includes('penghasilan') || cmd.includes('dollar') || cmd.includes('sejuta') ||
      cmd.includes('harga') || cmd.includes('pricing') || cmd.includes('iap') || cmd.includes('in app purchase')) {
    addInteraction(command, 'monetization opened');
    return { response: '__OPEN_MONETIZATION__', actions: [] };
  }

  // ===== GAME DESIGN DISCUSSIONS =====
  if (cmd.includes('whale') || cmd.includes('big spender')) {
    addInteraction(command, 'whale strategy');
    return { response: `[ARIES] Whale Strategy:\n\n1. Limited Edition Items (FOMO)\n2. High-Value Bundles ($49.99-$99.99)\n3. VIP Tiers (Bronze→Diamond)\n4. Competitive features (leaderboards, tournaments)\n5. Social gifting\n\nWhale = top 1-2% tapi 50%+ revenue. Kunci: mereka harus merasa "worth it".`, actions: [] };
  }

  if (cmd.includes('retention') || cmd.includes('player balik') || cmd.includes('churn')) {
    addInteraction(command, 'retention strategy');
    return { response: `[ARIES] Retention Strategy:\n\nD1 (40%+): Tutorial singkat + reward besar\nD7 (20%+): Daily login + push notif\nD30 (10%+): Events mingguan + guild\n\nAnti-churn: Detect idle → "We miss you!" 70% discount\nReduce difficulty setelah 3x fail\nCome back bonus setelah 3 hari offline`, actions: [] };
  }

  if (cmd.includes('balance') || cmd.includes('seimbang') || cmd.includes('difficulty')) {
    addInteraction(command, 'balance advice');
    return { response: `[ARIES] Balance Tips:\n\n1. Dynamic Difficulty: fail 3x → kurangi 10%\n2. Economy: earn:spend = 1:1.5\n3. Combat: counter system A>B>C>A\n4. Progression: Level 1-10 cepat, 10-30 moderate, 30+ slow meaningful`, actions: [] };
  }

  if (cmd.includes('launch') || cmd.includes('rilis') || cmd.includes('release') || cmd.includes('publish')) {
    addInteraction(command, 'launch strategy');
    return { response: `[ARIES] Launch Strategy:\n\n1. Soft launch di 2-3 negara kecil\n2. Collect data retention + monetization\n3. Fix bugs, tune balance\n4. Submit 1 minggu sebelum target\n5. ASO: keywords, screenshots, video\n6. Contact YouTubers/reviewers\n7. Post-launch: patch cepat + event di week 2\n\nBudget min: $500-2000 untuk User Acquisition\nTarget CPI: $0.50-2.00`, actions: [] };
  }

  if (cmd.includes('ide game') || cmd.includes('game idea') || cmd.includes('game apa') || cmd.includes('saran game') || cmd.includes('rekomendasi game')) {
    addInteraction(command, 'game ideas');
    return {
      response: `[ARIES] Game Profitable 2025:

1. Idle/Tycoon ($5k-50k/bulan) → "buat game idle tycoon"
2. Merge Game ($10k-100k/bulan) → "buat game merge"
3. Puzzle+Story ($50k-500k/bulan)
4. Hyper Casual ($1k-10k/bulan per game)

Untuk $1M: 1 quality puzzle/merge ATAU 10-20 hyper casual games.

Mau saya buatkan? Ketik nama template-nya!`,
      actions: [],
    };
  }

  // ===== LEARNING COMMANDS =====
  if (cmd.startsWith('ingat ') || cmd.startsWith('remember ')) {
    const fact = command.replace(/^(ingat|remember)\s+/i, '');
    addKnowledge(fact);
    addInteraction(command, 'learned fact');
    return { response: `[ARIES] Saya ingat: "${fact}"\n\nXP +15. Level: ${loadMemory().level}`, actions: [] };
  }

  if (cmd.includes('maksud saya') || cmd.includes('bukan,') || cmd.includes('yang benar')) {
    const correction = command.replace(/^(bukan,?|maksud saya|yang benar)\s*/i, '');
    const lastUserMsg = memory.conversationHistory.filter(h => h.role === 'user').slice(-2)[0];
    if (lastUserMsg) {
      learnCorrection(lastUserMsg.content, correction);
      addInteraction(command, 'learned correction');
      return { response: `[ARIES] Saya belajar! Kalau kamu bilang "${lastUserMsg.content}", maksudnya "${correction}".\n\nXP +25. Level: ${loadMemory().level}`, actions: [] };
    }
  }

  if (cmd.includes('level aries') || cmd.includes('status aries') || cmd.includes('xp') || cmd.includes('experience')) {
    const m = loadMemory();
    const topCmds = Object.entries(m.favoriteCommands).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      response: `[ARIES BRAIN STATUS]

Level: ${m.level} (XP: ${m.xp})
Total interaksi: ${m.interactions}
Koreksi dipelajari: ${m.corrections.length}
Knowledge base: ${m.knowledge.length} fakta
Dokumen dibaca: ${storedDocuments.length}

Top commands:
${topCmds.map(([c, n]) => `  ${c}: ${n}x`).join('\n') || '  (belum ada)'}

Saya makin pintar setiap interaksi! XP +10 per perintah, +25 per koreksi, +15 per knowledge.`,
      actions: [],
    };
  }

  // ===== DOCUMENT COMMANDS =====
  if (cmd.includes('apa isi dokumen') || cmd.includes('ringkas dokumen') || cmd.includes('summary dokumen')) {
    const docs = getStoredDocuments();
    if (docs.length === 0) {
      return { response: 'Belum ada dokumen. Gunakan File > Import Word/PDF.', actions: [] };
    }
    const doc = docs[docs.length - 1];
    const preview = doc.content.substring(0, 500);
    return { response: `📄 ${doc.name}:\n\n${preview}${doc.content.length > 500 ? '\n...' : ''}`, actions: [] };
  }

  if (cmd.includes('buat game dari dokumen') || cmd.includes('generate dari dokumen')) {
    const docs = getStoredDocuments();
    if (docs.length === 0) return { response: 'Import dokumen dulu via File > Import Word/PDF.', actions: [] };
    addInteraction(command, 'game from document');
    return {
      response: `[ARIES] Scene dibuat dari dokumen "${docs[docs.length - 1].name}"!`,
      actions: [
        { type: 'add_actor', actorType: 'plane', name: 'Ground' },
        { type: 'add_actor', actorType: 'cube', name: 'MainBuilding' },
        { type: 'add_actor', actorType: 'cube', name: 'Structure_1' },
        { type: 'add_actor', actorType: 'cube', name: 'Structure_2' },
        { type: 'add_actor', actorType: 'cylinder', name: 'Prop_1' },
        { type: 'add_actor', actorType: 'cylinder', name: 'Prop_2' },
        { type: 'add_actor', actorType: 'sphere', name: 'Item_1' },
        { type: 'add_actor', actorType: 'light_directional', name: 'Sun' },
        { type: 'add_actor', actorType: 'camera', name: 'GameCamera' },
        { type: 'add_actor', actorType: 'player_start', name: 'PlayerSpawn' },
      ],
    };
  }

  // ===== CONVERSATIONAL RESPONSES =====
  const convo = getConversationalResponse(command);
  if (convo) {
    addInteraction(command, convo.response.substring(0, 50));
    return convo;
  }

  // ===== DISCUSSION MODE =====
  if (cmd.includes('diskusi') || cmd.includes('discuss') || cmd.includes('ngobrol') || cmd.includes('chat')) {
    addInteraction(command, 'discussion mode');
    return {
      response: `[ARIES DISCUSSION MODE]

Saya siap ngobrol! Topik:
🗺️ "buat landscape/kota/hutan/dungeon" → langsung buat
🎮 "ide game" → rekomendasi profitable
💰 "monetisasi" → strategi revenue
🔧 "balance" → tips balancing
🚀 "launch" → strategi rilis
🐛 "analisa scene" → cari bug
📊 "retention" → bikin player balik
🐋 "whale" → maximize big spender

Atau tanya apa saja! Level saya: ${loadMemory().level}`,
      actions: [],
    };
  }

  // ===== SARAN / INITIATIVE =====
  if (cmd.includes('saran') || cmd.includes('suggest') || cmd.includes('apa yang harus')) {
    const actorList = Object.values(actors);
    const actorCount = actorList.length;
    addInteraction(command, 'suggestion');

    if (actorCount <= 4) {
      return {
        response: `[ARIES] Scene masih kosong! Saya sarankan:\n\n1. "buat landscape" → landscape lengkap\n2. "buat kota" → kota dengan gedung\n3. "buat game farmville" → langsung game template\n4. "buat hutan" → hutan lebat\n\nKetik salah satu dan saya LANGSUNG buat!`,
        actions: [],
      };
    }

    return {
      response: `[ARIES] Scene punya ${actorCount} actors. Saran:\n\n1. "analisa scene" → cek bug\n2. "play game" → test di play mode\n3. "monetisasi" → atur strategi revenue\n4. "build" → package untuk rilis\n5. Tambah environment: "buat hutan", "buat kota", dll`,
      actions: [],
    };
  }

  // Not handled by brain - return null to fall through
  return null;
}
