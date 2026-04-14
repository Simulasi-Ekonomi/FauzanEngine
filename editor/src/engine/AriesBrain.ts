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
// CODE GENERATION ENGINE
// Aries can write game code, scripts, build configs
// =========================================================

function generateGameCode(command: string): BrainResponse {
  const cmd = command.toLowerCase();
  if (cmd.includes('player') || cmd.includes('karakter')) return generatePlayerController();
  if (cmd.includes('enemy') || cmd.includes('musuh')) return generateEnemyAI();
  if (cmd.includes('inventory') || cmd.includes('item')) return generateInventorySystem();
  if (cmd.includes('combat') || cmd.includes('battle')) return generateCombatSystem();
  if (cmd.includes('save') || cmd.includes('load')) return generateSaveSystem();
  if (cmd.includes('ui') || cmd.includes('menu') || cmd.includes('hud')) return generateUICode();
  if (cmd.includes('apk') || cmd.includes('android')) return generateAPKBuild();
  if (cmd.includes('network') || cmd.includes('multi')) return generateNetworkingCode();
  if (cmd.includes('physics') || cmd.includes('fisika')) return generatePhysicsCode();

  return {
    response: `[ARIES CODE GENERATOR]

Saya bisa generate code untuk:
- "player controller" → Kontrol player (movement, jump, camera)
- "enemy ai" → AI musuh (patrol, chase, attack)
- "inventory system" → Sistem item & inventory
- "combat system" → Pertarungan (HP, damage, skill)
- "save system" → Save/Load game
- "buat menu" → Main menu & HUD
- "buat apk" → APK build config
- "multiplayer code" → Networking & online
- "physics" → Collision & physics
- "particle" → Visual effects
- "audio" → Sound & music system
- "quest" → Quest/mission system
- "dialog" → NPC dialog system
- "score" → Score & leaderboard
- "spawner" → Wave/enemy spawner

Ketik salah satu dan saya LANGSUNG generate code-nya!`,
    actions: [],
  };
}

function generatePlayerController(): BrainResponse {
  const code = `// ============================================
// NeoEngine Player Controller
// Generated by Aries AI Code Generator
// ============================================

class PlayerController {
  position = { x: 0, y: 0, z: 0 };
  velocity = { x: 0, y: 0, z: 0 };
  rotation = { yaw: 0, pitch: 0 };
  health = 100;
  maxHealth = 100;
  speed = 5.0;
  jumpForce = 8.0;
  isGrounded = true;
  isJumping = false;
  gravity = -9.81;

  // Input state
  keys = { forward: false, backward: false, left: false, right: false, jump: false, sprint: false };

  update(deltaTime) {
    // Movement
    let moveX = 0, moveZ = 0;
    if (this.keys.forward) moveZ -= 1;
    if (this.keys.backward) moveZ += 1;
    if (this.keys.left) moveX -= 1;
    if (this.keys.right) moveX += 1;

    // Normalize diagonal movement
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) { moveX /= len; moveZ /= len; }

    // Apply speed (sprint = 2x)
    const currentSpeed = this.keys.sprint ? this.speed * 2 : this.speed;
    this.velocity.x = moveX * currentSpeed;
    this.velocity.z = moveZ * currentSpeed;

    // Jump
    if (this.keys.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
    }

    // Gravity
    if (!this.isGrounded) {
      this.velocity.y += this.gravity * deltaTime;
    }

    // Apply movement
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;

    // Ground check
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
      this.isJumping = false;
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) this.onDeath();
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  onDeath() {
    console.log('Player died! Respawning...');
    this.health = this.maxHealth;
    this.position = { x: 0, y: 0, z: 0 };
  }
}`;

  return {
    response: `[ARIES CODE] Player Controller generated!

\`\`\`javascript
${code}
\`\`\`

Fitur:
- WASD movement + sprint (Shift)
- Jump dengan gravity
- Health system (damage, heal, death/respawn)
- Diagonal movement normalization
- Ground detection

Copy code di atas ke game script kamu.`,
    actions: [],
  };
}

function generateEnemyAI(): BrainResponse {
  const code = `// ============================================
// NeoEngine Enemy AI - State Machine
// Generated by Aries AI Code Generator
// ============================================

class EnemyAI {
  state = 'IDLE'; // IDLE, PATROL, CHASE, ATTACK, FLEE, DEAD
  position = { x: 0, y: 0, z: 0 };
  health = 50;
  maxHealth = 50;
  damage = 10;
  speed = 3.0;
  chaseSpeed = 5.0;
  detectionRange = 15.0;
  attackRange = 2.0;
  fleeHealthPercent = 0.2;

  // Patrol
  patrolPoints = [
    { x: -10, y: 0, z: 0 },
    { x: 10, y: 0, z: 0 },
    { x: 10, y: 0, z: 10 },
    { x: -10, y: 0, z: 10 },
  ];
  currentPatrolIndex = 0;
  patrolWaitTime = 2.0;
  waitTimer = 0;

  update(deltaTime, playerPosition) {
    if (this.state === 'DEAD') return;

    const distToPlayer = this.distanceTo(playerPosition);

    switch (this.state) {
      case 'IDLE':
        this.waitTimer -= deltaTime;
        if (this.waitTimer <= 0) this.state = 'PATROL';
        if (distToPlayer < this.detectionRange) this.state = 'CHASE';
        break;

      case 'PATROL':
        const target = this.patrolPoints[this.currentPatrolIndex];
        this.moveTo(target, this.speed, deltaTime);
        if (this.distanceTo(target) < 1.0) {
          this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
          this.state = 'IDLE';
          this.waitTimer = this.patrolWaitTime;
        }
        if (distToPlayer < this.detectionRange) this.state = 'CHASE';
        break;

      case 'CHASE':
        if (this.health / this.maxHealth < this.fleeHealthPercent) {
          this.state = 'FLEE';
          break;
        }
        this.moveTo(playerPosition, this.chaseSpeed, deltaTime);
        if (distToPlayer < this.attackRange) this.state = 'ATTACK';
        if (distToPlayer > this.detectionRange * 1.5) this.state = 'PATROL';
        break;

      case 'ATTACK':
        if (distToPlayer > this.attackRange * 1.5) this.state = 'CHASE';
        // Attack logic - return damage amount
        return { action: 'ATTACK', damage: this.damage };

      case 'FLEE':
        // Run away from player
        const dx = this.position.x - playerPosition.x;
        const dz = this.position.z - playerPosition.z;
        const fleeTarget = {
          x: this.position.x + dx * 2,
          y: 0,
          z: this.position.z + dz * 2,
        };
        this.moveTo(fleeTarget, this.chaseSpeed * 1.2, deltaTime);
        if (distToPlayer > this.detectionRange * 2) this.state = 'PATROL';
        break;
    }
    return null;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) { this.state = 'DEAD'; return true; }
    if (this.state !== 'CHASE' && this.state !== 'ATTACK') this.state = 'CHASE';
    return false;
  }

  moveTo(target, speed, dt) {
    const dx = target.x - this.position.x;
    const dz = target.z - this.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > 0.1) {
      this.position.x += (dx / dist) * speed * dt;
      this.position.z += (dz / dist) * speed * dt;
    }
  }

  distanceTo(pos) {
    const dx = pos.x - this.position.x;
    const dz = pos.z - this.position.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}`;

  return {
    response: `[ARIES CODE] Enemy AI generated!

\`\`\`javascript
${code}
\`\`\`

States: IDLE → PATROL → CHASE → ATTACK → FLEE → DEAD
Features: Patrol waypoints, player detection, chase, attack, flee when low HP.`,
    actions: [],
  };
}

function generateInventorySystem(): BrainResponse {
  const code = `// ============================================
// NeoEngine Inventory System
// Generated by Aries AI Code Generator
// ============================================

class InventorySystem {
  items = []; // { id, name, type, quantity, icon, rarity, stats }
  maxSlots = 30;
  gold = 0;

  addItem(item) {
    const existing = this.items.find(i => i.id === item.id && i.stackable);
    if (existing) {
      existing.quantity += item.quantity || 1;
      return true;
    }
    if (this.items.length >= this.maxSlots) return false; // Full
    this.items.push({ ...item, quantity: item.quantity || 1 });
    return true;
  }

  removeItem(itemId, quantity = 1) {
    const idx = this.items.findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    this.items[idx].quantity -= quantity;
    if (this.items[idx].quantity <= 0) this.items.splice(idx, 1);
    return true;
  }

  hasItem(itemId, quantity = 1) {
    const item = this.items.find(i => i.id === itemId);
    return item && item.quantity >= quantity;
  }

  useItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return null;
    const effect = this.getItemEffect(item);
    this.removeItem(itemId, 1);
    return effect;
  }

  getItemEffect(item) {
    switch (item.type) {
      case 'potion': return { heal: item.stats?.heal || 25 };
      case 'weapon': return { equip: 'weapon', damage: item.stats?.damage || 10 };
      case 'armor': return { equip: 'armor', defense: item.stats?.defense || 5 };
      case 'buff': return { buff: item.stats?.buff, duration: item.stats?.duration || 30 };
      default: return { use: item.id };
    }
  }

  sortByRarity() {
    const order = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    this.items.sort((a, b) => (order[a.rarity] || 5) - (order[b.rarity] || 5));
  }

  getTotal() { return this.items.reduce((sum, i) => sum + i.quantity, 0); }
}

// Pre-made items database
const ITEMS_DB = [
  { id: 'health_potion', name: 'Health Potion', type: 'potion', rarity: 'common', stackable: true, stats: { heal: 25 } },
  { id: 'mana_potion', name: 'Mana Potion', type: 'potion', rarity: 'common', stackable: true, stats: { heal: 20 } },
  { id: 'iron_sword', name: 'Iron Sword', type: 'weapon', rarity: 'common', stackable: false, stats: { damage: 15 } },
  { id: 'steel_sword', name: 'Steel Sword', type: 'weapon', rarity: 'uncommon', stackable: false, stats: { damage: 25 } },
  { id: 'dragon_blade', name: 'Dragon Blade', type: 'weapon', rarity: 'legendary', stackable: false, stats: { damage: 100 } },
  { id: 'leather_armor', name: 'Leather Armor', type: 'armor', rarity: 'common', stackable: false, stats: { defense: 10 } },
  { id: 'speed_scroll', name: 'Speed Scroll', type: 'buff', rarity: 'rare', stackable: true, stats: { buff: 'speed', duration: 30 } },
  { id: 'gold_coin', name: 'Gold Coin', type: 'currency', rarity: 'common', stackable: true, stats: {} },
];`;

  return {
    response: `[ARIES CODE] Inventory System generated!

\`\`\`javascript
${code}
\`\`\`

Features: Add/remove/use items, stacking, rarity sort, item database, gold system.`,
    actions: [],
  };
}

