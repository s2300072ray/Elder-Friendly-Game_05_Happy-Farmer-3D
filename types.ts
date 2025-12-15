import React from 'react';

export enum GrowthStage {
  DIRT = 0,
  SEEDLING = 1,
  SAPLING = 2,
  MATURE = 3,
  HARVESTED = 4
}

export interface TileData {
  id: number;
  row: number;
  col: number;
  stage: GrowthStage;
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
  bearsShooed: number; // New Statistic
  activeTileIds: number[]; // Array for multiple targets
  
  timeLeft: number; // Remaining seconds
  
  bearData: BearData | null;
  
  // Actions
  setAppMode: (mode: AppMode) => void;
  startStoryMode: () => void;
  startLevelSelect: () => void;
  startLevel: (levelIndex: number) => void; // 1, 2, 3
  advanceLevel: () => void;
  retryLevel: () => void;
  stopGame: () => void; // Pause
  resumeGame: () => void;
  exitToMenu: () => void;
  
  // Game Loop Actions
  tickTimer: (delta: number) => void; // Decrease time
  handleTileClick: (id: number) => void;
  triggerNextBeat: () => void; // Called by GameScene to light up tiles
  
  // Bear Actions
  spawnBear: () => void;
  shooBear: () => void;
  bearAttack: () => void;
}

// Augment global JSX namespace for React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      meshStandardMaterial: any;
      cylinderGeometry: any;
      capsuleGeometry: any;
      dodecahedronGeometry: any;
      sphereGeometry: any;
      boxGeometry: any;
      coneGeometry: any;
      planeGeometry: any;
      ambientLight: any;
      directionalLight: any;
      primitive: any;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        group: any;
        mesh: any;
        meshStandardMaterial: any;
        cylinderGeometry: any;
        capsuleGeometry: any;
        dodecahedronGeometry: any;
        sphereGeometry: any;
        boxGeometry: any;
        coneGeometry: any;
        planeGeometry: any;
        ambientLight: any;
        directionalLight: any;
        primitive: any;
      }
    }
  }
}
