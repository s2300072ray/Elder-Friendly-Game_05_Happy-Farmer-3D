import { create } from 'zustand';
import { GameState, GrowthStage, TileData, BearData, AppMode, GamePhase, LevelConfig, Season, TileStatus, DecorationType } from './types';

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
  tiles.push({ id: 0, row: 0, col: 0, stage: GrowthStage.DIRT, status: TileStatus.IDLE });
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
        stage: GrowthStage.DIRT,
        status: TileStatus.IDLE
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
  misses: 0,
  coins: 0, // Init coins
  inventory: [], // Init inventory
  bearsShooed: 0,
  timeLeft: 0,
  bearData: null,

  setAppMode: (mode) => set({ appMode: mode }),

  startStoryMode: () => {
    set({ 
      appMode: AppMode.STORY, 
      currentLevel: 1, 
      gamePhase: GamePhase.INTRO_TEXT,
      score: 0,
      misses: 0,
      bearsShooed: 0,
      inventory: [] // Reset inventory on new story start? Or keep it? Let's reset for fresh game.
    });
  },

  startLevelSelect: () => {
    set({
      appMode: AppMode.LEVEL_SELECT,
      gamePhase: GamePhase.IDLE,
      score: 0,
      misses: 0,
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
      bearData: null,
      gamePhase: GamePhase.PLAYING,
      bearsShooed: 0,
      misses: 0 // Reset level stats
    });
  },

  advanceLevel: () => {
    const { currentLevel } = get();
    const nextLevel = currentLevel + 1;
    if (LEVEL_CONFIGS[nextLevel]) {
      set({ 
        currentLevel: nextLevel, 
        gamePhase: GamePhase.INTRO_TEXT,
        bearsShooed: 0,
        misses: 0
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
    set({ appMode: AppMode.MENU, gamePhase: GamePhase.IDLE, tiles: [] });
  },

  buyDecoration: (type: DecorationType, cost: number) => {
    const { coins, inventory } = get();
    if (coins >= cost) {
      set({
        coins: coins - cost,
        inventory: [...inventory, type]
      });
    }
  },

  tickTimer: (delta: number) => {
    const { gamePhase, timeLeft, tiles, score, coins, misses } = get();
    if (gamePhase !== GamePhase.PLAYING) return;

    const now = Date.now();
    let newTiles = [...tiles];
    let missIncrement = 0;
    let hasChanges = false;

    // Check for expired Growth Targets (Yellow Lights)
    // Rule: Yellow lights stay for 2 seconds (2000ms)
    // Weeds (Red Lights) are persistent until clicked (as per previous logic), so we don't expire them here.
    newTiles = newTiles.map(t => {
       if (t.status === TileStatus.GROWTH_TARGET && t.activeSince) {
          if (now - t.activeSince > 2000) {
              hasChanges = true;
              missIncrement++;
              return { ...t, status: TileStatus.IDLE, activeSince: undefined };
          }
       }
       return t;
    });

    if (hasChanges) {
        // Apply penalties for misses immediately
        const penalty = missIncrement * 5;
        const newScore = Math.max(0, score - penalty);
        set({ 
            tiles: newTiles, 
            misses: misses + missIncrement,
            score: newScore 
        });
        // We continue to tick time
    }

    const newTime = timeLeft - delta;
    if (newTime <= 0) {
      // LEVEL END LOGIC
      
      // 1. Calculate penalty for remaining weeds
      const weedCount = tiles.filter(t => t.status === TileStatus.WEED).length;
      const penalty = weedCount * 5;
      const finalScore = Math.max(0, score - penalty); // Score might have already been reduced by real-time misses
      
      // 2. Convert Score to Coins
      const earnedCoins = finalScore;

      set({ 
        timeLeft: 0, 
        gamePhase: GamePhase.LEVEL_COMPLETE,
        score: finalScore,
        coins: coins + earnedCoins
      });
    } else {
      set({ timeLeft: newTime });
    }
  },

  triggerNextBeat: () => {
    const { currentLevel, tiles, spawnBear } = get();
    const config = LEVEL_CONFIGS[currentLevel];
    
    // Filter tiles that are IDLE (Not growing target, and NOT A WEED)
    const availableTiles = tiles.filter(t => t.status === TileStatus.IDLE);
    
    if (availableTiles.length === 0) return;

    const countToPick = Math.min(config.simultaneousTargets, availableTiles.length);
    let newTiles = [...tiles];
    
    // Create a pool of indices from the available tiles
    // We map back to original tile IDs to update the main array
    const availableIds = availableTiles.map(t => t.id);
    
    const now = Date.now();

    for (let i = 0; i < countToPick; i++) {
        if (availableIds.length === 0) break;

        const randomIndex = Math.floor(Math.random() * availableIds.length);
        const selectedId = availableIds[randomIndex];
        availableIds.splice(randomIndex, 1); // remove from pool

        // Determine Event Type
        // Level 1: 100% Growth
        // Level 2+: 30% Weed, 70% Growth
        let eventType = TileStatus.GROWTH_TARGET;
        if (currentLevel > 1 && Math.random() < 0.3) {
           eventType = TileStatus.WEED;
        }

        newTiles = newTiles.map(t => {
            if (t.id === selectedId) {
                // Set activeSince for timeout logic
                return { ...t, status: eventType, activeSince: now };
            }
            return t;
        });
    }

    set({ tiles: newTiles });

    if (Math.random() < 0.25) {
      spawnBear();
    }
  },

  handleTileClick: (clickedId: number) => {
    const { tiles, score, gamePhase } = get();
    
    if (gamePhase !== GamePhase.PLAYING) return;

    const clickedTile = tiles.find(t => t.id === clickedId);
    if (!clickedTile) return;

    // Logic for WEED
    if (clickedTile.status === TileStatus.WEED) {
       // Clear weed, return to IDLE
       const newTiles = tiles.map(t => t.id === clickedId ? { ...t, status: TileStatus.IDLE, activeSince: undefined } : t);
       set({ tiles: newTiles });
       return;
    }

    // Logic for GROWTH
    if (clickedTile.status === TileStatus.GROWTH_TARGET) {
      // Success
      const newTiles = tiles.map(t => {
        if (t.id === clickedId) {
          const nextStage = t.stage < GrowthStage.MATURE ? t.stage + 1 : GrowthStage.DIRT;
          return { ...t, stage: nextStage, status: TileStatus.IDLE, activeSince: undefined };
        }
        return t;
      });

      const points = clickedTile.stage === GrowthStage.SAPLING ? 50 : 10;
      
      set({ 
        tiles: newTiles, 
        score: score + points
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
      newTiles = tiles.map(t => t.id === targetTile.id ? { ...t, stage: GrowthStage.DIRT, status: TileStatus.IDLE, activeSince: undefined } : t);
    }

    set({
      bearData: null,
      tiles: newTiles,
      score: Math.max(0, score - 50)
    });
  }
}));