import React from 'react';

export enum GrowthStage {
  DIRT = 0,
  SEEDLING = 1,
  SAPLING = 2,
  MATURE = 3,
  HARVESTED = 4
}

// Tile status helps distinguish between a normal growth target and a weed target
export enum TileStatus {
  IDLE = 'IDLE',
  GROWTH_TARGET = 'GROWTH_TARGET', // Yellow Light
  WEED = 'WEED' // Red Light (Persistent until clicked)
}

export interface TileData {
  id: number;
  row: number;
  col: number;
  stage: GrowthStage;
  status: TileStatus; // Replaces simple "active" check
  activeSince?: number; // Timestamp when status changed to non-IDLE
}

export interface BearData {
  id: number;
  position: [number, number, number];
  rotationY: number;
  createdAt: number;
}

export enum AppMode {
  MENU = 'MENU',
  STORY = 'STORY',
  LEVEL_SELECT = 'LEVEL_SELECT'
}

export enum GamePhase {
  IDLE = 'IDLE', // In menu or waiting
  INTRO_TEXT = 'INTRO_TEXT', // Reading story
  PLAYING = 'PLAYING', // Game active
  LEVEL_COMPLETE = 'LEVEL_COMPLETE', // Finished level
}

export enum Season {
  SPRING = 'SPRING',
  AUTUMN = 'AUTUMN',
  WINTER = 'WINTER'
}

export enum DecorationType {
  HOUSE = 'HOUSE',
  WINDMILL = 'WINDMILL',
  WATER_WHEEL = 'WATER_WHEEL'
}

export interface LevelConfig {
  levelNumber: number;
  tileCount: number; // 9, 16, 25
  duration: number; // seconds
  simultaneousTargets: number;
  speed: number; // ms
  gridBoundary: number; // Limit for random placement
  season: Season;
}

export interface GameState {
  appMode: AppMode;
  gamePhase: GamePhase;
  currentLevel: number; // 1, 2, 3
  
  tiles: TileData[];
  score: number;
  misses: number; // New: Track missed targets
  coins: number; // Currency
  inventory: DecorationType[]; // Purchased items
  
  bearsShooed: number;
  // removed activeTileIds in favor of TileData.status for more complex state
  
  timeLeft: number; // Remaining seconds
  
  bearData: BearData | null;
  
  // Actions
  setAppMode: (mode: AppMode) => void;
  startStoryMode: () => void;
  startLevelSelect: () => void;
  startLevel: (levelIndex: number) => void;
  advanceLevel: () => void;
  retryLevel: () => void;
  stopGame: () => void; // Pause
  resumeGame: () => void;
  exitToMenu: () => void;
  
  // Economy Actions
  buyDecoration: (type: DecorationType, cost: number) => void;
  
  // Game Loop Actions
  tickTimer: (delta: number) => void; // Decrease time
  handleTileClick: (id: number) => void;
  triggerNextBeat: () => void; // Called by GameScene to light up tiles
  
  // Bear Actions
  spawnBear: () => void;
  shooBear: () => void;
  bearAttack: () => void;
}