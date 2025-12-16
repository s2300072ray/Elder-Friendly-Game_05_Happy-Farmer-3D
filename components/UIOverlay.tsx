import React from 'react';
import { useGameStore } from '../store';
import { AppMode, GamePhase, GrowthStage, TileStatus, DecorationType } from '../types';
import { SHOP_ITEMS, LEVELS, GAME_CONSTANTS } from '../gameConfig';

// --- SUB-COMPONENTS ---

const MainMenu = () => {
  const { startStoryMode, startLevelSelect } = useGameStore();
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="relative z-10 bg-white/90 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-4 border-green-600 backdrop-blur-md">
        <h1 className="text-4xl font-black text-green-800 mb-2">Happy Farmer 3D</h1>
        <p className="text-gray-600 mb-8 text-lg">Retirement Paradise</p>
        <div className="space-y-4">
          <button onClick={startStoryMode} className="w-full bg-orange-500 hover:bg-orange-400 text-white text-2xl font-bold py-4 rounded-xl shadow-lg transition active:scale-95">Start Story</button>
          <button onClick={startLevelSelect} className="w-full bg-blue-500 hover:bg-blue-400 text-white text-xl font-bold py-4 rounded-xl shadow-lg transition active:scale-95">Select Level</button>
        </div>
      </div>
    </div>
  );
};

const VictoryScreen = () => {
  const { startStoryMode, exitToMenu, coins } = useGameStore();
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 z-50">
      <div className="bg-yellow-50 p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl w-full text-center border-4 border-yellow-500">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl md:text-5xl font-black text-yellow-800 mb-4">Congratulations!</h1>
        <p className="text-2xl md:text-3xl font-bold text-green-700 mb-2">You are a Successful Retired Farmer!</p>
        <p className="text-xl text-gray-600 mb-8 italic">The harvest is bountiful and your farm is beautiful.</p>
        
        <div className="bg-white/60 p-6 rounded-xl border-2 border-yellow-200 mb-8 inline-block">
             <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Final Wealth</div>
             <div className="text-5xl font-black text-orange-500">{coins} <span className="text-2xl text-gray-600">Coins</span></div>
        </div>

        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <button onClick={startStoryMode} className="w-full bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 border-b-4 border-green-800">
             Play Again
          </button>
          <button onClick={exitToMenu} className="w-full bg-blue-500 hover:bg-blue-400 text-white text-xl font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 border-b-4 border-blue-700">
             Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

const LevelSelect = () => {
  const { startLevel, exitToMenu } = useGameStore();
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white/95 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-4 border-blue-600">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">Select Level</h2>
        <div className="space-y-4">
          {Object.values(LEVELS).map((lvl) => (
            <button key={lvl.levelNumber} onClick={() => startLevel(lvl.levelNumber)} className="w-full bg-green-100 hover:bg-green-200 border-2 border-green-500 p-4 rounded-lg text-left transition">
              <span className="block text-xl font-bold text-green-800">Level {lvl.levelNumber} ({lvl.season})</span>
              <span className="text-gray-600 text-sm">{lvl.duration}s • {lvl.tileCount} Tiles</span>
            </button>
          ))}
          <button onClick={exitToMenu} className="mt-4 text-gray-500 hover:text-gray-800 font-bold">← Back to Menu</button>
        </div>
      </div>
    </div>
  );
};

const StoryIntro = () => {
  const { currentLevel, startLevel } = useGameStore();
  const story = LEVELS[currentLevel]?.storyText || "Ready?";
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 z-50">
      <div className="bg-amber-50 p-8 rounded-xl shadow-2xl max-w-lg border-4 border-amber-600">
        <h2 className="text-2xl font-bold text-amber-800 mb-4">Chapter {currentLevel}</h2>
        <p className="text-xl text-gray-800 leading-relaxed mb-8 font-medium">{story}</p>
        <button onClick={() => startLevel(currentLevel)} className="w-full bg-green-600 hover:bg-green-500 text-white text-2xl font-bold py-3 rounded-lg shadow-md animate-pulse">Start</button>
      </div>
    </div>
  );
};