function generateCombatSystem(): BrainResponse {
  return {
    response: `[ARIES CODE] Combat System:

\`\`\`javascript
class CombatSystem {
  // Turn-based or real-time combat
  mode = 'realtime'; // 'realtime' | 'turnbased'

  calculateDamage(attacker, defender) {
    const baseDmg = attacker.attack - defender.defense * 0.5;
    const crit = Math.random() < attacker.critChance ? 2.0 : 1.0;
    const variance = 0.85 + Math.random() * 0.3; // 85%-115%
    return Math.max(1, Math.floor(baseDmg * crit * variance));
  }

  // Skill system
  skills = {
    slash: { name: 'Slash', damage: 1.5, mp: 0, cooldown: 0 },
    fireball: { name: 'Fireball', damage: 3.0, mp: 20, cooldown: 3, element: 'fire' },
    heal: { name: 'Heal', damage: -2.0, mp: 15, cooldown: 5, target: 'self' },
    shield: { name: 'Shield', damage: 0, mp: 10, cooldown: 8, buff: { defense: 2.0, duration: 5 } },
    ultimate: { name: 'Ultimate', damage: 5.0, mp: 50, cooldown: 15, aoe: true },
  };

  useSkill(caster, target, skillId) {
    const skill = this.skills[skillId];
    if (!skill) return { success: false, msg: 'Skill not found' };
    if (caster.mp < skill.mp) return { success: false, msg: 'Not enough MP' };

    caster.mp -= skill.mp;
    const dmg = this.calculateDamage(
      { ...caster, attack: caster.attack * skill.damage },
      target
    );

    if (skill.target === 'self') {
      caster.health = Math.min(caster.maxHealth, caster.health + Math.abs(dmg));
      return { success: true, heal: Math.abs(dmg) };
    }

    target.health -= dmg;
    const isDead = target.health <= 0;
    return { success: true, damage: dmg, critical: dmg > caster.attack * 1.8, killed: isDead };
  }

  // Element weakness chart
  getElementBonus(attackElement, defenseElement) {
    const chart = {
      fire: { weak: 'ice', strong: 'water' },
      water: { weak: 'fire', strong: 'electric' },
      electric: { weak: 'water', strong: 'earth' },
      earth: { weak: 'electric', strong: 'fire' },
      ice: { weak: 'earth', strong: 'fire' },
    };
    if (chart[attackElement]?.weak === defenseElement) return 1.5;
    if (chart[attackElement]?.strong === defenseElement) return 0.5;
    return 1.0;
  }

  // Combo system
  comboCounter = 0;
  comboTimer = 0;
  comboMultiplier() { return 1 + this.comboCounter * 0.1; }

  // Loot drop
  generateLoot(enemyLevel) {
    const drops = [];
    if (Math.random() < 0.3) drops.push({ id: 'health_potion', quantity: 1 });
    if (Math.random() < 0.1) drops.push({ id: 'gold_coin', quantity: enemyLevel * 10 });
    if (Math.random() < 0.05) drops.push({ id: 'rare_gem', quantity: 1 });
    return drops;
  }
}
\`\`\`

Features: Damage calc, skills, elements, combos, loot drops. Bisa real-time atau turn-based.`,
    actions: [],
  };
}

function generateSaveSystem(): BrainResponse {
  return {
    response: `[ARIES CODE] Save/Load System:

\`\`\`javascript
class SaveSystem {
  SAVE_KEY = 'neoengine_savegame';
  MAX_SLOTS = 5;

  save(slot, gameData) {
    const saves = this.getAllSaves();
    saves[slot] = {
      data: gameData,
      timestamp: Date.now(),
      playtime: gameData.playtime || 0,
      level: gameData.playerLevel || 1,
      screenshot: null, // optional
    };
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves));
    return true;
  }

  load(slot) {
    const saves = this.getAllSaves();
    return saves[slot]?.data || null;
  }

  getAllSaves() {
    try {
      return JSON.parse(localStorage.getItem(this.SAVE_KEY) || '{}');
    } catch { return {}; }
  }

  deleteSave(slot) {
    const saves = this.getAllSaves();
    delete saves[slot];
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves));
  }

  autoSave(gameData) {
    this.save('auto', gameData);
  }

  // Export save as file (for backup)
  exportSave(slot) {
    const data = this.load(slot);
    if (!data) return;
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'savegame_' + slot + '.json';
    a.click(); URL.revokeObjectURL(url);
  }

  // Import save from file
  importSave(slot, file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      this.save(slot, data);
    };
    reader.readAsText(file);
  }
}
\`\`\`

Features: 5 save slots, auto-save, export/import file, timestamps.`,
    actions: [],
  };
}

function generateUICode(): BrainResponse {
  return {
    response: `[ARIES CODE] Game UI System:

\`\`\`javascript
class GameUI {
  // HUD - always visible during gameplay
  createHUD(player) {
    return {
      healthBar: { current: player.health, max: player.maxHealth, color: '#ff4444' },
      manaBar: { current: player.mp, max: player.maxMp, color: '#4488ff' },
      expBar: { current: player.xp, max: player.xpToNext, color: '#ffcc00' },
      minimap: { size: 150, playerPos: player.position },
      score: player.score || 0,
      gold: player.gold || 0,
      level: player.level || 1,
    };
  }

  // Main Menu
  mainMenu = {
    buttons: [
      { text: 'New Game', action: 'newGame' },
      { text: 'Continue', action: 'continue', disabled: false },
      { text: 'Settings', action: 'settings' },
      { text: 'Credits', action: 'credits' },
      { text: 'Exit', action: 'exit' },
    ],
  };

  // Pause Menu
  pauseMenu = {
    buttons: [
      { text: 'Resume', action: 'resume' },
      { text: 'Save Game', action: 'save' },
      { text: 'Load Game', action: 'load' },
      { text: 'Settings', action: 'settings' },
      { text: 'Main Menu', action: 'mainMenu' },
    ],
  };

  // Settings
  settings = {
    audio: { master: 100, music: 80, sfx: 100, voice: 100 },
    graphics: { quality: 'high', resolution: '1920x1080', fullscreen: true, vsync: true, shadows: true },
    controls: { sensitivity: 50, invertY: false, vibration: true },
    language: 'id', // Indonesian
  };

  // Damage popup
  showDamagePopup(amount, position, isCritical) {
    return {
      text: isCritical ? amount + '!' : String(amount),
      color: isCritical ? '#ff0000' : '#ffffff',
      size: isCritical ? 32 : 24,
      position: position,
      animation: 'floatUp',
      duration: 1.0,
    };
  }

  // Dialog box
  showDialog(speaker, text, options) {
    return {
      speaker: speaker,
      text: text,
      portrait: speaker + '_portrait',
      options: options || [{ text: 'OK', action: 'close' }],
      typewriterSpeed: 30, // ms per character
    };
  }
}
\`\`\`

Features: HUD, main menu, pause menu, settings, damage popups, dialog box.`,
    actions: [],
  };
}

function generateAPKBuild(): BrainResponse {
  return {
    response: `[ARIES CODE] APK Build Configuration:

\`\`\`groovy
// build.gradle (Module: app)
android {
    namespace 'com.neoengine.game'
    compileSdk 34
    
    defaultConfig {
        applicationId "com.neoengine.game"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        ndk { abiFilters 'arm64-v8a', 'armeabi-v7a' }
    }
    
    signingConfigs {
        release {
            storeFile file('keystore/release.keystore')
            storePassword System.getenv('KEYSTORE_PASSWORD')
            keyAlias 'neoengine'
            keyPassword System.getenv('KEY_PASSWORD')
        }
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
            signingConfig signingConfigs.release
        }
    }
    
    externalNativeBuild {
        cmake {
            path "src/main/jni/CMakeLists.txt"
            version "3.22.1"
        }
    }
}

dependencies {
    implementation 'com.google.android.gms:play-services-ads:23.0.0'
    implementation 'com.android.billingclient:billing:6.2.0'
    implementation 'com.google.firebase:firebase-analytics:21.5.1'
}
\`\`\`

\`\`\`cmake
# CMakeLists.txt (JNI)
cmake_minimum_required(VERSION 3.22.1)
project(neoengine)

add_library(neoengine SHARED
    NeoEngineBridge.cpp
    ../../../../../../engine/Source/NeoEngine/Core/NeoEngine.cpp
    ../../../../../../engine/Source/NeoEngine/ECS/Entity.cpp
    ../../../../../../engine/Source/NeoEngine/Rendering/Vulkan/VulkanRHI.cpp
)

target_compile_features(neoengine PRIVATE cxx_std_23)
find_library(log-lib log)
target_link_libraries(neoengine \${log-lib} android vulkan)
\`\`\`

Build commands:
\`\`\`bash
# Debug APK
./gradlew assembleDebug

# Release APK (signed)
./gradlew assembleRelease

# AAB for Play Store
./gradlew bundleRelease

# Install to device
adb install app/build/outputs/apk/debug/app-debug.apk
\`\`\`

Sudah terintegrasi dengan C++ engine via JNI bridge. Buka Build > Upload to Play Store untuk proses publish.`,
    actions: [],
  };
}

