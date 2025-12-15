import { create } from 'zustand';
import { GameState, GrowthStage, TileData, BearData, AppMode, GamePhase, LevelConfig, Season } from './types';

// Updated configs with Seasons
const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: { levelNumber: 1, tileCount: 9, duration: 45, simultaneousTargets: 1, speed: 2000, gridBoundary: 4, season: Season.SPRING }, 
  2: { levelNumber: 2, tileCount: 16, duration: 60, simultaneousTargets: 2, speed: 2000, gridBoundary: 5, season: Season.AUTUMN }, 
  3: { levelNumber: 3, tileCount: 25, duration: 60, simultaneousTargets: 2, speed: 1700, gridBoundary: 6, season: Season.WINTER }, 
};

// Helper to create random grid shapes
const createRandomTiles = (count: number, boundary: number): TileData[] => {
  const tiles: TileData[] = [];
  const usedPositions = new Set<string>();
  
  // Always include center (0,0) to anchor the map
  tiles.push({ id: 0, row: 0, col: 0, stage: GrowthStage.DIRT });
  usedPositions.add("0,0");

  let idCounter = 1;
  
  while (tiles.length < count) {
    const range = Math.floor(boundary / 2) + 1;
    const r = Math.floor(Math.random() * (range * 2 + 1)) - range;
    const c = Math.floor(Math.random() * (range * 2 + 1)) - range;
    
    const key = `${r},${c}`;
    if (!usedPositions.has(key)) {
      usedPositions.add(key);
      tiles.push({
        id: idCounter++,
        row: r,
        col: c,
        stage: GrowthStage.DIRT
      });
    }
  }
  return tiles;
};

export const useGameStore = create<GameState>((set, get) => ({
  appMode: AppMode.MENU,
  gamePhase: GamePhase.IDLE,
  currentLevel: 1,
  tiles: [],
  score: 0,
  bearsShooed: 0,
  activeTileIds: [],
  timeLeft: 0,
  bearData: null,

  setAppMode: (mode) => set({ appMode: mode }),

  startStoryMode: () => {
    set({ 
      appMode: AppMode.STORY, 
      currentLevel: 1, 
      gamePhase: GamePhase.INTRO_TEXT,
      score: 0,
      bearsShooed: 0
    });
  },

  startLevelSelect: () => {
    set({
      appMode: AppMode.LEVEL_SELECT,
      gamePhase: GamePhase.IDLE,
      score: 0,
      bearsShooed: 0
    });
  },

  startLevel: (levelIndex: number) => {
    const config = LEVEL_CONFIGS[levelIndex];
    if (!config) return;

    set({
      currentLevel: levelIndex,
      tiles: createRandomTiles(config.tileCount, config.gridBoundary),
      timeLeft: config.duration,
      activeTileIds: [],
      bearData: null,
      gamePhase: GamePhase.PLAYING,
      bearsShooed: 0 // Reset level stats
    });
  },

  advanceLevel: () => {
    const { currentLevel } = get();
    const nextLevel = currentLevel + 1;
    if (LEVEL_CONFIGS[nextLevel]) {
      set({ 
        currentLevel: nextLevel, 
        gamePhase: GamePhase.INTRO_TEXT,
        bearsShooed: 0
      });
    } else {
      // End of game loop, back to menu
      set({ appMode: AppMode.MENU, gamePhase: GamePhase.IDLE });
    }
  },

  retryLevel: () => {
    const { currentLevel } = get();
    get().startLevel(currentLevel);
  },

  stopGame: () => {
    set({ gamePhase: GamePhase.IDLE });
  },

  resumeGame: () => {
    set({ gamePhase: GamePhase.PLAYING });
  },

  exitToMenu: () => {
    set({ appMode: AppMode.MENU, gamePhase: GamePhase.IDLE, tiles: [], activeTileIds: [] });
  },

  tickTimer: (delta: number) => {
    const { gamePhase, timeLeft } = get();
    if (gamePhase !== GamePhase.PLAYING) return;

    const newTime = timeLeft - delta;
    if (newTime <= 0) {
      set({ timeLeft: 0, gamePhase: GamePhase.LEVEL_COMPLETE, activeTileIds: [] });
    } else {
      set({ timeLeft: newTime });
    }
  },

  triggerNextBeat: () => {
    const { currentLevel, tiles, activeTileIds, spawnBear } = get();
    const config = LEVEL_CONFIGS[currentLevel];
    
    const availableTiles = tiles.filter(t => !activeTileIds.includes(t.id));
    
    if (availableTiles.length === 0) return;

    const countToPick = Math.min(config.simultaneousTargets, availableTiles.length);
    const newIds: number[] = [];
    
    const pool = [...availableTiles];

    for (let i = 0; i < countToPick; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        newIds.push(pool[randomIndex].id);
        pool.splice(randomIndex, 1);
    }

    set({ activeTileIds: newIds });

    if (Math.random() < 0.25) {
      spawnBear();
    }
  },

  handleTileClick: (clickedId: number) => {
    const { activeTileIds, tiles, score, gamePhase } = get();
    
    if (gamePhase !== GamePhase.PLAYING) return;

    if (activeTileIds.includes(clickedId)) {
      // SUCCESS
      const newTiles = tiles.map(t => {
        if (t.id === clickedId) {
          const nextStage = t.stage < GrowthStage.MATURE ? t.stage + 1 : GrowthStage.DIRT;
          return { ...t, stage: nextStage };
        }
        return t;
      });

      const clickedTile = tiles.find(t => t.id === clickedId);
      const points = clickedTile?.stage === GrowthStage.SAPLING ? 50 : 10;
      
      const newActiveIds = activeTileIds.filter(id => id !== clickedId);

      set({ 
        tiles: newTiles, 
        score: score + points,
        activeTileIds: newActiveIds
      });
    }
  },

  spawnBear: () => {
    const { bearData } = get();
    if (bearData) return;

    const radius = 8;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const rotationY = Math.atan2(x, z) + Math.PI;

    set({
      bearData: {
        id: Date.now(),
        position: [x, 0, z],
        rotationY: rotationY,
        createdAt: Date.now()
      }
    });
  },

  shooBear: () => {
    const { score, bearsShooed } = get();
    set({ 
      bearData: null, 
      score: score + 100,
      bearsShooed: bearsShooed + 1
    });
  },

  bearAttack: () => {
    const { tiles, score, bearData } = get();
    if (!bearData) return;

    const crops = tiles.filter(t => t.stage !== GrowthStage.DIRT);
    
    let targetTile = null;
    let minDistance = Infinity;
    const bx = bearData.position[0];
    const bz = bearData.position[2];

    if (crops.length > 0) {
      crops.forEach(tile => {
        const dist = Math.sqrt(Math.pow(tile.col - bx, 2) + Math.pow(tile.row - bz, 2));
        if (dist < minDistance) {
          minDistance = dist;
          targetTile = tile;
        }
      });
    }

    let newTiles = [...tiles];
    if (targetTile) {
      // @ts-ignore
      newTiles = tiles.map(t => t.id === targetTile.id ? { ...t, stage: GrowthStage.DIRT } : t);
    }

    set({
      bearData: null,
      tiles: newTiles,
      score: Math.max(0, score - 50)
    });
  }
}));