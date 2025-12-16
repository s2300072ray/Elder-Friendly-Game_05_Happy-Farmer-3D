import { ThreeElements } from '@react-three/fiber';

// Augment both global and React-scoped JSX namespaces to support R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      cylinderGeometry: any;
      meshStandardMaterial: any;
      capsuleGeometry: any;
      dodecahedronGeometry: any;
      sphereGeometry: any;
      boxGeometry: any;
      coneGeometry: any;
      circleGeometry: any;
      planeGeometry: any;
      directionalLight: any;
      ambientLight: any;
      fog: any;
      color: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      cylinderGeometry: any;
      meshStandardMaterial: any;
      capsuleGeometry: any;
      dodecahedronGeometry: any;
      sphereGeometry: any;
      boxGeometry: any;
      coneGeometry: any;
      circleGeometry: any;
      planeGeometry: any;
      directionalLight: any;
      ambientLight: any;
      fog: any;
      color: any;
    }
  }
}

export enum GrowthStage {
  DIRT = 0,
  SEEDLING = 1,
  SAPLING = 2,
  MATURE = 3,
  HARVESTED = 4
}

export enum TileStatus {
  IDLE = 'IDLE',
  GROWTH_TARGET = 'GROWTH_TARGET', // Yellow Light (Bonus)
  WEED = 'WEED' // Red Light (Penalty/Blocker)
}

export enum Season {
  SPRING = 'SPRING',
  AUTUMN = 'AUTUMN',
  WINTER = 'WINTER'
}

export enum DecorationType {
  HOUSE = 'HOUSE',
  WINDMILL = 'WINDMILL',
  WATER_WHEEL = 'WATER_WHEEL',
  FENCE = 'FENCE' // Consumable Item
}

export enum AppMode {
  MENU = 'MENU',
  STORY = 'STORY',
  LEVEL_SELECT = 'LEVEL_SELECT',
  VICTORY = 'VICTORY' // Game Complete Screen
}

export enum GamePhase {
  IDLE = 'IDLE', // Menu or Paused
  INTRO_TEXT = 'INTRO_TEXT', // Reading story before level
  PLAYING = 'PLAYING', // Active gameplay
  LEVEL_COMPLETE = 'LEVEL_COMPLETE', // Summary screen
}

// --- Data Interfaces ---

export interface TileData {
  id: number;
  row: number;
  col: number;
  stage: GrowthStage;
  status: TileStatus; 
  activeSince?: number; // Timestamp for timeout logic
}

export interface BearData {
  id: number;
  position: [number, number, number];
  rotationY: number;
  createdAt: number;
  targetTileId?: number; // The crop the bear intends to eat
}

export interface ActiveFence {
  id: number;
  protectedTileIds: number[];
  expiresAt: number;
}

export interface LevelConfig {
  levelNumber: number;
  tileCount: number; // Grid size
  duration: number; // Seconds
  simultaneousTargets: number; // Max active events
  beatSpeed: number; // Interval between events (ms)
  gridBoundary: number; // Map spread
  season: Season;
  storyText: string;
}

export interface AtmosphereConfig {
  fogColor: string;
  fogNear: number;
  fogFar: number;
  groundColor: string;
  envPreset: "sunset" | "park" | "forest" | "night" | "studio" | "city" | "apartment" | "dawn" | "lobby" | "warehouse";
}

export interface ShopItemConfig {
  type: DecorationType;
  name: string;
  price: number;
  icon: string;
  isConsumable?: boolean;
}

export interface GameState {
  // System State
  appMode: AppMode;
  gamePhase: GamePhase;
  currentLevel: number;
  isMuted: boolean; 
  
  // Game Objects
  tiles: TileData[];
  bearData: BearData | null;
  activeFences: ActiveFence[]; // New: Active protection zones
  
  // Player Stats
  score: number;
  coins: number;
  misses: number;
  bearsShooed: number;
  inventory: DecorationType[]; // Permanent items
  fenceCount: number; // New: Consumable count
  timeLeft: number; 
  
  // Interaction State
  isPlacingFence: boolean; // New: UI State

  // Actions - System
  setAppMode: (mode: AppMode) => void;
  startStoryMode: () => void;
  startLevelSelect: () => void;
  startLevel: (levelIndex: number) => void;
  advanceLevel: () => void;
  retryLevel: () => void;
  stopGame: () => void;
  resumeGame: () => void;
  exitToMenu: () => void;
  toggleMute: () => void;
  
  // Actions - Gameplay
  tickTimer: (delta: number) => void;
  triggerNextBeat: () => void;
  handleTileClick: (id: number) => void;
  toggleFencePlacement: () => void; // New action
  
  // Actions - Entities
  spawnBear: () => void;
  shooBear: () => void;
  bearAttack: () => void;
  
  // Actions - Economy
  buyDecoration: (type: DecorationType) => void;
}