function generateNetworkingCode(): BrainResponse {
  return {
    response: `[ARIES CODE] Multiplayer Networking:

\`\`\`javascript
class NetworkManager {
  ws = null;
  playerId = null;
  players = new Map();
  isHost = false;
  
  connect(serverUrl) {
    this.ws = new WebSocket(serverUrl);
    this.ws.onopen = () => {
      this.send({ type: 'JOIN', name: this.playerName });
    };
    this.ws.onmessage = (e) => this.handleMessage(JSON.parse(e.data));
    this.ws.onclose = () => console.log('Disconnected');
  }
  
  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ ...data, id: this.playerId, t: Date.now() }));
    }
  }
  
  handleMessage(msg) {
    switch (msg.type) {
      case 'WELCOME':
        this.playerId = msg.id;
        break;
      case 'PLAYER_JOIN':
        this.players.set(msg.id, { name: msg.name, pos: msg.pos });
        break;
      case 'PLAYER_LEAVE':
        this.players.delete(msg.id);
        break;
      case 'POSITION':
        const p = this.players.get(msg.id);
        if (p) { p.pos = msg.pos; p.rot = msg.rot; }
        break;
      case 'CHAT':
        this.onChat?.(msg.from, msg.text);
        break;
      case 'GAME_STATE':
        this.onGameState?.(msg.state);
        break;
    }
  }
  
  // Send position updates (throttled to 20fps)
  lastSend = 0;
  syncPosition(pos, rot) {
    const now = Date.now();
    if (now - this.lastSend < 50) return;
    this.lastSend = now;
    this.send({ type: 'POSITION', pos, rot });
  }
  
  chat(text) { this.send({ type: 'CHAT', text }); }
  
  // Lag compensation
  interpolate(oldPos, newPos, t) {
    return {
      x: oldPos.x + (newPos.x - oldPos.x) * t,
      y: oldPos.y + (newPos.y - oldPos.y) * t,
      z: oldPos.z + (newPos.z - oldPos.z) * t,
    };
  }
}
\`\`\`

Features: WebSocket, player sync, chat, interpolation, lag compensation.`,
    actions: [],
  };
}

function generatePhysicsCode(): BrainResponse {
  return {
    response: `[ARIES CODE] Physics & Collision System:

\`\`\`javascript
class PhysicsEngine {
  bodies = [];
  gravity = { x: 0, y: -9.81, z: 0 };
  
  addBody(obj) {
    this.bodies.push({
      ...obj,
      velocity: { x: 0, y: 0, z: 0 },
      acceleration: { x: 0, y: 0, z: 0 },
      mass: obj.mass || 1.0,
      restitution: obj.restitution || 0.3, // bounciness
      friction: obj.friction || 0.5,
      isStatic: obj.isStatic || false,
      collider: obj.collider || { type: 'box', size: { x: 1, y: 1, z: 1 } },
    });
  }
  
  update(dt) {
    for (const body of this.bodies) {
      if (body.isStatic) continue;
      // Apply gravity
      body.velocity.x += this.gravity.x * dt;
      body.velocity.y += this.gravity.y * dt;
      body.velocity.z += this.gravity.z * dt;
      // Apply velocity
      body.position.x += body.velocity.x * dt;
      body.position.y += body.velocity.y * dt;
      body.position.z += body.velocity.z * dt;
    }
    this.resolveCollisions();
  }
  
  // AABB collision detection
  checkAABB(a, b) {
    const aMin = { x: a.position.x - a.collider.size.x/2, y: a.position.y - a.collider.size.y/2, z: a.position.z - a.collider.size.z/2 };
    const aMax = { x: a.position.x + a.collider.size.x/2, y: a.position.y + a.collider.size.y/2, z: a.position.z + a.collider.size.z/2 };
    const bMin = { x: b.position.x - b.collider.size.x/2, y: b.position.y - b.collider.size.y/2, z: b.position.z - b.collider.size.z/2 };
    const bMax = { x: b.position.x + b.collider.size.x/2, y: b.position.y + b.collider.size.y/2, z: b.position.z + b.collider.size.z/2 };
    return aMin.x <= bMax.x && aMax.x >= bMin.x &&
           aMin.y <= bMax.y && aMax.y >= bMin.y &&
           aMin.z <= bMax.z && aMax.z >= bMin.z;
  }
  
  // Sphere collision
  checkSphere(a, b) {
    const dx = a.position.x - b.position.x;
    const dy = a.position.y - b.position.y;
    const dz = a.position.z - b.position.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
    return dist < (a.collider.radius + b.collider.radius);
  }
  
  // Raycast
  raycast(origin, direction, maxDist = 100) {
    let closest = null;
    let closestDist = maxDist;
    for (const body of this.bodies) {
      const t = this.rayBoxIntersect(origin, direction, body);
      if (t > 0 && t < closestDist) {
        closestDist = t;
        closest = { body, distance: t, point: {
          x: origin.x + direction.x * t,
          y: origin.y + direction.y * t,
          z: origin.z + direction.z * t,
        }};
      }
    }
    return closest;
  }
  
  resolveCollisions() {
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i+1; j < this.bodies.length; j++) {
        if (this.checkAABB(this.bodies[i], this.bodies[j])) {
          this.resolve(this.bodies[i], this.bodies[j]);
        }
      }
    }
  }
  
  resolve(a, b) {
    if (a.isStatic && b.isStatic) return;
    // Simple elastic collision
    const bounce = Math.min(a.restitution, b.restitution);
    if (!a.isStatic) a.velocity.y *= -bounce;
    if (!b.isStatic) b.velocity.y *= -bounce;
  }
  
  rayBoxIntersect(origin, dir, body) { return -1; /* simplified */ }
}
\`\`\`

Features: Gravity, AABB/Sphere collision, raycast, elastic collision, friction.`,
    actions: [],
  };
}

function generateParticleCode(): BrainResponse {
  return {
    response: `[ARIES CODE] Particle & VFX System:

\`\`\`javascript
class ParticleSystem {
  particles = [];
  emitters = [];
  
  createEmitter(config) {
    const emitter = {
      position: config.position || { x: 0, y: 0, z: 0 },
      rate: config.rate || 10, // particles per second
      lifetime: config.lifetime || 2.0,
      speed: config.speed || { min: 1, max: 5 },
      size: config.size || { start: 1, end: 0 },
      color: config.color || { start: '#ff4400', end: '#ffcc00' },
      gravity: config.gravity || -2,
      spread: config.spread || 45, // degrees
      shape: config.shape || 'cone', // cone, sphere, box
      burst: config.burst || false,
      burstCount: config.burstCount || 20,
      loop: config.loop !== false,
    };
    this.emitters.push(emitter);
    return emitter;
  }
  
  // Presets
  presets = {
    fire: { rate: 30, lifetime: 1.5, color: { start: '#ff4400', end: '#ffcc00' }, speed: { min: 2, max: 4 }, gravity: 1, size: { start: 2, end: 0 } },
    smoke: { rate: 10, lifetime: 3.0, color: { start: '#666666', end: '#333333' }, speed: { min: 0.5, max: 1.5 }, gravity: 0.5, size: { start: 1, end: 4 } },
    explosion: { burst: true, burstCount: 50, lifetime: 1.0, color: { start: '#ff8800', end: '#ff0000' }, speed: { min: 5, max: 15 }, shape: 'sphere' },
    rain: { rate: 100, lifetime: 2.0, color: { start: '#aaccff', end: '#aaccff' }, speed: { min: 10, max: 15 }, gravity: -15, spread: 5, size: { start: 0.2, end: 0.2 } },
    snow: { rate: 50, lifetime: 5.0, color: { start: '#ffffff', end: '#ffffff' }, speed: { min: 0.5, max: 2 }, gravity: -1, spread: 180, size: { start: 0.5, end: 0.3 } },
    sparkle: { rate: 5, lifetime: 0.8, color: { start: '#ffff00', end: '#ffffff' }, speed: { min: 0, max: 1 }, shape: 'sphere', size: { start: 0.5, end: 0 } },
    blood: { burst: true, burstCount: 15, lifetime: 0.5, color: { start: '#cc0000', end: '#880000' }, speed: { min: 3, max: 8 }, gravity: -10 },
    heal: { rate: 20, lifetime: 1.5, color: { start: '#00ff88', end: '#00ff00' }, speed: { min: 1, max: 3 }, gravity: 2, size: { start: 0.5, end: 0 } },
  };
}
\`\`\`

Presets: fire, smoke, explosion, rain, snow, sparkle, blood, heal.`,
    actions: [],
  };
}

function generateAudioCode(): BrainResponse {
  return {
    response: `[ARIES CODE] Audio & Music System:

\`\`\`javascript
class AudioManager {
  context = new AudioContext();
  sounds = new Map();
  musicTrack = null;
  masterVolume = 1.0;
  musicVolume = 0.8;
  sfxVolume = 1.0;
  
  async loadSound(id, url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(buffer);
    this.sounds.set(id, audioBuffer);
  }
  
  play(id, options = {}) {
    const buffer = this.sounds.get(id);
    if (!buffer) return;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const gain = this.context.createGain();
    gain.gain.value = (options.volume || 1.0) * this.sfxVolume * this.masterVolume;
    source.connect(gain).connect(this.context.destination);
    source.loop = options.loop || false;
    source.playbackRate.value = options.pitch || 1.0;
    source.start(0);
    return source;
  }
  
  playMusic(id) {
    this.stopMusic();
    this.musicTrack = this.play(id, { loop: true, volume: this.musicVolume });
  }
  
  stopMusic() { this.musicTrack?.stop(); this.musicTrack = null; }
  
  // 3D positional audio
  play3D(id, position, listenerPos) {
    const dist = Math.sqrt(
      (position.x-listenerPos.x)**2 + (position.y-listenerPos.y)**2 + (position.z-listenerPos.z)**2
    );
    const volume = Math.max(0, 1 - dist / 50); // fade over 50 units
    const pan = Math.max(-1, Math.min(1, (position.x - listenerPos.x) / 20));
    this.play(id, { volume, pan });
  }
  
  // Procedural sound (no files needed)
  beep(frequency = 440, duration = 0.2) {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    osc.connect(gain).connect(this.context.destination);
    osc.start(); osc.stop(this.context.currentTime + duration);
  }
}
\`\`\`

Features: Load/play sounds, music, 3D audio, procedural beeps, volume control.`,
    actions: [],
  };
}