const HUD = () => {
  const { score, coins, misses, tiles, timeLeft, currentLevel, gamePhase, stopGame, resumeGame, exitToMenu, isMuted, toggleMute, fenceCount, isPlacingFence, toggleFencePlacement } = useGameStore();
  const treeCount = tiles.filter(t => t.stage !== GrowthStage.DIRT).length;
  
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6">
       {/* Top Bar */}
       <div className="flex justify-between items-start pointer-events-auto">
          <div className="flex gap-2">
            <div className="bg-white/90 p-3 rounded-xl shadow-lg border-2 border-green-600 min-w-[100px]">
                <div className="text-xs font-bold text-green-800 uppercase">Score</div>
                <div className="text-3xl font-black text-orange-600">{score}</div>
            </div>
            <div className="flex flex-col gap-2">
                 <div className="bg-white/80 px-3 py-1 rounded-lg shadow border border-green-500 flex items-center gap-2">
                    <span className="text-lg">🌳</span><span className="font-bold">{treeCount}</span>
                 </div>
                 <div className="bg-white/80 px-3 py-1 rounded-lg shadow border border-yellow-500 flex items-center gap-2">
                    <span className="text-lg">💰</span><span className="font-bold">{coins}</span>
                 </div>
                 <div className="bg-white/80 px-3 py-1 rounded-lg shadow border border-red-500 flex items-center gap-2">
                    <span className="text-lg">❌</span><span className="font-bold text-red-600">{misses}</span>
                 </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
             <div className="flex gap-2">
               <button onClick={toggleMute} className="bg-white/90 p-2 rounded-lg shadow border-2 border-gray-300 hover:bg-gray-100 transition active:scale-95">
                  <span className="text-xl">{isMuted ? "🔇" : "🔊"}</span>
               </button>
               <span className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow flex items-center">Level {currentLevel}</span>
             </div>
             <div className={`bg-white/90 p-3 rounded-xl shadow-lg border-2 min-w-[90px] text-center ${timeLeft < 10 ? 'border-red-500 animate-pulse' : 'border-blue-400'}`}>
                <div className="text-xs font-bold text-gray-600 uppercase">Time</div>
                <div className={`text-3xl font-black ${timeLeft < 10 ? 'text-red-600' : 'text-blue-600'}`}>{Math.ceil(timeLeft)}</div>
             </div>
          </div>
       </div>

       {/* Middle: Action Tips (When placing fence) */}
       {isPlacingFence && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/60 text-white px-6 py-3 rounded-xl text-xl font-bold animate-pulse backdrop-blur-sm border-2 border-white">
                    Click any tile to place protection fence!
                </div>
           </div>
       )}

       {/* Bottom/Pause Controls + Action Bar */}
       <div className="flex flex-col gap-4 items-center pointer-events-auto">
          {gamePhase === GamePhase.PLAYING && (
            <div className="flex gap-4 items-end">
                {/* Fence Button */}
                <button 
                    onClick={toggleFencePlacement}
                    className={`relative group flex flex-col items-center p-3 rounded-xl border-4 transition transform active:scale-95 ${isPlacingFence ? 'bg-orange-200 border-orange-500 scale-110' : 'bg-white/90 border-gray-300 hover:bg-gray-100'}`}
                >
                    <span className="text-3xl">🚧</span>
                    <span className="font-bold text-xs text-gray-700">Fence</span>
                    <div className="absolute -top-3 -right-3 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white font-bold shadow">
                        {fenceCount}
                    </div>
                </button>
                
                <button onClick={stopGame} className="bg-red-500/90 text-white font-bold py-3 px-8 rounded-full shadow-lg border-2 border-red-700 active:scale-95 self-center mb-2">PAUSE</button>
            </div>
          )}
          
          {gamePhase === GamePhase.IDLE && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col gap-4 min-w-[250px]">
                <h3 className="text-2xl font-bold text-center text-gray-700">Paused</h3>
                <button onClick={resumeGame} className="bg-green-500 text-white py-3 rounded-lg font-bold text-xl">Resume</button>
                <button onClick={exitToMenu} className="bg-gray-200 text-gray-700 py-3 rounded-lg font-bold">Quit to Menu</button>
              </div>
           </div>
          )}
       </div>
    </div>
  );
};

