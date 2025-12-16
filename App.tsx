import React from 'react';
import { Canvas } from '@react-three/fiber';
import { GameScene } from './components/GameScene';
import { UIOverlay } from './components/UIOverlay';
import { AudioController } from './components/AudioController';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-sky-300 overflow-hidden">
      {/* 
        3D CANVAS LAYER 
        Shadows enabled.
        Dpr (Device Pixel Ratio) limited to 2 for performance on high-res screens.
      */}
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true }}
        className="touch-none" // Prevents mobile scrolling gestures interfering with game
      >
        <GameScene />
      </Canvas>

      {/* 2D HUD LAYER */}
      <UIOverlay />
      
      {/* LOGIC LAYERS */}
      <AudioController />
    </div>
  );
};

export default App;