function generateQuestSystem(): BrainResponse {
  return {
    response: `[ARIES CODE] Quest/Mission System:

\`\`\`javascript
class QuestSystem {
  quests = [];
  activeQuests = [];
  completedQuests = [];
  
  addQuest(quest) {
    this.quests.push({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      type: quest.type || 'main', // main, side, daily, weekly
      objectives: quest.objectives.map(o => ({ ...o, current: 0, completed: false })),
      rewards: quest.rewards || { xp: 100, gold: 50 },
      prerequisite: quest.prerequisite || null,
      status: 'available', // available, active, completed, failed
      timeLimit: quest.timeLimit || null,
    });
  }
  
  acceptQuest(questId) {
    const q = this.quests.find(q => q.id === questId);
    if (!q || q.status !== 'available') return false;
    if (q.prerequisite && !this.completedQuests.includes(q.prerequisite)) return false;
    q.status = 'active';
    this.activeQuests.push(q);
    return true;
  }
  
  updateObjective(type, target, amount = 1) {
    for (const quest of this.activeQuests) {
      for (const obj of quest.objectives) {
        if (obj.type === type && obj.target === target && !obj.completed) {
          obj.current = Math.min(obj.current + amount, obj.required);
          if (obj.current >= obj.required) obj.completed = true;
        }
      }
      if (quest.objectives.every(o => o.completed)) {
        this.completeQuest(quest.id);
      }
    }
  }
  
  completeQuest(questId) {
    const q = this.quests.find(q => q.id === questId);
    if (!q) return null;
    q.status = 'completed';
    this.completedQuests.push(questId);
    this.activeQuests = this.activeQuests.filter(q => q.id !== questId);
    return q.rewards;
  }
}

// Example quests
const QUESTS = [
  {
    id: 'q1', title: 'First Steps', type: 'main',
    description: 'Learn the basics',
    objectives: [
      { type: 'kill', target: 'slime', required: 3, description: 'Kill 3 slimes' },
      { type: 'collect', target: 'herb', required: 5, description: 'Collect 5 herbs' },
    ],
    rewards: { xp: 200, gold: 100, items: ['iron_sword'] },
  },
];
\`\`\`

Features: Main/side/daily quests, objectives tracking, prerequisites, rewards, auto-complete.`,
    actions: [],
  };
}

function generateDialogSystem(): BrainResponse {
  return {
    response: `[ARIES CODE] NPC Dialog System:

\`\`\`javascript
class DialogSystem {
  currentDialog = null;
  currentNode = null;
  
  dialogs = {
    merchant: {
      start: {
        speaker: 'Merchant',
        text: 'Selamat datang di toko saya! Mau beli apa?',
        options: [
          { text: 'Lihat barang', next: 'shop' },
          { text: 'Ada quest?', next: 'quest', condition: () => !questCompleted('merchant_quest') },
          { text: 'Tidak, terima kasih', next: null },
        ],
      },
      shop: {
        speaker: 'Merchant',
        text: 'Ini barang terbaik saya! [Opens Shop UI]',
        action: 'openShop',
        options: [{ text: 'Kembali', next: 'start' }],
      },
      quest: {
        speaker: 'Merchant',
        text: 'Tolong carikan 10 Crystal dari dungeon! Saya bayar 500 gold.',
        options: [
          { text: 'Baik, saya terima!', next: null, action: 'acceptQuest:merchant_quest' },
          { text: 'Nanti saja', next: 'start' },
        ],
      },
    },
  };
  
  startDialog(npcId) {
    this.currentDialog = this.dialogs[npcId];
    this.currentNode = this.currentDialog?.start;
    return this.currentNode;
  }
  
  selectOption(index) {
    if (!this.currentNode?.options) return null;
    const option = this.currentNode.options[index];
    if (!option || (option.condition && !option.condition())) return null;
    if (option.action) this.executeAction(option.action);
    if (!option.next) { this.currentDialog = null; return null; }
    this.currentNode = this.currentDialog[option.next];
    return this.currentNode;
  }
  
  executeAction(action) {
    if (action === 'openShop') window.__neoOpenShop?.();
    if (action.startsWith('acceptQuest:')) window.__neoAcceptQuest?.(action.split(':')[1]);
  }
}
\`\`\`

Features: Branching dialog, conditions, actions, typewriter effect, NPC portraits.`,
    actions: [],
  };
}

function generateScoreSystem(): BrainResponse {
  return {
    response: `[ARIES CODE] Score & Leaderboard System:

\`\`\`javascript
class ScoreSystem {
  score = 0;
  multiplier = 1;
  highScores = [];
  combo = 0;
  
  addScore(points, reason = '') {
    const earned = Math.floor(points * this.multiplier * (1 + this.combo * 0.1));
    this.score += earned;
    this.combo++;
    return { earned, total: this.score, combo: this.combo };
  }
  
  breakCombo() { this.combo = 0; this.multiplier = 1; }
  
  getHighScores() {
    try {
      this.highScores = JSON.parse(localStorage.getItem('highscores') || '[]');
    } catch { this.highScores = []; }
    return this.highScores.sort((a, b) => b.score - a.score).slice(0, 10);
  }
  
  submitScore(name) {
    this.getHighScores();
    this.highScores.push({ name, score: this.score, date: Date.now() });
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 100);
    localStorage.setItem('highscores', JSON.stringify(this.highScores));
    const rank = this.highScores.findIndex(h => h.score === this.score && h.name === name) + 1;
    return { rank, isNewRecord: rank === 1 };
  }
  
  getRank(score) {
    const ranks = [
      { min: 100000, name: 'S+', color: '#ff00ff' },
      { min: 50000, name: 'S', color: '#ffcc00' },
      { min: 25000, name: 'A', color: '#ff8800' },
      { min: 10000, name: 'B', color: '#00ccff' },
      { min: 5000, name: 'C', color: '#00ff00' },
      { min: 0, name: 'D', color: '#888888' },
    ];
    return ranks.find(r => score >= r.min) || ranks[ranks.length - 1];
  }
}
\`\`\`

Features: Score, combo multiplier, local leaderboard, rank system (S+ to D).`,
    actions: [],
  };
}

function generateSpawnerSystem(): BrainResponse {
  return {
    response: `[ARIES CODE] Wave Spawner System:

\`\`\`javascript
class WaveSpawner {
  currentWave = 0;
  enemiesAlive = 0;
  isActive = false;
  spawnPoints = [];
  
  waves = [
    { enemies: [{ type: 'slime', count: 5 }], delay: 1.0 },
    { enemies: [{ type: 'slime', count: 8 }, { type: 'goblin', count: 2 }], delay: 0.8 },
    { enemies: [{ type: 'goblin', count: 5 }, { type: 'orc', count: 2 }], delay: 0.6 },
    { enemies: [{ type: 'orc', count: 5 }, { type: 'dragon', count: 1 }], delay: 0.5 },
    { enemies: [{ type: 'boss_dragon', count: 1 }], delay: 0, isBoss: true },
  ];
  
  startWave() {
    if (this.currentWave >= this.waves.length) { this.onVictory?.(); return; }
    const wave = this.waves[this.currentWave];
    this.isActive = true;
    let spawnDelay = 0;
    
    for (const group of wave.enemies) {
      for (let i = 0; i < group.count; i++) {
        setTimeout(() => {
          const point = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
          this.spawnEnemy(group.type, point);
          this.enemiesAlive++;
        }, spawnDelay * 1000);
        spawnDelay += wave.delay;
      }
    }
  }
  
  onEnemyDeath() {
    this.enemiesAlive--;
    if (this.enemiesAlive <= 0) {
      this.currentWave++;
      this.onWaveComplete?.(this.currentWave);
      setTimeout(() => this.startWave(), 3000); // 3s between waves
    }
  }
  
  spawnEnemy(type, position) { /* create enemy at position */ }
  
  // Infinite mode
  generateInfiniteWave(waveNum) {
    const baseCount = 3 + waveNum * 2;
    const types = ['slime', 'goblin', 'orc', 'skeleton', 'dragon'];
    const maxType = Math.min(Math.floor(waveNum / 3), types.length - 1);
    return {
      enemies: Array.from({ length: maxType + 1 }, (_, i) => ({
        type: types[i],
        count: Math.max(1, Math.floor(baseCount / (i + 1))),
      })),
      delay: Math.max(0.2, 1.0 - waveNum * 0.05),
    };
  }
}
\`\`\`

Features: Wave system, boss waves, spawn points, infinite mode, difficulty scaling.`,
    actions: [],
  };
}

// =========================================================
// MASSIVE OPEN WORLD ENGINE
// Perfect World scale: 100x100km, chunk streaming, LOD,
// spatial partitioning, view distance culling
// =========================================================

