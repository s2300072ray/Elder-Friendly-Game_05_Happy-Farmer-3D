import { LevelConfig, Season, AtmosphereConfig, ShopItemConfig, DecorationType } from './types';

// --- ECONOMY SETTINGS ---
export const SHOP_ITEMS: ShopItemConfig[] = [
  { type: DecorationType.FENCE, name: "Fence (20s)", price: 15, icon: "🚧", isConsumable: true },
  { type: DecorationType.HOUSE, name: "Farmhouse", price: 50, icon: "🏠" },
  { type: DecorationType.WINDMILL, name: "Windmill", price: 100, icon: "🌪" },
  { type: DecorationType.WATER_WHEEL, name: "Water Wheel", price: 100, icon: "💧" },
];

// --- AUDIO SETTINGS ---
export const AUDIO_CONFIG = {
  // Gentle, royalty-free acoustic track.
  // Source: Pixabay (Royalty Free) - "Relaxing Light Background" type
  BGM_URL: "https://cdn.pixabay.com/audio/2022/10/18/audio_31c2730e64.mp3",
  BGM_VOLUME: 0.3,
  SFX_VOLUME: 0.4
};

// --- LEVEL SETTINGS ---
export const LEVELS: Record<number, LevelConfig> = {
  1: { 
    levelNumber: 1, 
    tileCount: 9, 
    duration: 45, 
    simultaneousTargets: 1, 
    beatSpeed: 2000, 
    gridBoundary: 4, 
    season: Season.SPRING,
    storyText: "You are a happy retiree who bought a piece of land. Let's start our farm life! Click yellow tiles to grow crops."
  }, 
  2: { 
    levelNumber: 2, 
    tileCount: 16, 
    duration: 60, 
    simultaneousTargets: 2, 
    beatSpeed: 2000, 
    gridBoundary: 5, 
    season: Season.AUTUMN,
    storyText: "Great job! It's Autumn now. Watch out for red weeds—click them to remove them!"
  }, 
  3: { 
    levelNumber: 3, 
    tileCount: 25, 
    duration: 60, 
    simultaneousTargets: 2, 
    beatSpeed: 1700, 
    gridBoundary: 6, 
    season: Season.WINTER,
    storyText: "Winter is coming, but the soil is still fertile. The bears are getting hungry. Protect your farm!"
  }, 
};

// --- VISUAL SETTINGS (Atmosphere) ---
export const ATMOSPHERE: Record<Season, AtmosphereConfig> = {
  [Season.SPRING]: {
    fogColor: "#B0E0E6", // Powder Blue
    fogNear: 20,
    fogFar: 65,
    groundColor: "#8FBC8F", // Dark Sea Green
    envPreset: "park"
  },
  [Season.AUTUMN]: {
    fogColor: "#F5DEB3", // Wheat
    fogNear: 20,
    fogFar: 60,
    groundColor: "#DEB887", // Burlywood
    envPreset: "sunset"
  },
  [Season.WINTER]: {
    fogColor: "#E0FFFF", // Light Cyan
    fogNear: 15,
    fogFar: 55,
    groundColor: "#E0F7FA", // Icy White
    envPreset: "park"
  }
};

// --- GAMEPLAY CONSTANTS ---
export const GAME_CONSTANTS = {
  BEAR_SPAWN_CHANCE: 0.25,
  BEAR_ATTACK_DELAY: 2000, // ms
  TARGET_TIMEOUT: 2000, // ms (How long a yellow light stays)
  FENCE_DURATION: 20000, // 20 seconds
  MAX_FENCES: 4, // Limit fence purchase
  POINTS_HARVEST: 50,
  POINTS_GROW: 10,
  POINTS_SHOO_BEAR: 100,
  PENALTY_MISS: 5,
  PENALTY_WEED_LEFT: 5,
  PENALTY_BEAR_EAT: 50,
  FARM_BASE_POSITION: [9, 0, -9] as [number, number, number], // Top-Right
  FARM_BASE_SCALE: 0.8
};