const LevelComplete = () => {
  const { score, coins, misses, tiles, appMode, currentLevel, advanceLevel, retryLevel, exitToMenu, buyDecoration, inventory, fenceCount } = useGameStore();
  const treeCount = tiles.filter(t => t.stage !== GrowthStage.DIRT).length;
  const weedCount = tiles.filter(t => t.status === TileStatus.WEED).length;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-3xl w-full border-4 border-yellow-500 flex flex-col md:flex-row gap-6">
        {/* Left: Stats */}
        <div className="flex-1 flex flex-col justify-center text-center md:text-left">
          <h2 className="text-3xl font-black text-yellow-600 mb-2">Level Complete!</h2>
          <div className="text-5xl font-black text-gray-800 mb-2">{score} <span className="text-xl text-gray-500">pts</span></div>
          <div className="text-lg font-bold text-orange-600 mb-6">Earned: {score} Coins</div>
          
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-700 bg-gray-100 p-3 rounded-lg mb-6">
             <div className="text-center"><div className="font-bold">Trees</div><div className="text-green-600 text-xl">{treeCount}</div></div>
             <div className="text-center"><div className="font-bold">Weeds</div><div className="text-red-600 text-xl">-{weedCount * 5}</div></div>
             <div className="text-center"><div className="font-bold">Misses</div><div className="text-red-600 text-xl">-{misses * 5}</div></div>
          </div>

          <div className="flex flex-col gap-2 mt-auto">
            {appMode === AppMode.STORY && (
               <button onClick={advanceLevel} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-md">
                 {currentLevel < 3 ? "Next Level" : "Finish Game"}
               </button>
            )}
            <div className="flex gap-2">
              <button onClick={retryLevel} className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 rounded-lg">Retry</button>
              <button onClick={exitToMenu} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-lg">Menu</button>
            </div>
          </div>
        </div>

        {/* Right: Shop */}
        <div className="flex-1 bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
           <h3 className="text-xl font-bold text-amber-800 mb-2">Farm Shop</h3>
           <div className="bg-white/80 p-2 rounded mb-4 font-bold text-orange-600 border border-orange-200">Wallet: {coins} Coins</div>
           <div className="space-y-2 overflow-y-auto max-h-[300px]">
              {SHOP_ITEMS.map((item) => {
                  const isOwned = !item.isConsumable && inventory.includes(item.type);
                  const isMaxFences = item.type === DecorationType.FENCE && fenceCount >= GAME_CONSTANTS.MAX_FENCES;
                  
                  return (
                    <button 
                      key={item.type}
                      onClick={() => buyDecoration(item.type)}
                      disabled={coins < item.price || isOwned || isMaxFences}
                      className="w-full flex justify-between items-center p-3 bg-white border border-gray-200 rounded hover:bg-orange-50 disabled:opacity-50 disabled:bg-gray-100"
                    >
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                          {item.icon} {item.name}
                          {item.isConsumable && item.type === DecorationType.FENCE && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Have: {fenceCount}/{GAME_CONSTANTS.MAX_FENCES}</span>}
                      </span>
                      {isOwned ? (
                        <span className="text-green-600 text-sm font-bold">Owned</span>
                      ) : isMaxFences ? (
                        <span className="text-red-500 text-sm font-bold">Max</span>
                      ) : (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-bold">{item.price} c</span>
                      )}
                    </button>
                  );
              })}
           </div>
           <div className="mt-4 text-xs text-gray-500 text-center">Purchased items appear in your Farm Base!</div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN OVERLAY COMPONENT ---
export const UIOverlay: React.FC = () => {
  const { appMode, gamePhase } = useGameStore();

  if (appMode === AppMode.MENU) return <MainMenu />;
  if (appMode === AppMode.VICTORY) return <VictoryScreen />;
  if (appMode === AppMode.LEVEL_SELECT && gamePhase === GamePhase.IDLE) return <LevelSelect />;
  if (gamePhase === GamePhase.INTRO_TEXT) return <StoryIntro />;
  if (gamePhase === GamePhase.LEVEL_COMPLETE) return <LevelComplete />;
  
  // Default to HUD during gameplay
  return <HUD />;
};