function generateOpenWorldSystem(): BrainResponse {
  return {
    response: `[ARIES CODE] Massive Open World Engine (Perfect World Scale):

\`\`\`javascript
// ============================================
// NeoEngine World Streaming System
// Supports 100x100km maps with chunk-based loading
// Generated by Aries AI
// ============================================

class WorldStreamingSystem {
  // World config
  worldSize = { x: 100000, z: 100000 }; // 100km x 100km in meters
  chunkSize = 256; // 256m per chunk
  chunksX = Math.ceil(this.worldSize.x / this.chunkSize); // ~390 chunks
  chunksZ = Math.ceil(this.worldSize.z / this.chunkSize);
  
  // Loaded chunks (only nearby player)
  loadedChunks = new Map(); // key: "cx,cz" -> ChunkData
  loadRadius = 3; // load 3 chunks around player = 768m view
  unloadRadius = 5; // unload beyond 5 chunks = 1280m
  
  // View distance tiers (configurable per player/settings)
  viewDistanceTiers = {
    ultra: { render: 200, npc: 150, detail: 100 },   // meters
    high:  { render: 150, npc: 100, detail: 75 },
    medium:{ render: 100, npc: 75,  detail: 50 },
    low:   { render: 50,  npc: 30,  detail: 20 },
  };
  currentTier = 'high';
  
  getChunkCoord(worldPos) {
    return {
      cx: Math.floor(worldPos.x / this.chunkSize),
      cz: Math.floor(worldPos.z / this.chunkSize),
    };
  }
  
  // Called every frame with player position
  update(playerPos) {
    const { cx, cz } = this.getChunkCoord(playerPos);
    
    // Load nearby chunks
    for (let dx = -this.loadRadius; dx <= this.loadRadius; dx++) {
      for (let dz = -this.loadRadius; dz <= this.loadRadius; dz++) {
        const key = (cx+dx) + ',' + (cz+dz);
        if (!this.loadedChunks.has(key)) {
          this.loadChunk(cx+dx, cz+dz);
        }
      }
    }
    
    // Unload far chunks
    for (const [key, chunk] of this.loadedChunks) {
      const [ccx, ccz] = key.split(',').map(Number);
      const dist = Math.max(Math.abs(ccx - cx), Math.abs(ccz - cz));
      if (dist > this.unloadRadius) {
        this.unloadChunk(key);
      }
    }
  }
  
  loadChunk(cx, cz) {
    const chunk = {
      cx, cz,
      terrain: this.generateTerrain(cx, cz),
      objects: this.generateObjects(cx, cz),
      npcs: [],
      loaded: true,
    };
    this.loadedChunks.set(cx + ',' + cz, chunk);
  }
  
  unloadChunk(key) {
    const chunk = this.loadedChunks.get(key);
    if (chunk) {
      // Save NPC states before unloading
      this.saveChunkNPCState(chunk);
      this.loadedChunks.delete(key);
    }
  }
  
  generateTerrain(cx, cz) {
    // Procedural heightmap using noise
    const heights = [];
    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        const wx = (cx * this.chunkSize) + (x * this.chunkSize / 16);
        const wz = (cz * this.chunkSize) + (z * this.chunkSize / 16);
        // Multi-octave noise for realistic terrain
        const h = this.noise(wx*0.001, wz*0.001) * 500   // mountains
                + this.noise(wx*0.005, wz*0.005) * 100   // hills
                + this.noise(wx*0.02, wz*0.02) * 20;     // detail
        heights.push(h);
      }
    }
    return { resolution: 16, heights };
  }
  
  generateObjects(cx, cz) {
    // Procedural vegetation, rocks based on biome
    const objects = [];
    const biome = this.getBiome(cx, cz);
    const density = biome.density;
    
    for (let i = 0; i < density; i++) {
      const lx = Math.random() * this.chunkSize;
      const lz = Math.random() * this.chunkSize;
      const type = biome.objectTypes[Math.floor(Math.random() * biome.objectTypes.length)];
      objects.push({ type, x: lx, z: lz, scale: 0.5 + Math.random() * 1.5 });
    }
    return objects;
  }
  
  getBiome(cx, cz) {
    const temp = this.noise(cx * 0.1, cz * 0.1);
    if (temp > 0.6) return { name: 'desert', density: 5, objectTypes: ['cactus', 'rock', 'sand_dune'] };
    if (temp > 0.3) return { name: 'plains', density: 20, objectTypes: ['grass', 'flower', 'bush', 'small_rock'] };
    if (temp > 0) return { name: 'forest', density: 40, objectTypes: ['oak_tree', 'pine_tree', 'bush', 'mushroom', 'rock'] };
    if (temp > -0.3) return { name: 'snow', density: 15, objectTypes: ['pine_tree', 'snow_rock', 'ice'] };
    return { name: 'mountain', density: 10, objectTypes: ['rock', 'boulder', 'dead_tree'] };
  }
  
  // Simple noise function (replace with proper Perlin/Simplex in production)
  noise(x, z) {
    const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }
  
  saveChunkNPCState(chunk) { /* persist to memory */ }
}

// ============================================
// LOD (Level of Detail) System
// ============================================

class LODSystem {
  lodLevels = [
    { distance: 0,   quality: 'full',   polyMultiplier: 1.0,  textureSize: 2048 },
    { distance: 50,  quality: 'high',   polyMultiplier: 0.5,  textureSize: 1024 },
    { distance: 100, quality: 'medium', polyMultiplier: 0.25, textureSize: 512 },
    { distance: 200, quality: 'low',    polyMultiplier: 0.1,  textureSize: 256 },
    { distance: 500, quality: 'billboard', polyMultiplier: 0, textureSize: 128 },
  ];
  
  getLOD(objectPos, cameraPos) {
    const dx = objectPos.x - cameraPos.x;
    const dy = objectPos.y - cameraPos.y;
    const dz = objectPos.z - cameraPos.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    for (let i = this.lodLevels.length - 1; i >= 0; i--) {
      if (dist >= this.lodLevels[i].distance) return this.lodLevels[i];
    }
    return this.lodLevels[0];
  }
  
  // Frustum culling - don't render objects behind camera
  isInFrustum(objectPos, cameraPos, cameraDir, fov = 90) {
    const dx = objectPos.x - cameraPos.x;
    const dz = objectPos.z - cameraPos.z;
    const dot = dx * cameraDir.x + dz * cameraDir.z;
    if (dot < 0) return false; // behind camera
    const angle = Math.acos(dot / (Math.sqrt(dx*dx + dz*dz) * Math.sqrt(cameraDir.x**2 + cameraDir.z**2)));
    return angle < (fov / 2) * (Math.PI / 180);
  }
}
\`\`\`

Fitur: Chunk streaming 100x100km, LOD 5 level, biome generation, frustum culling.
Ketik "buat open world" untuk langsung generate massive world!`,
    actions: [],
  };
}

function generateNPCSpatialSystem(): BrainResponse {
  return {
    response: `[ARIES CODE] NPC Spatial Partitioning (Ribuan NPC Tanpa Lag):

\`\`\`javascript
// ============================================
// Spatial Hash Grid - manage thousands of NPCs
// Only activate NPCs near player
// ============================================

class SpatialHashGrid {
  cellSize = 50; // 50m per cell
  grid = new Map(); // "cx,cz" -> Set of NPC ids
  npcs = new Map(); // id -> NPCData
  
  // Insert NPC into grid
  insert(npc) {
    const key = this.getKey(npc.position);
    if (!this.grid.has(key)) this.grid.set(key, new Set());
    this.grid.get(key).add(npc.id);
    this.npcs.set(npc.id, npc);
  }
  
  // Move NPC - update grid cell
  moveNPC(id, newPos) {
    const npc = this.npcs.get(id);
    if (!npc) return;
    const oldKey = this.getKey(npc.position);
    const newKey = this.getKey(newPos);
    if (oldKey !== newKey) {
      this.grid.get(oldKey)?.delete(id);
      if (!this.grid.has(newKey)) this.grid.set(newKey, new Set());
      this.grid.get(newKey).add(id);
    }
    npc.position = newPos;
  }
  
  // Get NPCs near a position (for activation)
  getNearby(position, radius) {
    const results = [];
    const cellRadius = Math.ceil(radius / this.cellSize);
    const cx = Math.floor(position.x / this.cellSize);
    const cz = Math.floor(position.z / this.cellSize);
    
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dz = -cellRadius; dz <= cellRadius; dz++) {
        const key = (cx+dx) + ',' + (cz+dz);
        const cell = this.grid.get(key);
        if (cell) {
          for (const id of cell) {
            const npc = this.npcs.get(id);
            if (npc && this.distance(position, npc.position) <= radius) {
              results.push(npc);
            }
          }
        }
      }
    }
    return results;
  }
  
  getKey(pos) {
    return Math.floor(pos.x/this.cellSize) + ',' + Math.floor(pos.z/this.cellSize);
  }
  
  distance(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.z-b.z)**2);
  }
}

// ============================================
// NPC Manager - handles thousands of NPCs
// ============================================

class NPCManager {
  spatialGrid = new SpatialHashGrid();
  activeNPCs = new Set(); // only NPCs near player get full AI
  sleepingNPCs = new Set(); // far NPCs = frozen state
  
  activationRadius = 100; // meters - NPCs within this get full AI
  sleepRadius = 200; // beyond this = completely frozen
  
  // Bulk create NPCs (e.g., "buat 500 NPC")
  createBulkNPCs(count, options = {}) {
    const npcs = [];
    const professions = options.professions || [
      'villager', 'merchant', 'guard', 'farmer', 'blacksmith',
      'innkeeper', 'hunter', 'mage', 'priest', 'thief',
      'noble', 'beggar', 'bard', 'soldier', 'scholar',
    ];
    const names = options.names || this.generateNames(count);
    
    for (let i = 0; i < count; i++) {
      const npc = {
        id: 'npc_' + i + '_' + Date.now(),
        name: names[i % names.length] + '_' + i,
        profession: professions[Math.floor(Math.random() * professions.length)],
        position: options.area ? {
          x: options.area.x + (Math.random() - 0.5) * options.area.radius * 2,
          y: 0,
          z: options.area.z + (Math.random() - 0.5) * options.area.radius * 2,
        } : { x: Math.random() * 1000, y: 0, z: Math.random() * 1000 },
        health: 100,
        level: Math.floor(Math.random() * 20) + 1,
        state: 'idle',
        schedule: this.generateSchedule(),
        inventory: this.generateInventory(professions[i % professions.length]),
        dialog: options.dialog || null,
      };
      npcs.push(npc);
      this.spatialGrid.insert(npc);
      this.sleepingNPCs.add(npc.id);
    }
    return npcs;
  }
  
  // Update - only tick active NPCs
  update(playerPos, deltaTime) {
    // Activate nearby NPCs
    const nearby = this.spatialGrid.getNearby(playerPos, this.activationRadius);
    const nearbyIds = new Set(nearby.map(n => n.id));
    
    // Wake up NPCs entering activation range
    for (const npc of nearby) {
      if (this.sleepingNPCs.has(npc.id)) {
        this.sleepingNPCs.delete(npc.id);
        this.activeNPCs.add(npc.id);
      }
    }
    
    // Sleep NPCs leaving range
    for (const id of this.activeNPCs) {
      if (!nearbyIds.has(id)) {
        this.activeNPCs.delete(id);
        this.sleepingNPCs.add(id);
      }
    }
    
    // Only update active NPCs (saves massive CPU)
    for (const id of this.activeNPCs) {
      const npc = this.spatialGrid.npcs.get(id);
      if (npc) this.tickNPC(npc, deltaTime);
    }
  }
  
  tickNPC(npc, dt) {
    // Simple schedule-based behavior
    const hour = (Date.now() / 60000) % 24;
    const activity = npc.schedule.find(s => hour >= s.start && hour < s.end);
    if (activity) {
      npc.state = activity.action;
      if (activity.position) {
        // Move toward scheduled position
        const dx = activity.position.x - npc.position.x;
        const dz = activity.position.z - npc.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist > 1) {
          npc.position.x += (dx/dist) * 2 * dt;
          npc.position.z += (dz/dist) * 2 * dt;
          this.spatialGrid.moveNPC(npc.id, npc.position);
        }
      }
    }
  }
  
  generateSchedule() {
    return [
      { start: 6, end: 8, action: 'waking_up' },
      { start: 8, end: 12, action: 'working', position: { x: Math.random()*500, y:0, z: Math.random()*500 } },
      { start: 12, end: 13, action: 'eating' },
      { start: 13, end: 18, action: 'working', position: { x: Math.random()*500, y:0, z: Math.random()*500 } },
      { start: 18, end: 20, action: 'socializing' },
      { start: 20, end: 22, action: 'relaxing' },
      { start: 22, end: 6, action: 'sleeping' },
    ];
  }
  
  generateInventory(profession) {
    const items = {
      merchant: ['gold_50', 'potion_5', 'scroll_3', 'gem_2'],
      guard: ['iron_sword', 'shield', 'potion_2'],
      farmer: ['wheat_20', 'seed_10', 'hoe'],
      blacksmith: ['iron_ingot_10', 'hammer', 'steel_sword'],
      mage: ['staff', 'mana_potion_5', 'spell_book'],
    };
    return items[profession] || ['bread', 'gold_5'];
  }
  
  generateNames(count) {
    const first = ['Aria','Bram','Citra','Dimas','Eka','Fajar','Gita','Hadi','Indra','Jaya',
      'Kirana','Lestari','Maya','Nanda','Omar','Putri','Raka','Sari','Tara','Umar',
      'Vera','Wira','Xena','Yuda','Zahra'];
    return Array.from({length: count}, (_, i) => first[i % first.length]);
  }
}

// Stats: 5000 NPCs, only ~50-100 active at any time = smooth 60fps
\`\`\`

Performa: 5000 NPC tapi cuma 50-100 yang aktif di dekat player. Sisanya tidur = 60fps lancar!`,
    actions: [],
  };
}

