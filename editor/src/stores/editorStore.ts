import { create } from 'zustand';
import type { EditorState, ActorType, Transform, ChatMessage, NeoActor, TransformMode, TransformSpace, ViewMode } from '../types/editor';

let actorCounter = 0;
let messageCounter = 0;

function generateId(): string {
  return `actor_${++actorCounter}_${Date.now()}`;
}

function generateMessageId(): string {
  return `msg_${++messageCounter}_${Date.now()}`;
}

function createDefaultTransform(): Transform {
  return {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  };
}

function getActorIcon(type: ActorType): string {
  const icons: Record<ActorType, string> = {
    empty: '○',
    cube: '⬜',
    sphere: '⚪',
    plane: '▬',
    cylinder: '⬛',
    light_directional: '☀',
    light_point: '💡',
    light_spot: '🔦',
    camera: '📷',
    static_mesh: '🔷',
    skeletal_mesh: '🦴',
    particle_system: '✨',
    audio_source: '🔊',
    trigger_volume: '🟩',
    player_start: '🚩',
    landscape: '🏔',
  };
  return icons[type] || '○';
}

// Default scene with some actors
function createDefaultScene(): Record<string, NeoActor> {
  const actors: Record<string, NeoActor> = {};
  
  const dirLight: NeoActor = {
    id: 'actor_default_dirlight',
    name: 'DirectionalLight',
    type: 'light_directional',
    transform: {
      position: { x: 0, y: 10, z: 0 },
      rotation: { x: -45, y: 30, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    visible: true,
    children: [],
    parentId: null,
    components: [
      {
        id: 'comp_light_1',
        type: 'DirectionalLightComponent',
        name: 'Light',
        properties: {
          intensity: 1.0,
          color: '#fffaf0',
          castShadows: true,
        },
      },
    ],
  };

  const floor: NeoActor = {
    id: 'actor_default_floor',
    name: 'Floor',
    type: 'plane',
    transform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 50, y: 1, z: 50 },
    },
    visible: true,
    children: [],
    parentId: null,
    components: [
      {
        id: 'comp_mesh_floor',
        type: 'StaticMeshComponent',
        name: 'Mesh',
        properties: {
          mesh: '/Engine/BasicShapes/Plane',
          material: '/Engine/Materials/GridMaterial',
        },
      },
    ],
  };

  const playerStart: NeoActor = {
    id: 'actor_default_playerstart',
    name: 'PlayerStart',
    type: 'player_start',
    transform: {
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    visible: true,
    children: [],
    parentId: null,
    components: [],
  };

  const camera: NeoActor = {
    id: 'actor_default_camera',
    name: 'CameraActor',
    type: 'camera',
    transform: {
      position: { x: 5, y: 4, z: 8 },
      rotation: { x: -20, y: -30, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    visible: true,
    children: [],
    parentId: null,
    components: [
      {
        id: 'comp_camera_1',
        type: 'CameraComponent',
        name: 'Camera',
        properties: {
          fov: 90,
          nearClip: 0.1,
          farClip: 10000,
        },
      },
    ],
  };

  actors[dirLight.id] = dirLight;
  actors[floor.id] = floor;
  actors[playerStart.id] = playerStart;
  actors[camera.id] = camera;

  return actors;
}

// Undo/Redo history
const undoStack: Array<Record<string, NeoActor>> = [];
const redoStack: Array<Record<string, NeoActor>> = [];
const MAX_UNDO = 50;

function pushUndo(actors: Record<string, NeoActor>) {
  undoStack.push(JSON.parse(JSON.stringify(actors)));
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  redoStack.length = 0; // clear redo on new action
}

// Backend API URL - try deployed backend first, fall back to local
const API_BASE = (() => {
  // Will be set after deployment
  const deployed = '';
  if (deployed) return deployed;
  return '';  // relative URL for same-origin or local dev
})();

// Client-side AI processing (works without backend)
function processCommandOffline(command: string, actors: Record<string, NeoActor>): { response: string; actions: Array<Record<string, unknown>> } {
  const cmd = command.toLowerCase().trim();

  // Actor creation
  const actorPatterns: Array<{ keys: string[]; type: string; name: string }> = [
    { keys: ['buat cube', 'tambah cube', 'add cube', 'create cube', 'bikin cube'], type: 'cube', name: 'Cube' },
    { keys: ['buat sphere', 'tambah sphere', 'add sphere', 'buat bola', 'bikin bola'], type: 'sphere', name: 'Sphere' },
    { keys: ['buat plane', 'tambah plane', 'add plane', 'buat lantai', 'bikin lantai'], type: 'plane', name: 'Plane' },
    { keys: ['buat cylinder', 'tambah cylinder', 'add cylinder', 'bikin silinder'], type: 'cylinder', name: 'Cylinder' },
    { keys: ['buat light', 'tambah light', 'add light', 'tambah lampu', 'buat lampu', 'bikin lampu'], type: 'light_point', name: 'PointLight' },
    { keys: ['buat camera', 'tambah camera', 'add camera', 'tambah kamera', 'bikin kamera'], type: 'camera', name: 'CameraActor' },
    { keys: ['buat player', 'add player', 'player start'], type: 'player_start', name: 'PlayerStart' },
  ];

  for (const pattern of actorPatterns) {
    if (pattern.keys.some(k => cmd.includes(k))) {
      return {
        response: `Saya membuat ${pattern.name} di scene. Klik objek di Outliner untuk edit transform-nya di panel Details.`,
        actions: [{ type: 'add_actor', actorType: pattern.type, name: pattern.name }],
      };
    }
  }

  // Multiple actors
  if (cmd.includes('buat scene') || cmd.includes('create scene') || cmd.includes('buat level') || cmd.includes('bikin level')) {
    return {
      response: 'Saya membuat scene dasar dengan floor, lighting, dan beberapa objek. Scene siap untuk diedit!',
      actions: [
        { type: 'add_actor', actorType: 'plane', name: 'Ground' },
        { type: 'add_actor', actorType: 'cube', name: 'Wall_1' },
        { type: 'add_actor', actorType: 'cube', name: 'Wall_2' },
        { type: 'add_actor', actorType: 'sphere', name: 'Prop_Ball' },
        { type: 'add_actor', actorType: 'light_point', name: 'SceneLight' },
      ],
    };
  }

  // Game templates
  if (cmd.includes('/template') || cmd.includes('game template') || cmd.includes('buat game') || cmd.includes('bikin game')) {
    return {
      response: `[ARIES GAME TEMPLATE GENERATOR]

Pilih template game yang mau dibuat:

1. "buat game sudoku" - Puzzle game sederhana
2. "buat game farmville" - Farming simulation
3. "buat game fps" - First person shooter
4. "buat game platformer" - Side-scrolling platformer
5. "buat game rpg" - Role-playing game

Atau deskripsikan game kamu dan saya akan buatkan template-nya!

Contoh: "buat game puzzle dengan 9x9 grid dan angka"`,
      actions: [],
    };
  }

  // Sudoku game template
  if (cmd.includes('sudoku') || cmd.includes('puzzle grid')) {
    return {
      response: `[ARIES] Membuat template game Sudoku/Puzzle...

Scene sudah dibuat dengan:
- GameBoard (plane sebagai papan)
- 9 Grid cells (cube kecil)
- UI Camera untuk tampilan top-down
- GameLight untuk pencahayaan
- PlayerStart

Untuk gameplay logic, gunakan perintah:
"generate script sudoku controller"`,
      actions: [
        { type: 'add_actor', actorType: 'plane', name: 'GameBoard' },
        { type: 'add_actor', actorType: 'cube', name: 'Cell_1' },
        { type: 'add_actor', actorType: 'cube', name: 'Cell_2' },
        { type: 'add_actor', actorType: 'cube', name: 'Cell_3' },
        { type: 'add_actor', actorType: 'cube', name: 'Cell_4' },
        { type: 'add_actor', actorType: 'cube', name: 'Cell_5' },
        { type: 'add_actor', actorType: 'cube', name: 'Cell_6' },
        { type: 'add_actor', actorType: 'cube', name: 'Cell_7' },
        { type: 'add_actor', actorType: 'cube', name: 'Cell_8' },
        { type: 'add_actor', actorType: 'cube', name: 'Cell_9' },
        { type: 'add_actor', actorType: 'camera', name: 'UICamera' },
        { type: 'add_actor', actorType: 'light_point', name: 'GameLight' },
      ],
    };
  }

  // Farmville game template
  if (cmd.includes('farmville') || cmd.includes('farm') || cmd.includes('farming')) {
    return {
      response: `[ARIES] Membuat template game Farming Simulation (Farmville-style)...

Scene sudah dibuat dengan:
- FarmLand (plane hijau sebagai tanah)
- House (cube untuk rumah petani)
- Barn (cube untuk gudang)
- FarmPlot_1 s/d 4 (area tanam)
- Tree_1 & Tree_2 (pohon dekorasi)
- WaterWell (sumber air)
- FarmCamera (kamera isometrik)
- SunLight (matahari)

Untuk gameplay: "generate script farm controller"
Untuk asset: "buat asset tanaman" atau "buat asset hewan"`,
      actions: [
        { type: 'add_actor', actorType: 'plane', name: 'FarmLand' },
        { type: 'add_actor', actorType: 'cube', name: 'House' },
        { type: 'add_actor', actorType: 'cube', name: 'Barn' },
        { type: 'add_actor', actorType: 'cube', name: 'FarmPlot_1' },
        { type: 'add_actor', actorType: 'cube', name: 'FarmPlot_2' },
        { type: 'add_actor', actorType: 'cube', name: 'FarmPlot_3' },
        { type: 'add_actor', actorType: 'cube', name: 'FarmPlot_4' },
        { type: 'add_actor', actorType: 'cylinder', name: 'Tree_1' },
        { type: 'add_actor', actorType: 'cylinder', name: 'Tree_2' },
        { type: 'add_actor', actorType: 'cylinder', name: 'WaterWell' },
        { type: 'add_actor', actorType: 'camera', name: 'FarmCamera' },
        { type: 'add_actor', actorType: 'light_directional', name: 'SunLight' },
        { type: 'add_actor', actorType: 'player_start', name: 'FarmerSpawn' },
      ],
    };
  }

  // FPS game template
  if (cmd.includes('fps') || cmd.includes('shooter') || cmd.includes('tembak')) {
    return {
      response: `[ARIES] Membuat template game First Person Shooter...

Scene FPS dibuat dengan:
- Arena (plane lantai)
- Wall/Cover objects (cube sebagai tembok dan perlindungan)
- SpawnPoint_A & B (titik spawn)
- Weapon pickup
- FPS Camera
- Lighting

Untuk gameplay: "generate script fps controller"`,
      actions: [
        { type: 'add_actor', actorType: 'plane', name: 'Arena' },
        { type: 'add_actor', actorType: 'cube', name: 'Wall_North' },
        { type: 'add_actor', actorType: 'cube', name: 'Wall_South' },
        { type: 'add_actor', actorType: 'cube', name: 'Wall_East' },
        { type: 'add_actor', actorType: 'cube', name: 'Wall_West' },
        { type: 'add_actor', actorType: 'cube', name: 'Cover_1' },
        { type: 'add_actor', actorType: 'cube', name: 'Cover_2' },
        { type: 'add_actor', actorType: 'cube', name: 'Cover_3' },
        { type: 'add_actor', actorType: 'sphere', name: 'WeaponPickup' },
        { type: 'add_actor', actorType: 'player_start', name: 'SpawnPoint_A' },
        { type: 'add_actor', actorType: 'player_start', name: 'SpawnPoint_B' },
        { type: 'add_actor', actorType: 'camera', name: 'FPSCamera' },
        { type: 'add_actor', actorType: 'light_directional', name: 'SunLight' },
        { type: 'add_actor', actorType: 'light_point', name: 'AmbientLight' },
      ],
    };
  }

  // RPG game template
  if (cmd.includes('rpg') || cmd.includes('role playing')) {
    return {
      response: `[ARIES] Membuat template RPG World...

World RPG dibuat dengan:
- Terrain (landscape plane)
- Village (buildings)
- NPCs spawn points
- Dungeon entrance
- Quest markers
- Player spawn
- World lighting

Untuk gameplay: "generate script rpg controller"`,
      actions: [
        { type: 'add_actor', actorType: 'plane', name: 'Terrain' },
        { type: 'add_actor', actorType: 'cube', name: 'Village_House_1' },
        { type: 'add_actor', actorType: 'cube', name: 'Village_House_2' },
        { type: 'add_actor', actorType: 'cube', name: 'Village_Shop' },
        { type: 'add_actor', actorType: 'cube', name: 'DungeonEntrance' },
        { type: 'add_actor', actorType: 'cylinder', name: 'Tower' },
        { type: 'add_actor', actorType: 'sphere', name: 'QuestMarker_1' },
        { type: 'add_actor', actorType: 'sphere', name: 'QuestMarker_2' },
        { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Forest_1' },
        { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Forest_2' },
        { type: 'add_actor', actorType: 'cylinder', name: 'Tree_Forest_3' },
        { type: 'add_actor', actorType: 'player_start', name: 'HeroSpawn' },
        { type: 'add_actor', actorType: 'light_directional', name: 'WorldSun' },
        { type: 'add_actor', actorType: 'camera', name: 'RPGCamera' },
      ],
    };
  }

  // Platformer template
  if (cmd.includes('platformer') || cmd.includes('platform') || cmd.includes('mario')) {
    return {
      response: `[ARIES] Membuat template Platformer Game...

Level platformer dibuat dengan platforms, obstacles, collectibles, dan player spawn.`,
      actions: [
        { type: 'add_actor', actorType: 'cube', name: 'Platform_Start' },
        { type: 'add_actor', actorType: 'cube', name: 'Platform_2' },
        { type: 'add_actor', actorType: 'cube', name: 'Platform_3' },
        { type: 'add_actor', actorType: 'cube', name: 'Platform_4' },
        { type: 'add_actor', actorType: 'cube', name: 'Platform_End' },
        { type: 'add_actor', actorType: 'sphere', name: 'Collectible_1' },
        { type: 'add_actor', actorType: 'sphere', name: 'Collectible_2' },
        { type: 'add_actor', actorType: 'sphere', name: 'Collectible_3' },
        { type: 'add_actor', actorType: 'cylinder', name: 'Obstacle_1' },
        { type: 'add_actor', actorType: 'cylinder', name: 'Obstacle_2' },
        { type: 'add_actor', actorType: 'player_start', name: 'PlayerSpawn' },
        { type: 'add_actor', actorType: 'camera', name: 'SideCamera' },
        { type: 'add_actor', actorType: 'light_directional', name: 'SunLight' },
      ],
    };
  }

  // Asset generation
  if (cmd.includes('/assets') || cmd.includes('buat asset') || cmd.includes('generate asset') || cmd.includes('bikin asset')) {
    return {
      response: `[ARIES ASSET GENERATOR]

Saya bisa generate asset berikut:

Meshes:
- "buat mesh pohon" - Generate tree mesh
- "buat mesh rumah" - Generate house mesh
- "buat mesh karakter" - Generate character mesh

Materials:
- "buat material kayu" - Wood material
- "buat material metal" - Metal material
- "buat material air" - Water material

Untuk generate asset kustom, deskripsikan apa yang kamu mau:
Contoh: "buat asset gedung 3 lantai dengan jendela"

Note: Asset generation penuh memerlukan API key.
Set di backend: export AI_API_KEY=your_key`,
      actions: [],
    };
  }

  // Scene info
  if (cmd.includes('status') || cmd.includes('info') || cmd.includes('statistik')) {
    const actorCount = Object.keys(actors).length;
    const types: Record<string, number> = {};
    Object.values(actors).forEach(a => { types[a.type] = (types[a.type] || 0) + 1; });
    const typeList = Object.entries(types).map(([t, c]) => `  ${t}: ${c}`).join('\n');
    return {
      response: `[ARIES ENGINE STATUS]

Scene Statistics:
- Total Actors: ${actorCount}
- Actor Types:
${typeList}

Engine: NeoEngine v1.0 (Fauzan Engine)
AI: Aries Sovereign Brain v3.5
Mode: ${API_BASE ? 'Online (LLM)' : 'Offline (Client-side)'}
Editor: Web (React + Three.js)
Rendering: Three.js WebGL
Engine Core: C++20 (ECS + Vulkan RHI)`,
      actions: [],
    };
  }

  // Delete commands
  if (cmd.includes('hapus semua') || cmd.includes('delete all') || cmd.includes('clear scene') || cmd.includes('bersihkan')) {
    return {
      response: 'Scene sudah dibersihkan. Semua actor dihapus.',
      actions: [{ type: 'clear_scene' }],
    };
  }

  // Help
  if (cmd.includes('help') || cmd.includes('bantu') || cmd.includes('tolong') || cmd.includes('apa yang bisa')) {
    return {
      response: `[ARIES AI v3.5 - NeoEngine Assistant]

PERINTAH DASAR:
  "buat cube" / "add sphere" / "tambah cylinder" - Tambah objek
  "buat lampu" / "buat camera" - Tambah light/camera
  "hapus semua" - Bersihkan scene

GAME TEMPLATES:
  "buat game sudoku" - Puzzle game
  "buat game farmville" - Farming simulation
  "buat game fps" - First person shooter
  "buat game platformer" - Side-scrolling game
  "buat game rpg" - Role-playing game

SCENE:
  "buat scene" / "buat level" - Buat scene dasar
  "status" - Info engine dan scene

TOOLS:
  "/template" - Game template generator
  "/assets" - Asset generator

KEYBOARD SHORTCUTS:
  W/E/R - Translate/Rotate/Scale
  Ctrl+Z/Y - Undo/Redo
  Ctrl+S - Save Scene
  Ctrl+N - New Scene
  Ctrl+D - Duplicate
  Del - Delete selected

Untuk AI penuh (generate code, desain level detail):
Set API key di backend: export AI_API_KEY=your_key`,
      actions: [],
    };
  }

  // Default - try to be helpful
  return {
    response: `Perintah diterima: "${command}"

Saya Aries AI, bisa bantu kamu buat game! Coba perintah:
- "buat cube" / "add sphere" - Tambah objek
- "buat game farmville" - Template farming game
- "buat game sudoku" - Template puzzle game
- "buat scene" - Buat level dasar
- "help" - Lihat semua perintah

Untuk AI penuh dengan generate code & level detail, jalankan backend dengan API key.`,
    actions: [],
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Scene
  actors: createDefaultScene(),
  selectedActorId: null,

  // Tools
  transformMode: 'translate',
  transformSpace: 'world',
  viewMode: 'perspective',
  isPlaying: false,
  isPaused: false,
  snapEnabled: false,
  gridVisible: true,

  // AI
  chatMessages: [
    {
      id: 'msg_welcome',
      role: 'system',
      content: 'Aries AI Engine v3.5 - NeoEngine Autonomous Assistant',
      timestamp: Date.now(),
    },
    {
      id: 'msg_welcome_2',
      role: 'assistant',
      content: 'Halo! Saya Aries, AI assistant untuk NeoEngine. Saya bisa bantu kamu:\n\n- Membuat dan memodifikasi actors di scene\n- Generate game templates (Sudoku, Farmville, FPS, RPG, Platformer)\n- Manage scene (save/load/export)\n- Generate code dan assets\n\nKetik "help" untuk lihat semua perintah, atau langsung ketik apa yang kamu mau!',
      timestamp: Date.now(),
    },
  ],
  isAiThinking: false,

  // Connection
  engineConnected: false,
  ariesConnected: false,
  fps: 60,

  // Content Browser
  currentPath: '/Game',
  assets: [
    { id: 'a1', name: 'Maps', type: 'folder', path: '/Game/Maps' },
    { id: 'a2', name: 'Blueprints', type: 'folder', path: '/Game/Blueprints' },
    { id: 'a3', name: 'Materials', type: 'folder', path: '/Game/Materials' },
    { id: 'a4', name: 'Meshes', type: 'folder', path: '/Game/Meshes' },
    { id: 'a5', name: 'Textures', type: 'folder', path: '/Game/Textures' },
    { id: 'a6', name: 'Sounds', type: 'folder', path: '/Game/Sounds' },
    { id: 'a7', name: 'Animations', type: 'folder', path: '/Game/Animations' },
    { id: 'a8', name: 'Particles', type: 'folder', path: '/Game/Particles' },
    { id: 'a9', name: 'Scripts', type: 'folder', path: '/Game/Scripts' },
    { id: 'a10', name: 'DefaultLevel', type: 'level', path: '/Game/Maps/DefaultLevel' },
    { id: 'a11', name: 'M_Grid', type: 'material', path: '/Game/Materials/M_Grid' },
    { id: 'a12', name: 'M_Default', type: 'material', path: '/Game/Materials/M_Default' },
    { id: 'a13', name: 'SM_Cube', type: 'mesh', path: '/Game/Meshes/SM_Cube' },
    { id: 'a14', name: 'BP_Player', type: 'blueprint', path: '/Game/Blueprints/BP_Player' },
  ],

  // Actions
  selectActor: (id) => set({ selectedActorId: id }),

  addActor: (type, name) => {
    pushUndo(get().actors);
    const id = generateId();
    const defaultName = name || `${type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, '')}`;
    const actor: NeoActor = {
      id,
      name: defaultName,
      type,
      transform: createDefaultTransform(),
      visible: true,
      children: [],
      parentId: null,
      components: [],
    };
    set((state) => ({
      actors: { ...state.actors, [id]: actor },
      selectedActorId: id,
    }));
    return id;
  },

  removeActor: (id) => {
    pushUndo(get().actors);
    set((state) => {
      const newActors = { ...state.actors };
      delete newActors[id];
      return {
        actors: newActors,
        selectedActorId: state.selectedActorId === id ? null : state.selectedActorId,
      };
    });
  },

  updateActorTransform: (id, transform) => {
    set((state) => {
      const actor = state.actors[id];
      if (!actor) return state;
      return {
        actors: {
          ...state.actors,
          [id]: {
            ...actor,
            transform: {
              ...actor.transform,
              position: transform.position || actor.transform.position,
              rotation: transform.rotation || actor.transform.rotation,
              scale: transform.scale || actor.transform.scale,
            },
          },
        },
      };
    });
  },

  renameActor: (id, name) => {
    pushUndo(get().actors);
    set((state) => {
      const actor = state.actors[id];
      if (!actor) return state;
      return {
        actors: { ...state.actors, [id]: { ...actor, name } },
      };
    });
  },

  setTransformMode: (mode) => set({ transformMode: mode }),
  setTransformSpace: (space) => set({ transformSpace: space }),
  setViewMode: (mode) => set({ viewMode: mode }),

  togglePlay: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
      isPaused: false,
    })),

  togglePause: () =>
    set((state) => ({
      isPaused: state.isPlaying ? !state.isPaused : false,
    })),

  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),
  toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),

  // --- Scene Management ---
  newScene: () => {
    pushUndo(get().actors);
    set({ actors: createDefaultScene(), selectedActorId: null });
    get().addSystemMessage('[Scene] New scene created.');
  },

  saveScene: () => {
    const data = JSON.stringify(get().actors, null, 2);
    localStorage.setItem('neoengine_scene', data);
    get().addSystemMessage('[Scene] Scene saved to local storage.');
  },

  saveSceneAs: () => {
    const data = JSON.stringify(get().actors, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NeoScene_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    get().addSystemMessage('[Scene] Scene exported as JSON file.');
  },

  loadSceneFromFile: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          pushUndo(get().actors);
          set({ actors: data, selectedActorId: null });
          get().addSystemMessage(`[Scene] Loaded scene from ${file.name} (${Object.keys(data).length} actors)`);
        } catch {
          get().addSystemMessage('[Scene] Error: Invalid scene file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  exportScene: () => {
    get().saveSceneAs();
  },

  importScene: () => {
    get().loadSceneFromFile();
  },

  // --- Undo/Redo ---
  undo: () => {
    if (undoStack.length === 0) return;
    redoStack.push(JSON.parse(JSON.stringify(get().actors)));
    const prev = undoStack.pop()!;
    set({ actors: prev });
  },

  redo: () => {
    if (redoStack.length === 0) return;
    undoStack.push(JSON.parse(JSON.stringify(get().actors)));
    const next = redoStack.pop()!;
    set({ actors: next });
  },

  // --- Selection helpers ---
  duplicateSelected: () => {
    const { selectedActorId, actors } = get();
    if (!selectedActorId || !actors[selectedActorId]) return;
    const original = actors[selectedActorId];
    pushUndo(actors);
    const id = generateId();
    const clone: NeoActor = {
      ...JSON.parse(JSON.stringify(original)),
      id,
      name: `${original.name}_Copy`,
      transform: {
        ...original.transform,
        position: {
          x: original.transform.position.x + 1,
          y: original.transform.position.y,
          z: original.transform.position.z + 1,
        },
      },
    };
    set((state) => ({
      actors: { ...state.actors, [id]: clone },
      selectedActorId: id,
    }));
  },

  selectAll: () => {
    // Select first actor (multi-select not implemented yet)
    const ids = Object.keys(get().actors);
    if (ids.length > 0) set({ selectedActorId: ids[0] });
  },

  // --- AI Chat ---
  sendMessage: (content) => {
    const userMsg: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      isAiThinking: true,
    }));

    // Try backend first, fall back to client-side AI
    const apiUrl = API_BASE ? `${API_BASE}/api/aries/chat` : '/api/aries/chat';
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content, context: { actors: get().actors } }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Backend unavailable');
        return res.json();
      })
      .then((data) => {
        const aiMsg: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: data.response || data.message || 'Maaf, saya tidak bisa memproses perintah itu.',
          timestamp: Date.now(),
        };
        set((state) => ({
          chatMessages: [...state.chatMessages, aiMsg],
          isAiThinking: false,
          ariesConnected: true,
        }));

        // Execute actions
        if (data.actions) {
          for (const action of data.actions) {
            if (action.type === 'add_actor') {
              get().addActor(action.actorType as ActorType, action.name as string);
            } else if (action.type === 'remove_actor') {
              get().removeActor(action.actorId as string);
            } else if (action.type === 'clear_scene') {
              pushUndo(get().actors);
              set({ actors: {}, selectedActorId: null });
            }
          }
        }
      })
      .catch(() => {
        // Client-side AI processing (works without backend!)
        const result = processCommandOffline(content, get().actors);

        const aiMsg: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: result.response,
          timestamp: Date.now(),
        };
        set((state) => ({
          chatMessages: [...state.chatMessages, aiMsg],
          isAiThinking: false,
        }));

        // Execute actions
        for (const action of result.actions) {
          if (action.type === 'add_actor') {
            get().addActor(action.actorType as ActorType, action.name as string);
          } else if (action.type === 'remove_actor') {
            get().removeActor(action.actorId as string);
          } else if (action.type === 'clear_scene') {
            pushUndo(get().actors);
            set({ actors: {}, selectedActorId: null });
          }
        }
      });
  },

  addSystemMessage: (content) => {
    const msg: ChatMessage = {
      id: generateMessageId(),
      role: 'system',
      content,
      timestamp: Date.now(),
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, msg],
    }));
  },

  setConnectionStatus: (engine, aries) =>
    set({ engineConnected: engine, ariesConnected: aries }),

  setFps: (fps) => set({ fps }),
}));
