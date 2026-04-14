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
      content: 'Aries AI Engine v3.0 - NeoEngine Autonomous Assistant',
      timestamp: Date.now(),
    },
    {
      id: 'msg_welcome_2',
      role: 'assistant',
      content: 'Halo! Saya Aries, AI assistant untuk NeoEngine. Saya bisa bantu kamu:\n\n• Membuat dan memodifikasi actors di scene\n• Generate code C++ untuk gameplay\n• Desain level secara otomatis\n• Debug dan optimasi engine\n\nKetik perintah apapun untuk memulai!',
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

    // Send to backend
    fetch('/api/aries/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content, context: { actors: get().actors } }),
    })
      .then((res) => res.json())
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
        }));

        // Execute any actions returned by AI
        if (data.actions) {
          for (const action of data.actions) {
            if (action.type === 'add_actor') {
              get().addActor(action.actorType, action.name);
            } else if (action.type === 'remove_actor') {
              get().removeActor(action.actorId);
            }
          }
        }
      })
      .catch(() => {
        // Offline mode - simulate AI response
        const responses = [
          `Saya memproses perintah: "${content}". Saat ini saya beroperasi dalam mode offline. Hubungkan ke Aries Backend untuk kemampuan AI penuh.`,
          `Perintah diterima. Untuk menjalankan ini, saya perlu koneksi ke Aries Brain. Pastikan backend berjalan di port 8000.`,
          `Understood! Saya akan mengeksekusi perintah itu ketika terhubung ke NeoEngine Runtime. Coba jalankan: python backend/main.py`,
        ];
        const aiMsg: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: Date.now(),
        };
        set((state) => ({
          chatMessages: [...state.chatMessages, aiMsg],
          isAiThinking: false,
        }));
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