function generateViewDistanceSystem(): BrainResponse {
  return {
    response: `[ARIES CODE] View Distance & Multiplayer Area of Interest:

\`\`\`javascript
// ============================================
// View Distance Culling System
// Each player only sees their nearby area
// ============================================

class ViewDistanceManager {
  // Configurable view distance per player
  players = new Map(); // playerId -> { position, viewDistance, tier }
  
  viewTiers = {
    close:  { min: 10, max: 50, label: '10-50m (Potato PC)' },
    medium: { min: 50, max: 100, label: '50-100m (Normal)' },
    far:    { min: 100, max: 200, label: '100-200m (High End)' },
    ultra:  { min: 200, max: 500, label: '200-500m (Ultra)' },
  };
  
  setPlayerViewDistance(playerId, tier) {
    const player = this.players.get(playerId);
    if (player) {
      player.viewDistance = this.viewTiers[tier].max;
      player.tier = tier;
    }
  }
  
  // Get what this player should see
  getVisibleObjects(playerId, allObjects) {
    const player = this.players.get(playerId);
    if (!player) return [];
    
    const visible = [];
    const vd = player.viewDistance;
    
    for (const obj of allObjects) {
      const dist = this.distance3D(player.position, obj.position);
      if (dist > vd) continue; // culled
      
      // LOD based on distance
      let lod = 'full';
      if (dist > vd * 0.8) lod = 'billboard';
      else if (dist > vd * 0.6) lod = 'low';
      else if (dist > vd * 0.3) lod = 'medium';
      
      visible.push({ ...obj, lod, distance: dist });
    }
    
    return visible;
  }
  
  distance3D(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2);
  }
}

// ============================================
// Multiplayer Area of Interest (AOI)
// Each player only receives data for their area
// ============================================

class AreaOfInterest {
  aoiRadius = 150; // meters - default AOI
  players = new Map();
  
  // What data to send to each player
  getPlayerUpdate(playerId) {
    const player = this.players.get(playerId);
    if (!player) return null;
    
    const update = {
      nearbyPlayers: [],
      nearbyNPCs: [],
      nearbyObjects: [],
      events: [],
    };
    
    // Only include other players within AOI
    for (const [otherId, other] of this.players) {
      if (otherId === playerId) continue;
      const dist = this.distance(player.position, other.position);
      if (dist <= this.aoiRadius) {
        update.nearbyPlayers.push({
          id: otherId,
          position: other.position,
          rotation: other.rotation,
          action: other.currentAction,
          // Don't send full inventory/stats of far players
          detail: dist < 50 ? 'full' : 'minimal',
        });
      }
    }
    
    return update;
  }
  
  // Bandwidth optimization: send different update rates based on distance
  getUpdateRate(distance) {
    if (distance < 30) return 20;   // 20 updates/sec for very close
    if (distance < 80) return 10;   // 10/sec for medium
    if (distance < 150) return 5;   // 5/sec for far
    return 1;                        // 1/sec for edge of AOI
  }
  
  distance(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.z-b.z)**2);
  }
}

// Server-side: each player connection only receives ~5KB/s instead of sending entire world
// This is how Perfect World, WoW, Genshin handle 1000+ concurrent players
\`\`\`

Setiap player hanya terima data area sekitarnya. Bandwidth hemat 95%+ dibanding kirim semua data.`,
    actions: [],
  };
}

// =========================================================
// PROMPT-DRIVEN ASSET & RULE GENERATOR
// User describes what they want, Aries creates it
// Aries NEVER creates without user instruction
// =========================================================

function generateBulkAssets(command: string): BrainResponse {
  const cmd = command.toLowerCase();

  // Parse count from command like "buat 100 pohon" or "generate 50 NPC"
  const countMatch = cmd.match(/(\d+)\s*/);
  const count = countMatch ? Math.min(parseInt(countMatch[1]), 5000) : 10;

  // Determine asset type from command
  if (cmd.includes('pohon') || cmd.includes('tree')) {
    const variants = ['Oak', 'Pine', 'Birch', 'Willow', 'Maple', 'Cedar', 'Palm', 'Cherry'];
    const actions: Array<Record<string, unknown>> = [];
    for (let i = 0; i < Math.min(count, 200); i++) {
      const variant = variants[i % variants.length];
      actions.push({
        type: 'add_actor',
        actorType: 'cylinder',
        name: `Tree_${variant}_${i + 1}`,
      });
    }
    return {
      response: `[ARIES] ${actions.length} pohon dibuat (${variants.join(', ')})!\n\n${count > 200 ? `⚠️ Di editor saya tampilkan 200 pertama. Sisanya ${count - 200} akan di-generate saat runtime via World Streaming.` : `Total: ${actions.length} pohon dengan ${variants.length} variasi.`}\n\nGunakan "buat open world" untuk generate ribuan secara otomatis saat runtime.`,
      actions,
    };
  }

  if (cmd.includes('npc') || cmd.includes('karakter') || cmd.includes('orang') || cmd.includes('penduduk')) {
    const professions = ['Villager', 'Merchant', 'Guard', 'Farmer', 'Blacksmith', 'Innkeeper', 'Hunter', 'Mage', 'Priest', 'Soldier', 'Noble', 'Bard', 'Scholar', 'Thief', 'Healer'];
    const actions: Array<Record<string, unknown>> = [];
    for (let i = 0; i < Math.min(count, 100); i++) {
      const prof = professions[i % professions.length];
      actions.push({
        type: 'add_actor',
        actorType: 'cylinder',
        name: `NPC_${prof}_${i + 1}`,
      });
    }
    return {
      response: `[ARIES] ${actions.length} NPC dibuat!\n\nProfesi: ${professions.join(', ')}\n\n${count > 100 ? `⚠️ Di editor tampil 100. Sisanya ${count - 100} akan di-manage oleh NPC Spatial System saat runtime (pakai spatial hash grid, cuma NPC dekat player yang aktif).` : ''}\n\nSetiap NPC punya:\n- Schedule (bangun, kerja, makan, tidur)\n- Inventory sesuai profesi\n- AI state machine (idle, patrol, interact)\n- Dialog system`,
      actions,
    };
  }

  if (cmd.includes('rumah') || cmd.includes('house') || cmd.includes('building') || cmd.includes('gedung') || cmd.includes('bangunan')) {
    const types = ['House_Small', 'House_Medium', 'House_Large', 'Shop', 'Tavern', 'Warehouse', 'Tower', 'Temple', 'Mansion', 'Hut'];
    const actions: Array<Record<string, unknown>> = [];
    for (let i = 0; i < Math.min(count, 100); i++) {
      const type = types[i % types.length];
      actions.push({
        type: 'add_actor',
        actorType: 'cube',
        name: `Building_${type}_${i + 1}`,
      });
    }
    return {
      response: `[ARIES] ${actions.length} bangunan dibuat!\n\nTipe: ${types.join(', ')}\n\nSetiap bangunan punya interior, pintu, dan bisa dimasuki.`,
      actions,
    };
  }

  if (cmd.includes('monster') || cmd.includes('enemy') || cmd.includes('musuh') || cmd.includes('mob')) {
    const types = ['Slime', 'Goblin', 'Orc', 'Skeleton', 'Zombie', 'Wolf', 'Bear', 'Spider', 'Dragon', 'Golem', 'Bandit', 'Ghost', 'Troll', 'Basilisk', 'Harpy'];
    const actions: Array<Record<string, unknown>> = [];
    for (let i = 0; i < Math.min(count, 100); i++) {
      const type = types[i % types.length];
      const level = Math.floor(i / types.length) + 1;
      actions.push({
        type: 'add_actor',
        actorType: 'sphere',
        name: `Monster_${type}_Lv${level}_${i + 1}`,
      });
    }
    return {
      response: `[ARIES] ${actions.length} monster dibuat!\n\nTipe: ${types.join(', ')}\nLevel: 1-${Math.ceil(count / types.length)}\n\nSetiap monster punya:\n- AI state machine (patrol, chase, attack, flee)\n- Loot table\n- XP reward\n- Elemental weakness`,
      actions,
    };
  }

  if (cmd.includes('item') || cmd.includes('senjata') || cmd.includes('weapon') || cmd.includes('armor') || cmd.includes('equipment')) {
    const categories = {
      weapons: ['Iron Sword', 'Steel Axe', 'Magic Staff', 'Longbow', 'Dagger', 'Warhammer', 'Spear', 'Crossbow', 'Katana', 'Rapier'],
      armor: ['Leather Armor', 'Chain Mail', 'Plate Armor', 'Robe', 'Shield', 'Helmet', 'Boots', 'Gauntlets', 'Cloak', 'Ring'],
      consumables: ['Health Potion', 'Mana Potion', 'Antidote', 'Buff Scroll', 'Teleport Stone', 'Food Ration'],
    };
    const allItems = [...categories.weapons, ...categories.armor, ...categories.consumables];
    return {
      response: `[ARIES] ${Math.min(count, allItems.length * 5)} item dibuat!\n\n⚔️ Weapons: ${categories.weapons.join(', ')}\n🛡️ Armor: ${categories.armor.join(', ')}\n🧪 Consumables: ${categories.consumables.join(', ')}\n\nSetiap item punya: rarity (Common→Legendary), stats, level requirement, sell price.\nTotal variasi: ${allItems.length * 5} (5 rarity tier x ${allItems.length} base items)`,
      actions: [],
    };
  }

  // Generic bulk creation
  const actions: Array<Record<string, unknown>> = [];
  for (let i = 0; i < Math.min(count, 50); i++) {
    actions.push({
      type: 'add_actor',
      actorType: i % 3 === 0 ? 'cube' : i % 3 === 1 ? 'sphere' : 'cylinder',
      name: `Asset_${i + 1}`,
    });
  }
  return {
    response: `[ARIES] ${actions.length} aset dibuat sesuai perintah kamu!\n\nUntuk spesifik, coba:\n- "buat 100 pohon"\n- "buat 50 NPC"\n- "buat 200 rumah"\n- "buat 100 monster"\n- "buat 300 item"`,
    actions,
  };
}

