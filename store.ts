import { create } from 'zustand';
import { GameState, GrowthStage, TileData, AppMode, GamePhase, TileStatus, DecorationType } from './types';
import { LEVELS, SHOP_ITEMS, GAME_CONSTANTS } from './gameConfig';

// Helper: Grid Generation
const createRandomTiles = (count: number, boundary: number): TileData[] => {
  const tiles: TileData[] = [];
  const usedPositions = new Set<string>();
  
  // Anchor center
  tiles.push({ id: 0, row: 0, col: 0, stage: GrowthStage.DIRT, status: TileStatus.IDLE });
  usedPositions.add("0,0");

  let idCounter = 1;
  while (tiles.length < count) {
    const range = Math.floor(boundary / 2) + 1;
    const r = Math.floor(Math.random() * (range * 2 + 1)) - range;
    const c = Math.floor(Math.random() * (range * 2 + 1)) - range;
    
    // Check collision with Farm Base area (Top Right: x=9, z=-9 roughly)
    // We avoid placing tiles directly inside the house geometry
    const distToFarm = Math.sqrt(Math.pow(c - GAME_CONSTANTS.FARM_BASE_POSITION[0], 2) + Math.pow(r - GAME_CONSTANTS.FARM_BASE_POSITION[2], 2));
    if (distToFarm < 4) continue;

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
  // --- Initial State ---
  appMode: AppMode.MENU,
  gamePhase: GamePhase.IDLE,
  currentLevel: 1,
  tiles: [],
  score: 0,
  misses: 0,
  coins: 0,
  inventory: [],
  bearsShooed: 0,
  timeLeft: 0,
  bearData: null,

  // --- System Actions ---
  setAppMode: (mode) => set({ appMode: mode }),

  startStoryMode: () => {
    set({ 
      appMode: AppMode.STORY, 
      currentLevel: 1, 
      gamePhase: GamePhase.INTRO_TEXT,
      score: 0,
      misses: 0,
      bearsShooed: 0,
      inventory: [] 
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

  startLevel: (levelIndex) => {
    const config = LEVELS[levelIndex];
    if (!config) return;

    set({
      currentLevel: levelIndex,
      tiles: createRandomTiles(config.tileCount, config.gridBoundary),
      timeLeft: config.duration,
      bearData: null,
      gamePhase: GamePhase.PLAYING,
      bearsShooed: 0,
      misses: 0
    });
  },

  advanceLevel: () => {
    const { currentLevel } = get();
    const nextLevel = currentLevel + 1;
    if (LEVELS[nextLevel]) {
      set({ 
        currentLevel: nextLevel, 
        gamePhase: GamePhase.INTRO_TEXT,
        bearsShooed: 0,
        misses: 0
      });
    } else {
      set({ appMode: AppMode.MENU, gamePhase: GamePhase.IDLE });
    }
  },

  retryLevel: () => {
    get().startLevel(get().currentLevel);
  },

  stopGame: () => set({ gamePhase: GamePhase.IDLE }),
  resumeGame: () => set({ gamePhase: GamePhase.PLAYING }),
  
  exitToMenu: () => {
    set({ appMode: AppMode.MENU, gamePhase: GamePhase.IDLE, tiles: [] });
  },

  // --- Economy Actions ---
  buyDecoration: (type) => {
    const { coins, inventory } = get();
    const item = SHOP_ITEMS.find(i => i.type === type);
    if (item && coins >= item.price && !inventory.includes(type)) {
      set({
        coins: coins - item.price,
        inventory: [...inventory, type]
      });
    }
  },

  // --- Game Loop ---
  tickTimer: (delta) => {
    const { gamePhase, timeLeft, tiles, score, coins, misses } = get();
    if (gamePhase !== GamePhase.PLAYING) return;

    const now = Date.now();
    let newTiles = [...tiles];
    let missIncrement = 0;
    let hasChanges = false;

    // Timeout logic for "Growth Targets"
    newTiles = newTiles.map(t => {
       if (t.status === TileStatus.GROWTH_TARGET && t.activeSince) {
          if (now - t.activeSince > GAME_CONSTANTS.TARGET_TIMEOUT) {
              hasChanges = true;
              missIncrement++;
              return { ...t, status: TileStatus.IDLE, activeSince: undefined };
          }
       }
       return t;
    });

    if (hasChanges) {
        const penalty = missIncrement * GAME_CONSTANTS.PENALTY_MISS;
        set({ 
            tiles: newTiles, 
            misses: misses + missIncrement,
            score: Math.max(0, score - penalty) 
        });
    }

    const newTime = timeLeft - delta;
    if (newTime <= 0) {
      // Level Complete
      const weedCount = tiles.filter(t => t.status === TileStatus.WEED).length;
      const penalty = weedCount * GAME_CONSTANTS.PENALTY_WEED_LEFT;
      const finalScore = Math.max(0, score - penalty);
      
      set({ 
        timeLeft: 0, 
        gamePhase: GamePhase.LEVEL_COMPLETE,
        score: finalScore,
        coins: coins + finalScore
      });
    } else {
      set({ timeLeft: newTime });
    }
  },

  triggerNextBeat: () => {
    const { currentLevel, tiles, spawnBear } = get();
    const config = LEVELS[currentLevel];
    
    const availableTiles = tiles.filter(t => t.status === TileStatus.IDLE);
    if (availableTiles.length === 0) return;

    const countToPick = Math.min(config.simultaneousTargets, availableTiles.length);
    let newTiles = [...tiles];
    const availableIds = availableTiles.map(t => t.id);
    const now = Date.now();

    for (let i = 0; i < countToPick; i++) {
        if (availableIds.length === 0) break;
        const randomIndex = Math.floor(Math.random() * availableIds.length);
        const selectedId = availableIds[randomIndex];
        availableIds.splice(randomIndex, 1);

        // Level 2+ has weeds
        let eventType = TileStatus.GROWTH_TARGET;
        if (currentLevel > 1 && Math.random() < 0.3) {
           eventType = TileStatus.WEED;
        }

        newTiles = newTiles.map(t => {
            if (t.id === selectedId) {
                return { ...t, status: eventType, activeSince: now };
            }
            return t;
        });
    }

    set({ tiles: newTiles });

    // Spawn Bear chance
    if (Math.random() < GAME_CONSTANTS.BEAR_SPAWN_CHANCE) {
      spawnBear();
    }
  },

  handleTileClick: (clickedId) => {
    const { tiles, score, gamePhase } = get();
    if (gamePhase !== GamePhase.PLAYING) return;

    const clickedTile = tiles.find(t => t.id === clickedId);
    if (!clickedTile) return;

    if (clickedTile.status === TileStatus.WEED) {
       // Clear Weed
       const newTiles = tiles.map(t => t.id === clickedId ? { ...t, status: TileStatus.IDLE, activeSince: undefined } : t);
       set({ tiles: newTiles });
       return;
    }

    if (clickedTile.status === TileStatus.GROWTH_TARGET) {
      // Grow Crop
      const newTiles = tiles.map(t => {
        if (t.id === clickedId) {
          const nextStage = t.stage < GrowthStage.MATURE ? t.stage + 1 : GrowthStage.DIRT;
          return { ...t, stage: nextStage, status: TileStatus.IDLE, activeSince: undefined };
        }
        return t;
      });

      const points = clickedTile.stage === GrowthStage.SAPLING ? GAME_CONSTANTS.POINTS_HARVEST : GAME_CONSTANTS.POINTS_GROW;
      set({ tiles: newTiles, score: score + points });
    }
  },

  // --- Bear Logic ---
  spawnBear: () => {
    const { bearData, tiles } = get();
    if (bearData) return;

    // Random edge spawn
    const radius = 9;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const rotationY = Math.atan2(x, z) + Math.PI;

    // Find Target (Prioritize existing crops)
    let targetTileId = undefined;
    const crops = tiles.filter(t => t.stage !== GrowthStage.DIRT);
    
    if (crops.length > 0) {
      let minDistance = Infinity;
      crops.forEach(tile => {
        const dist = Math.sqrt(Math.pow(tile.col - x, 2) + Math.pow(tile.row - z, 2));
        if (dist < minDistance) {
          minDistance = dist;
          targetTileId = tile.id;
        }
      });
    }

    set({
      bearData: {
        id: Date.now(),
        position: [x, 0, z],
        rotationY,
        createdAt: Date.now(),
        targetTileId
      }
    });
  },

  shooBear: () => {
    const { score, bearsShooed } = get();
    set({ 
      bearData: null, 
      score: score + GAME_CONSTANTS.POINTS_SHOO_BEAR,
      bearsShooed: bearsShooed + 1
    });
  },

  bearAttack: () => {
    const { tiles, score, bearData } = get();
    if (!bearData) return;

    if (bearData.targetTileId === undefined) {
      set({ bearData: null });
      return;
    }
    
    const targetTile = tiles.find(t => t.id === bearData.targetTileId);
    let newTiles = [...tiles];
    let penalty = 0;

    if (targetTile && targetTile.stage !== GrowthStage.DIRT) {
      newTiles = tiles.map(t => t.id === targetTile.id ? { ...t, stage: GrowthStage.DIRT, status: TileStatus.IDLE, activeSince: undefined } : t);
      penalty = GAME_CONSTANTS.PENALTY_BEAR_EAT;
    }

    set({
      bearData: null,
      tiles: newTiles,
      score: Math.max(0, score - penalty)
    });
  }
}));