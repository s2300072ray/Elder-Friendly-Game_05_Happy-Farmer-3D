import { create } from 'zustand';
import { GameState, GrowthStage, TileData, AppMode, GamePhase, TileStatus, DecorationType, ActiveFence } from './types';
import { LEVELS, SHOP_ITEMS, GAME_CONSTANTS } from './gameConfig';
import { audioManager } from './systems/AudioManager';

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

// Helper to check if a tile is currently protected by a fence
const isTileProtected = (tileId: number, activeFences: GameState['activeFences']): boolean => {
  return activeFences.some(f => f.protectedTileIds.includes(tileId));
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
  fenceCount: 0,
  activeFences: [],
  bearsShooed: 0,
  timeLeft: 0,
  bearData: null,
  isMuted: false,
  isPlacingFence: false,

  // --- System Actions ---
  setAppMode: (mode) => {
    audioManager.playUISelect();
    set({ appMode: mode });
  },

  toggleMute: () => {
    const newVal = !get().isMuted;
    set({ isMuted: newVal });
    audioManager.setMute(newVal);
  },

  startStoryMode: () => {
    audioManager.playClick();
    set({ 
      appMode: AppMode.STORY, 
      currentLevel: 1, 
      gamePhase: GamePhase.INTRO_TEXT,
      score: 0,
      coins: 0, 
      misses: 0,
      bearsShooed: 0,
      inventory: [],
      fenceCount: 0,
      activeFences: [],
      isPlacingFence: false
    });
  },

  startLevelSelect: () => {
    audioManager.playClick();
    set({
      appMode: AppMode.LEVEL_SELECT,
      gamePhase: GamePhase.IDLE,
      score: 0,
      misses: 0,
      bearsShooed: 0,
      activeFences: [],
      isPlacingFence: false
    });
  },

  startLevel: (levelIndex) => {
    audioManager.playSuccess(); 
    const config = LEVELS[levelIndex];
    if (!config) return;

    set({
      currentLevel: levelIndex,
      tiles: createRandomTiles(config.tileCount, config.gridBoundary),
      timeLeft: config.duration,
      bearData: null,
      gamePhase: GamePhase.PLAYING,
      bearsShooed: 0,
      misses: 0,
      activeFences: [],
      isPlacingFence: false
    });
  },

  advanceLevel: () => {
    audioManager.playClick();
    const { currentLevel } = get();
    const nextLevel = currentLevel + 1;
    if (LEVELS[nextLevel]) {
      set({ 
        currentLevel: nextLevel, 
        gamePhase: GamePhase.INTRO_TEXT,
        bearsShooed: 0,
        misses: 0,
        activeFences: [],
        isPlacingFence: false
      });
    } else {
      audioManager.playVictory();
      set({ appMode: AppMode.VICTORY, gamePhase: GamePhase.IDLE });
    }
  },

  retryLevel: () => {
    audioManager.playClick();
    get().startLevel(get().currentLevel);
  },

  stopGame: () => {
      audioManager.playClick();
      set({ gamePhase: GamePhase.IDLE });
  },
  resumeGame: () => {
      audioManager.playClick();
      set({ gamePhase: GamePhase.PLAYING });
  },
  
  exitToMenu: () => {
    audioManager.playClick();
    set({ appMode: AppMode.MENU, gamePhase: GamePhase.IDLE, tiles: [], activeFences: [] });
  },

  // --- Economy Actions ---
  buyDecoration: (type) => {
    const { coins, inventory, fenceCount } = get();
    const item = SHOP_ITEMS.find(i => i.type === type);
    
    if (!item || coins < item.price) {
        audioManager.playError();
        return;
    }

    if (item.isConsumable && type === DecorationType.FENCE) {
        if (fenceCount >= GAME_CONSTANTS.MAX_FENCES) {
            audioManager.playError();
            return;
        }
        audioManager.playSuccess();
        set({
            coins: coins - item.price,
            fenceCount: fenceCount + 1
        });
    } else if (!inventory.includes(type)) {
        // Permanent Building
        audioManager.playSuccess();
        set({
            coins: coins - item.price,
            inventory: [...inventory, type]
        });
    } else {
        // Already owned permanent item
        audioManager.playError();
    }
  },

  toggleFencePlacement: () => {
      const { fenceCount, isPlacingFence, gamePhase } = get();
      if (gamePhase !== GamePhase.PLAYING) return;
      
      if (fenceCount > 0) {
          audioManager.playUISelect();
          set({ isPlacingFence: !isPlacingFence });
      } else {
          audioManager.playError();
      }
  },

  // --- Game Loop ---
  tickTimer: (delta) => {
    const { gamePhase, timeLeft, tiles, score, coins, misses, activeFences } = get();
    if (gamePhase !== GamePhase.PLAYING) return;

    const now = Date.now();
    let newTiles = [...tiles];
    let missIncrement = 0;
    let hasChanges = false;

    // 1. Manage Active Fences Expiry
    const validFences = activeFences.filter(f => f.expiresAt > now);
    const fencesChanged = validFences.length !== activeFences.length;

    // 2. Timeout logic for "Growth Targets"
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
        audioManager.playError(); 
        const penalty = missIncrement * GAME_CONSTANTS.PENALTY_MISS;
        set({ 
            tiles: newTiles, 
            misses: misses + missIncrement,
            score: Math.max(0, score - penalty),
            activeFences: fencesChanged ? validFences : activeFences
        });
    } else if (fencesChanged) {
        set({ activeFences: validFences });
    }

    const newTime = timeLeft - delta;
    if (newTime <= 0) {
      audioManager.playSuccess();
      const weedCount = tiles.filter(t => t.status === TileStatus.WEED).length;
      const penalty = weedCount * GAME_CONSTANTS.PENALTY_WEED_LEFT;
      const finalScore = Math.max(0, score - penalty);
      
      set({ 
        timeLeft: 0, 
        gamePhase: GamePhase.LEVEL_COMPLETE,
        score: finalScore,
        coins: coins + finalScore,
        activeFences: [],
        isPlacingFence: false
      });
    } else {
      set({ timeLeft: newTime });
    }
  },

  triggerNextBeat: () => {
    const { currentLevel, tiles, spawnBear, activeFences } = get();
    const config = LEVELS[currentLevel];
    
    // Only target tiles NOT protected by fence
    const availableTiles = tiles.filter(t => t.status === TileStatus.IDLE && !isTileProtected(t.id, activeFences));
    
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

    if (Math.random() < GAME_CONSTANTS.BEAR_SPAWN_CHANCE) {
      spawnBear();
    }
  },

  handleTileClick: (clickedId) => {
    const { tiles, score, gamePhase, isPlacingFence, fenceCount, activeFences } = get();
    if (gamePhase !== GamePhase.PLAYING) return;

    // --- Fence Placement Logic ---
    if (isPlacingFence) {
        if (fenceCount <= 0) {
            set({ isPlacingFence: false });
            return;
        }

        const centerTile = tiles.find(t => t.id === clickedId);
        if (!centerTile) return;

        // Find 2x2 area: Center, Right, Bottom, Bottom-Right
        const r = centerTile.row;
        const c = centerTile.col;
        const targetCoords = [
            {r, c}, {r: r+1, c}, {r, c: c+1}, {r: r+1, c: c+1}
        ];
        
        const protectedIds: number[] = [];
        targetCoords.forEach(coord => {
            const t = tiles.find(tile => tile.row === coord.r && tile.col === coord.c);
            if (t) protectedIds.push(t.id);
        });

        // Even if we don't find 4 tiles (edge of map), we still place the fence
        if (protectedIds.length > 0) {
            audioManager.playSuccess(); // Construction sound
            const newFence: ActiveFence = {
                id: Date.now(),
                protectedTileIds: protectedIds,
                expiresAt: Date.now() + GAME_CONSTANTS.FENCE_DURATION
            };

            set({
                fenceCount: fenceCount - 1,
                isPlacingFence: false,
                activeFences: [...activeFences, newFence]
            });
            return;
        }
    }

    // --- Standard Click Logic ---
    const clickedTile = tiles.find(t => t.id === clickedId);
    if (!clickedTile) return;

    if (clickedTile.status === TileStatus.WEED) {
       audioManager.playWeedClear();
       const newTiles = tiles.map(t => t.id === clickedId ? { ...t, status: TileStatus.IDLE, activeSince: undefined } : t);
       set({ tiles: newTiles });
       return;
    }

    if (clickedTile.status === TileStatus.GROWTH_TARGET) {
      audioManager.playGrow();
      const newTiles = tiles.map(t => {
        if (t.id === clickedId) {
          const nextStage = t.stage < GrowthStage.MATURE ? t.stage + 1 : GrowthStage.DIRT;
          return { ...t, stage: nextStage, status: TileStatus.IDLE, activeSince: undefined };
        }
        return t;
      });

      const points = clickedTile.stage === GrowthStage.SAPLING ? GAME_CONSTANTS.POINTS_HARVEST : GAME_CONSTANTS.POINTS_GROW;
      set({ tiles: newTiles, score: score + points });
    } else {
        audioManager.playClick(); 
    }
  },

  // --- Bear Logic ---
  spawnBear: () => {
    const { bearData, tiles, activeFences } = get();
    if (bearData) return;

    audioManager.playBearSpawn();

    // Random edge spawn
    const radius = 9;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const rotationY = Math.atan2(x, z) + Math.PI;

    // Find Target (Prioritize existing crops, BUT IGNORE PROTECTED TILES)
    let targetTileId = undefined;
    const crops = tiles.filter(t => t.stage !== GrowthStage.DIRT && !isTileProtected(t.id, activeFences));
    
    // If all crops are protected or no crops, look for any unprotected tile
    const validTargets = crops.length > 0 ? crops : tiles.filter(t => !isTileProtected(t.id, activeFences));

    if (validTargets.length > 0) {
      let minDistance = Infinity;
      validTargets.forEach(tile => {
        const dist = Math.sqrt(Math.pow(tile.col - x, 2) + Math.pow(tile.row - z, 2));
        if (dist < minDistance) {
          minDistance = dist;
          targetTileId = tile.id;
        }
      });
    } else {
        // No valid target (Everything fenced?), bear wanders aimlessly then leaves
        targetTileId = undefined; 
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
    audioManager.playSuccess(); 
    set({ 
      bearData: null, 
      score: score + GAME_CONSTANTS.POINTS_SHOO_BEAR,
      bearsShooed: bearsShooed + 1
    });
  },

  bearAttack: () => {
    const { tiles, score, bearData, activeFences } = get();
    if (!bearData) return;

    if (bearData.targetTileId === undefined) {
      set({ bearData: null });
      return;
    }
    
    // Check if target became protected after spawn
    if (isTileProtected(bearData.targetTileId, activeFences)) {
        // Bear fails to attack protected tile
        // Maybe play a "bonk" sound?
        set({ bearData: null });
        return;
    }

    const targetTile = tiles.find(t => t.id === bearData.targetTileId);
    let newTiles = [...tiles];
    let penalty = 0;

    if (targetTile && targetTile.stage !== GrowthStage.DIRT) {
      audioManager.playError(); 
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