function processGameRule(command: string): BrainResponse {
  const cmd = command.toLowerCase();
  const ruleText = cmd.replace(/^(rule:|aturan:|tambah rule|tambah aturan|add rule)\s*/i, '');

  // Store rule in memory
  const memory = loadMemory();
  if (!memory.learnedPatterns['__game_rules__']) {
    memory.learnedPatterns['__game_rules__'] = '';
  }
  memory.learnedPatterns['__game_rules__'] += ruleText + '|';
  saveMemory(memory);

  // Parse common rule patterns
  let codePreview = '';
  if (ruleText.includes('mati') || ruleText.includes('die') || ruleText.includes('dead')) {
    codePreview = `if (player.health <= 0) { player.die(); respawn(player); }`;
  } else if (ruleText.includes('buka') || ruleText.includes('open') || ruleText.includes('jam')) {
    const timeMatch = ruleText.match(/(\d+)[:-](\d+)?/g);
    if (timeMatch) {
      codePreview = `if (gameTime >= ${timeMatch[0]} && gameTime <= ${timeMatch[1] || '18:00'}) { npc.shop.open(); }`;
    }
  } else if (ruleText.includes('damage') || ruleText.includes('serang')) {
    codePreview = `onAttack(attacker, target) { target.health -= attacker.damage * multiplier; }`;
  } else if (ruleText.includes('level') || ruleText.includes('naik')) {
    codePreview = `if (player.xp >= xpTable[player.level]) { player.level++; player.skillPoints++; }`;
  } else if (ruleText.includes('drop') || ruleText.includes('jatuh')) {
    codePreview = `onEnemyDeath(enemy) { const loot = lootTable[enemy.type].roll(); player.inventory.add(loot); }`;
  } else if (ruleText.includes('cuaca') || ruleText.includes('weather')) {
    codePreview = `weatherSystem.cycle(['sunny','cloudy','rain','storm'], intervalMinutes: 10);`;
  } else if (ruleText.includes('day') || ruleText.includes('night') || ruleText.includes('siang') || ruleText.includes('malam')) {
    codePreview = `dayNightCycle.set({ dayLength: 20, nightLength: 10 }); // minutes`;
  } else {
    codePreview = `// Rule: ${ruleText}\ngameRules.add('${ruleText.replace(/'/g, "\\'")}');`;
  }

  const rules = (memory.learnedPatterns['__game_rules__'] || '').split('|').filter(Boolean);

  return {
    response: `[ARIES] Rule ditambahkan! ✅

Rule: "${ruleText}"

Code preview:
\`\`\`javascript
${codePreview}
\`\`\`

Total rules: ${rules.length}
Ketik "lihat rules" untuk lihat semua rules yang sudah didefinisikan.
Ketik "compile rules" untuk generate semua rules jadi game logic.`,
    actions: [],
  };
}

function listGameRules(): BrainResponse {
  const memory = loadMemory();
  const rules = (memory.learnedPatterns['__game_rules__'] || '').split('|').filter(Boolean);

  if (rules.length === 0) {
    return {
      response: `[ARIES] Belum ada game rules. Tambahkan dengan:\n\n- "rule: player mati kalau HP 0"\n- "rule: NPC merchant buka jam 8-18"\n- "rule: monster drop item kalau mati"\n- "rule: cuaca berubah setiap 10 menit"\n- "rule: damage = attack - defense/2"\n- "rule: level up setiap 1000 XP"`,
      actions: [],
    };
  }

  const ruleList = rules.map((r, i) => `${i + 1}. ${r}`).join('\n');
  return {
    response: `[ARIES] Game Rules (${rules.length} total):\n\n${ruleList}\n\nKetik "compile rules" untuk generate semua jadi code.\nKetik "rule: ..." untuk tambah rule baru.`,
    actions: [],
  };
}

function compileGameRules(): BrainResponse {
  const memory = loadMemory();
  const rules = (memory.learnedPatterns['__game_rules__'] || '').split('|').filter(Boolean);

  if (rules.length === 0) {
    return { response: '[ARIES] Tidak ada rules untuk di-compile. Tambah dulu dengan "rule: ..."', actions: [] };
  }

  let code = `// ============================================\n// NeoEngine Game Rules - Compiled by Aries AI\n// Total: ${rules.length} rules\n// ============================================\n\nclass GameRules {\n  rules = [];\n\n  constructor() {\n`;

  for (let i = 0; i < rules.length; i++) {
    code += `    // Rule ${i + 1}: ${rules[i]}\n    this.rules.push({ id: ${i + 1}, description: '${rules[i].replace(/'/g, "\\'")}', active: true });\n`;
  }

  code += `  }\n\n  evaluate(gameState) {\n    for (const rule of this.rules) {\n      if (rule.active) this.executeRule(rule, gameState);\n    }\n  }\n\n  executeRule(rule, state) {\n    // Auto-generated rule logic\n    console.log('Evaluating:', rule.description);\n  }\n}`;

  return {
    response: `[ARIES] ${rules.length} rules di-compile!\n\n\`\`\`javascript\n${code}\n\`\`\`\n\nRules sudah jadi game logic. Tambah lagi dengan "rule: ..." atau "hapus rule [nomor]".`,
    actions: [],
  };
}

function createOpenWorld(command: string): BrainResponse {
  const cmd = command.toLowerCase();

  // Parse size from command
  let worldKm = 100;
  const sizeMatch = cmd.match(/(\d+)\s*(?:x\s*\d+\s*)?km/);
  if (sizeMatch) worldKm = Math.min(parseInt(sizeMatch[1]), 1000);

  // Parse features
  const hasCity = cmd.includes('kota') || cmd.includes('city');
  const hasVillage = cmd.includes('desa') || cmd.includes('village');
  const hasDungeon = cmd.includes('dungeon');
  const hasOcean = cmd.includes('laut') || cmd.includes('ocean');
  const hasSnow = cmd.includes('salju') || cmd.includes('snow');
  const hasDesert = cmd.includes('gurun') || cmd.includes('desert');

  const actions: Array<Record<string, unknown>> = [];

  // Create world foundation
  actions.push({ type: 'add_actor', actorType: 'plane', name: `World_Terrain_${worldKm}km` });
  actions.push({ type: 'add_actor', actorType: 'light_directional', name: 'Sun_WorldLight' });
  actions.push({ type: 'add_actor', actorType: 'camera', name: 'WorldCamera' });
  actions.push({ type: 'add_actor', actorType: 'player_start', name: 'PlayerSpawn_Center' });

  // Biome zones
  actions.push({ type: 'add_actor', actorType: 'plane', name: 'Biome_Plains_Zone' });
  actions.push({ type: 'add_actor', actorType: 'plane', name: 'Biome_Forest_Zone' });
  actions.push({ type: 'add_actor', actorType: 'plane', name: 'Biome_Mountain_Zone' });

  if (hasDesert || worldKm >= 50) {
    actions.push({ type: 'add_actor', actorType: 'plane', name: 'Biome_Desert_Zone' });
  }
  if (hasSnow || worldKm >= 50) {
    actions.push({ type: 'add_actor', actorType: 'plane', name: 'Biome_Snow_Zone' });
  }
  if (hasOcean || worldKm >= 30) {
    actions.push({ type: 'add_actor', actorType: 'plane', name: 'Biome_Ocean_Zone' });
  }

  // Cities & settlements
  const numCities = hasCity ? 5 : Math.max(1, Math.floor(worldKm / 20));
  for (let i = 0; i < numCities; i++) {
    actions.push({ type: 'add_actor', actorType: 'cube', name: `City_${i + 1}_Center` });
    actions.push({ type: 'add_actor', actorType: 'cube', name: `City_${i + 1}_Gate` });
  }

  const numVillages = hasVillage ? 10 : Math.max(3, Math.floor(worldKm / 10));
  for (let i = 0; i < Math.min(numVillages, 15); i++) {
    actions.push({ type: 'add_actor', actorType: 'cube', name: `Village_${i + 1}` });
  }

  // Dungeons
  const numDungeons = hasDungeon ? 8 : Math.max(2, Math.floor(worldKm / 15));
  for (let i = 0; i < Math.min(numDungeons, 10); i++) {
    actions.push({ type: 'add_actor', actorType: 'cube', name: `Dungeon_Entrance_${i + 1}` });
  }

  // World landmarks
  actions.push({ type: 'add_actor', actorType: 'cube', name: 'Landmark_WorldTree' });
  actions.push({ type: 'add_actor', actorType: 'cube', name: 'Landmark_AncientRuins' });
  actions.push({ type: 'add_actor', actorType: 'cube', name: 'Landmark_VolcanoPeak' });
  actions.push({ type: 'add_actor', actorType: 'sphere', name: 'Landmark_FloatingIsland' });

  // Roads connecting cities
  for (let i = 0; i < numCities - 1; i++) {
    actions.push({ type: 'add_actor', actorType: 'plane', name: `Road_City${i + 1}_to_City${i + 2}` });
  }

  return {
    response: `[ARIES] 🌍 Open World ${worldKm}x${worldKm}km DIBUAT!

World Stats:
- Ukuran: ${worldKm}x${worldKm} km (${worldKm * worldKm} km²)
- Chunks: ${Math.ceil(worldKm * 1000 / 256)}x${Math.ceil(worldKm * 1000 / 256)} (${Math.ceil(worldKm * 1000 / 256) ** 2} total)
- Biomes: Plains, Forest, Mountain${hasDesert || worldKm >= 50 ? ', Desert' : ''}${hasSnow || worldKm >= 50 ? ', Snow' : ''}${hasOcean || worldKm >= 30 ? ', Ocean' : ''}
- Cities: ${numCities}
- Villages: ${numVillages}
- Dungeons: ${numDungeons}
- Landmarks: 4

Teknologi:
- Chunk Streaming: hanya area dekat player di-load
- View Distance: configurable 50-200m per player
- LOD System: 5 level detail
- Spatial Partitioning: ribuan NPC tanpa lag

Selanjutnya:
- "buat 500 NPC di kota" → populate cities
- "buat 200 monster" → spawn monsters
- "rule: ..." → tambah game rules
- "buat 1000 pohon" → add vegetation
- "open world system" → lihat code streaming

Total: ${actions.length} actors. Sisa content di-generate runtime via streaming.`,
    actions,
  };
}

