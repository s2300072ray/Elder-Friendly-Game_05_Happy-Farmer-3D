import React from 'react';
import { useGameStore } from '../store';
import { AppMode, GamePhase, GrowthStage, DecorationType, TileStatus } from '../types';

export const UIOverlay: React.FC = () => {
  const { 
    score, 
    coins,
    misses, // Get misses
    tiles,
    bearsShooed,
    gamePhase, 
    appMode, 
    timeLeft, 
    currentLevel,
    startStoryMode, 
    startLevelSelect,
    startLevel,
    stopGame, 
    resumeGame,
    exitToMenu,
    advanceLevel,
    retryLevel,
    buyDecoration,
    inventory
  } = useGameStore();

  const formatTime = (seconds: number) => Math.ceil(seconds);
  const treeCount = tiles.filter(t => t.stage !== GrowthStage.DIRT).length;
  const weedCount = tiles.filter(t => t.status === TileStatus.WEED).length;

  // --- STORY TEXT CONTENT ---
  const getStoryText = () => {
    if (currentLevel === 1) return "You are a happy and successful retiree who has bought a piece of land in the countryside. It's time to become a farmer and enjoy the rural life. Let's start our farm life now!";
    if (currentLevel === 2) return "Congratulations! With your hard work through Spring and Summer, you've successfully turned the small vegetable garden into a small farm. Watch out for weeds!";
    if (currentLevel === 3) return "Fantastic! You worked hard in Autumn too. Winter is coming, but the soil is still fertile. Keep building your dream farm!";
    return "Great job!";
  };

  // --- MENU ---
  if (appMode === AppMode.MENU) {
    return (
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/menu-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        <div className="relative z-10 bg-white/90 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-4 border-green-600 backdrop-blur-md">
          <h1 className="text-4xl font-black text-green-800 mb-2">Happy Farmer 3D</h1>
          <p className="text-gray-600 mb-8 text-lg">Retirement Paradise</p>
          <div className="space-y-4">
            <button onClick={startStoryMode} className="w-full bg-orange-500 hover:bg-orange-400 text-white text-2xl font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95">Start Game</button>
            <button onClick={startLevelSelect} className="w-full bg-blue-500 hover:bg-blue-400 text-white text-xl font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95">Select Level</button>
          </div>
        </div>
      </div>
    );
  }

  // --- LEVEL SELECT ---
  if (appMode === AppMode.LEVEL_SELECT && gamePhase === GamePhase.IDLE) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
         <div className="bg-white/95 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-4 border-blue-600">
          <h2 className="text-3xl font-bold text-blue-800 mb-6">Select Level</h2>
          <div className="space-y-4">
            <button onClick={() => startLevel(1)} className="w-full bg-green-100 hover:bg-green-200 border-2 border-green-500 p-4 rounded-lg text-left">
              <span className="block text-xl font-bold text-green-800">Level 1 (Spring)</span>
              <span className="text-gray-600 text-sm">45 Seconds • 1 Target • 3x3</span>
            </button>
            <button onClick={() => startLevel(2)} className="w-full bg-green-100 hover:bg-green-200 border-2 border-green-500 p-4 rounded-lg text-left">
              <span className="block text-xl font-bold text-green-800">Level 2 (Autumn)</span>
              <span className="text-gray-600 text-sm">60s • Weeds Appear • 4x4</span>
            </button>
            <button onClick={() => startLevel(3)} className="w-full bg-green-100 hover:bg-green-200 border-2 border-green-500 p-4 rounded-lg text-left">
              <span className="block text-xl font-bold text-green-800">Level 3 (Winter)</span>
              <span className="text-gray-600 text-sm">60s • Fast Pace • 5x5</span>
            </button>
            <button onClick={exitToMenu} className="mt-4 text-gray-500 hover:text-gray-800 font-bold">← Back to Menu</button>
          </div>
        </div>
      </div>
    );
  }

  // --- INTRO ---
  if (gamePhase === GamePhase.INTRO_TEXT) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 z-50">
        <div className="bg-amber-50 p-8 rounded-xl shadow-2xl max-w-lg border-4 border-amber-600">
          <h2 className="text-2xl font-bold text-amber-800 mb-4">Chapter {currentLevel}</h2>
          <p className="text-xl text-gray-800 leading-relaxed mb-8 font-medium">{getStoryText()}</p>
          <button onClick={() => startLevel(currentLevel)} className="w-full bg-green-600 hover:bg-green-500 text-white text-2xl font-bold py-3 rounded-lg shadow-md animate-pulse">Let's Go!</button>
        </div>
      </div>
    );
  }

  // --- LEVEL COMPLETE / SHOP ---
  if (gamePhase === GamePhase.LEVEL_COMPLETE) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 z-50">
        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full text-center border-4 border-yellow-500 flex flex-col md:flex-row gap-6">
          
          {/* Left: Stats */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-black text-yellow-600 mb-2">Time's Up!</h2>
            <div className="text-5xl font-black text-gray-800 mb-2">{score} <span className="text-xl text-gray-500">pts</span></div>
            <div className="text-lg font-bold text-orange-600 mb-4">Earned: {score} Coins</div>
            
            <div className="flex justify-around mb-6 text-gray-700 bg-gray-100 p-3 rounded-lg text-left">
               <div>
                  <div className="text-sm font-bold">Trees</div>
                  <div className="text-xl text-green-600">{treeCount}</div>
               </div>
               <div>
                  <div className="text-sm font-bold">Weeds Left</div>
                  <div className="text-xl text-red-600">-{weedCount * 5} pts</div>
               </div>
               <div>
                  <div className="text-sm font-bold">Misses</div>
                  <div className="text-xl text-red-600">-{misses * 5} pts</div>
               </div>
            </div>

            <div className="flex flex-col gap-2">
              {appMode === AppMode.STORY && (
                 <button onClick={advanceLevel} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-md">
                   {currentLevel < 3 ? "Next Level" : "Finish"}
                 </button>
              )}
              <button onClick={retryLevel} className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 rounded-lg">Retry</button>
              <button onClick={exitToMenu} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-lg">Menu</button>
            </div>
          </div>

          {/* Right: Shop */}
          <div className="flex-1 bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
             <h3 className="text-xl font-bold text-amber-800 mb-2">Farm Shop</h3>
             <div className="bg-white/80 p-2 rounded mb-4 font-bold text-orange-600 border border-orange-200">
               Your Wallet: {coins} Coins
             </div>
             <div className="space-y-2 overflow-y-auto max-h-[300px]">
                <button 
                  onClick={() => buyDecoration(DecorationType.HOUSE, 20)}
                  disabled={coins < 20}
                  className="w-full flex justify-between items-center p-3 bg-white border border-gray-200 rounded hover:bg-orange-50 disabled:opacity-50 disabled:bg-gray-100"
                >
                  <span className="font-bold text-gray-700">🏠 House</span>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-bold">20 c</span>
                </button>
                <button 
                  onClick={() => buyDecoration(DecorationType.WINDMILL, 40)}
                  disabled={coins < 40}
                  className="w-full flex justify-between items-center p-3 bg-white border border-gray-200 rounded hover:bg-orange-50 disabled:opacity-50 disabled:bg-gray-100"
                >
                  <span className="font-bold text-gray-700">🌪 Windmill</span>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-bold">40 c</span>
                </button>
                <button 
                  onClick={() => buyDecoration(DecorationType.WATER_WHEEL, 40)}
                  disabled={coins < 40}
                  className="w-full flex justify-between items-center p-3 bg-white border border-gray-200 rounded hover:bg-orange-50 disabled:opacity-50 disabled:bg-gray-100"
                >
                  <span className="font-bold text-gray-700">💧 Water Wheel</span>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-bold">40 c</span>
                </button>
             </div>
             <div className="mt-4 text-xs text-gray-500">
               Items will appear in the next level!
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- HUD ---
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6">
      <div className="flex justify-between items-start pointer-events-auto w-full">
        {/* Stats */}
        <div className="flex gap-2">
            <div className="bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-lg border-2 border-green-600 min-w-[100px]">
                <div className="text-xs md:text-sm font-bold text-green-800 uppercase tracking-wider">Score</div>
                <div className="text-2xl md:text-4xl font-black text-orange-600">{score}</div>
            </div>
            
            <div className="flex flex-col gap-2">
                 <div className="bg-white/80 backdrop-blur-md px-3 py-2 rounded-lg shadow-md border border-green-500 flex items-center gap-2">
                    <span className="text-lg">🌳</span>
                    <span className="font-bold text-gray-700">{treeCount}</span>
                 </div>
                 {/* Show Coins in HUD too */}
                 <div className="bg-white/80 backdrop-blur-md px-3 py-2 rounded-lg shadow-md border border-yellow-500 flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <span className="font-bold text-gray-700">{coins}</span>
                 </div>
                 {/* Misses */}
                 <div className="bg-white/80 backdrop-blur-md px-3 py-2 rounded-lg shadow-md border border-red-500 flex items-center gap-2">
                    <span className="text-lg">❌</span>
                    <span className="font-bold text-red-600">{misses}</span>
                 </div>
            </div>
        </div>

        {/* Timer */}
        {gamePhase === GamePhase.PLAYING || gamePhase === GamePhase.IDLE ? (
           <div className="flex flex-col items-end gap-2">
             <div className="bg-blue-600 text-white px-4 py-1 rounded-full font-bold shadow-md text-sm md:text-base">Level {currentLevel}</div>
             <div className={`bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-lg border-2 min-w-[100px] text-center ${timeLeft < 10 ? 'border-red-500 animate-pulse' : 'border-blue-400'}`}>
                <div className="text-xs md:text-sm font-bold text-gray-600 uppercase">Time</div>
                <div className={`text-2xl md:text-4xl font-black ${timeLeft < 10 ? 'text-red-600' : 'text-blue-600'}`}>{formatTime(timeLeft)}s</div>
             </div>
           </div>
        ) : null}
      </div>

      {/* Controls */}
      <div className="flex justify-center pointer-events-auto">
        {gamePhase === GamePhase.PLAYING && (
          <button onClick={stopGame} className="bg-red-500/90 hover:bg-red-500 text-white font-bold py-2 px-8 rounded-full shadow-lg border-2 border-red-700 backdrop-blur-sm transition-transform active:scale-95">PAUSE</button>
        )}
        {gamePhase === GamePhase.IDLE && (
           <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-40">
              <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col gap-4 min-w-[250px]">
                <h3 className="text-2xl font-bold text-center text-gray-700">Paused</h3>
                <button onClick={resumeGame} className="bg-green-500 text-white py-3 rounded-lg font-bold text-xl hover:bg-green-400">Resume</button>
                <button onClick={exitToMenu} className="bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300">Quit to Menu</button>
              </div>
           </div>
        )}
      </div>
      
      {/* Help Text */}
      {gamePhase === GamePhase.PLAYING && (
        <div className="absolute bottom-4 left-4 pointer-events-none opacity-60 hidden lg:block">
           <div className="bg-black/40 text-white p-3 rounded-lg text-sm">
             <p>Click <span className="text-yellow-400 font-bold">Yellow</span> to Grow • Click <span className="text-red-400 font-bold">Red</span> to Remove Weeds</p>
           </div>
        </div>
      )}
    </div>
  );
};