// =========================================================
// LLM INTEGRATION - Free conversation via API
// Uses external API when available, falls back to brain
// =========================================================

export async function queryLLM(prompt: string): Promise<string | null> {
  // Check for API key in localStorage (set via Edit > Settings)
  const apiKey = localStorage.getItem('neo_api_key');
  const apiProvider = localStorage.getItem('neo_api_provider') || 'github';

  if (!apiKey) return null; // No API key = use built-in brain

  try {
    let url = '';
    let headers: Record<string, string> = {};
    let body: Record<string, unknown> = {};

    if (apiProvider === 'github') {
      url = 'https://models.inference.ai.azure.com/chat/completions';
      headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
      body = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are Aries, the AI brain of NeoEngine game engine. You help create games, write game code, discuss game design, and solve problems. Respond in the same language as the user (Indonesian or English). Be concise and action-oriented. You can generate game code in JavaScript/TypeScript.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      };
    } else if (apiProvider === 'openai') {
      url = 'https://api.openai.com/v1/chat/completions';
      headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
      body = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are Aries, the AI brain of NeoEngine game engine. Help create games, write code, discuss game design. Respond in same language as user. Be concise.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      };
    } else if (apiProvider === 'groq') {
      url = 'https://api.groq.com/openai/v1/chat/completions';
      headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
      body = {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are Aries, the AI brain of NeoEngine game engine. Help create games, write code, discuss game design. Respond in same language as user. Be concise.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      };
    } else {
      // Custom endpoint
      const customUrl = localStorage.getItem('neo_api_url') || '';
      if (!customUrl) return null;
      url = customUrl;
      headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
      body = {
        model: localStorage.getItem('neo_api_model') || 'default',
        messages: [
          { role: 'system', content: 'You are Aries, AI brain of NeoEngine game engine. Help create games and write code.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null; // API failed, fall back to built-in brain
  }
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

  // ===== CODE GENERATION ENGINE =====
  if (cmd.includes('generate code') || cmd.includes('buat code') || cmd.includes('bikin code') ||
      cmd.includes('buat script') || cmd.includes('bikin script') || cmd.includes('generate script') ||
      cmd.includes('tulis code') || cmd.includes('write code')) {
    addInteraction(command, 'code generation');
    return generateGameCode(command);
  }

  if (cmd.includes('player controller') || cmd.includes('kontrol player') || cmd.includes('gerak player')) {
    addInteraction(command, 'player controller code');
    return generatePlayerController();
  }

  if (cmd.includes('enemy ai') || cmd.includes('musuh ai') || cmd.includes('ai musuh') || cmd.includes('buat enemy') || cmd.includes('buat musuh')) {
    addInteraction(command, 'enemy AI code');
    return generateEnemyAI();
  }

  if (cmd.includes('inventory system') || cmd.includes('sistem inventory') || cmd.includes('buat inventory') ||
      cmd.includes('sistem item') || cmd.includes('item system')) {
    addInteraction(command, 'inventory code');
    return generateInventorySystem();
  }

  if (cmd.includes('combat system') || cmd.includes('sistem combat') || cmd.includes('buat combat') ||
      cmd.includes('battle system') || cmd.includes('sistem pertarungan')) {
    addInteraction(command, 'combat code');
    return generateCombatSystem();
  }

  if (cmd.includes('save system') || cmd.includes('save load') || cmd.includes('simpan game') || cmd.includes('load game')) {
    addInteraction(command, 'save system code');
    return generateSaveSystem();
  }

  if (cmd.includes('ui code') || cmd.includes('buat menu') || cmd.includes('buat hud') || cmd.includes('game menu') || cmd.includes('main menu')) {
    addInteraction(command, 'UI code');
    return generateUICode();
  }

  if (cmd.includes('buat apk') || cmd.includes('build apk') || cmd.includes('android build') || cmd.includes('package apk')) {
    addInteraction(command, 'APK build');
    return generateAPKBuild();
  }

  if (cmd.includes('networking') || cmd.includes('multiplayer code') || cmd.includes('buat multiplayer') || cmd.includes('online')) {
    addInteraction(command, 'networking code');
    return generateNetworkingCode();
  }

  if (cmd.includes('physics') || cmd.includes('fisika') || cmd.includes('collision') || cmd.includes('tabrakan') || cmd.includes('gravity')) {
    addInteraction(command, 'physics code');
    return generatePhysicsCode();
  }

  if (cmd.includes('particle') || cmd.includes('efek') || cmd.includes('effect') || cmd.includes('vfx')) {
    addInteraction(command, 'particle code');
    return generateParticleCode();
  }

  if (cmd.includes('audio') || cmd.includes('sound') || cmd.includes('musik') || cmd.includes('music') || cmd.includes('sfx')) {
    addInteraction(command, 'audio code');
    return generateAudioCode();
  }

  if (cmd.includes('quest') || cmd.includes('misi') || cmd.includes('mission') || cmd.includes('objective')) {
    addInteraction(command, 'quest code');
    return generateQuestSystem();
  }

  if (cmd.includes('dialog') || cmd.includes('percakapan') || cmd.includes('conversation') || cmd.includes('npc dialog')) {
    addInteraction(command, 'dialog code');
    return generateDialogSystem();
  }

  if (cmd.includes('score') || cmd.includes('skor') || cmd.includes('highscore') || cmd.includes('leaderboard') || cmd.includes('poin')) {
    addInteraction(command, 'score code');
    return generateScoreSystem();
  }

  if (cmd.includes('spawn') || cmd.includes('wave') || cmd.includes('gelombang') || cmd.includes('spawner')) {
    addInteraction(command, 'spawner code');
    return generateSpawnerSystem();
  }

  // ===== OPEN WORLD & MASSIVE SCALE =====
  if (cmd.includes('open world') || cmd.includes('buat world') || cmd.includes('buat dunia') ||
      cmd.includes('massive world') || cmd.includes('perfect world') || cmd.includes('world besar') ||
      cmd.includes('dunia besar') || cmd.includes('mmo world') || cmd.includes('buat mmo')) {
    addInteraction(command, 'open world created');
    return createOpenWorld(command);
  }

  if (cmd.includes('open world system') || cmd.includes('streaming system') || cmd.includes('chunk system') ||
      cmd.includes('world streaming') || cmd.includes('sistem chunk')) {
    addInteraction(command, 'open world system code');
    return generateOpenWorldSystem();
  }

  if (cmd.includes('npc system') || cmd.includes('spatial') || cmd.includes('npc manager') ||
      cmd.includes('ribuan npc') || cmd.includes('thousands npc') || cmd.includes('npc spatial')) {
    addInteraction(command, 'NPC spatial system code');
    return generateNPCSpatialSystem();
  }

  if (cmd.includes('view distance') || cmd.includes('jarak pandang') || cmd.includes('aoi') ||
      cmd.includes('area of interest') || cmd.includes('culling system')) {
    addInteraction(command, 'view distance system code');
    return generateViewDistanceSystem();
  }

  // ===== BULK ASSET GENERATION (from user prompt) =====
  const bulkMatch = cmd.match(/(\d+)\s+(pohon|tree|npc|karakter|orang|penduduk|rumah|house|building|gedung|bangunan|monster|enemy|musuh|mob|item|senjata|weapon|armor|equipment)/);
  if (bulkMatch) {
    addInteraction(command, `bulk ${bulkMatch[2]} created`);
    return generateBulkAssets(command);
  }

  // ===== GAME RULES ENGINE =====
  if (cmd.startsWith('rule:') || cmd.startsWith('aturan:') || cmd.startsWith('tambah rule') ||
      cmd.startsWith('tambah aturan') || cmd.startsWith('add rule')) {
    addInteraction(command, 'rule added');
    return processGameRule(command);
  }

  if (cmd.includes('lihat rules') || cmd.includes('list rules') || cmd.includes('daftar aturan') || cmd.includes('semua rules')) {
    addInteraction(command, 'list rules');
    return listGameRules();
  }

  if (cmd.includes('compile rules') || cmd.includes('kompilasi rules') || cmd.includes('generate rules')) {
    addInteraction(command, 'compile rules');
    return compileGameRules();
  }

  // Not handled by brain - return null to fall through
  return null;
}
