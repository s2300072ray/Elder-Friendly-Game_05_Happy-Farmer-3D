import React, { useEffect, useRef, Suspense } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrthographicCamera, Environment } from '@react-three/drei';
import { useGameStore } from '../store';
import { FarmTile } from './FarmTile';
import { EnvironmentDecor } from './EnvironmentDecor';
import { Bear } from './Bear';
import { GamePhase, Season } from '../types';

export const GameScene: React.FC = () => {
  const { 
    tiles, 
    activeTileIds, 
    gamePhase,
    bearData,
    triggerNextBeat,
    tickTimer,
    currentLevel
  } = useGameStore();
  
  const beatTimerRef = useRef<number>(0);

  // Define speed based on current level (hardcoded lookup for simplicity matching store)
  const getSpeed = (level: number) => {
    switch(level) {
      case 3: return 1700;
      default: return 2000;
    }
  };
  
  const getGroundColor = (level: number) => {
    if (level === 2) return "#DEB887"; // Autumn (Burlywood)
    if (level === 3) return "#E0F7FA"; // Winter (Pale Cyan)
    return "#8FBC8F"; // Spring/Summer (DarkSeaGreen)
  };

  // The Game Rhythm System & Timer
  useFrame((state, delta) => {
    if (gamePhase !== GamePhase.PLAYING) return;

    // 1. Tick Level Timer
    tickTimer(delta);

    // 2. Rhythm Logic
    beatTimerRef.current += delta * 1000;
    const speed = getSpeed(currentLevel);

    if (beatTimerRef.current > speed) {
      beatTimerRef.current = 0;
      triggerNextBeat();
    }
  });

  return (
    <>
      {/* 
        SENIOR UX CAMERA SETUP
        Fixed Orthographic (Isometric) view.
      */}
      <OrthographicCamera 
        makeDefault 
        position={[20, 20, 20]} 
        zoom={50} // Slightly zoomed out to accommodate larger scatter
        near={-50} 
        far={200}
        onUpdate={c => c.lookAt(0, 0, 0)}
      />

      {/* LIGHTING - Soft and clear */}
      <ambientLight intensity={0.7} color="#ffffff" />
      <directionalLight 
        position={[10, 20, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      {/* Fill light for shadows */}
      <directionalLight position={[-10, 10, -5]} intensity={0.3} color="#b0e0e6" />

      {/* ENVIRONMENT & DECORATIONS */}
      <EnvironmentDecor />

      {/* THE BEAR ENEMY */}
      {/* Wrapped in Suspense to prevent full scene unmount (blue flash) when loading font/assets */}
      <Suspense fallback={null}>
        {bearData && gamePhase === GamePhase.PLAYING && <Bear data={bearData} />}
      </Suspense>

      {/* GLOBAL GROUND (Far background) */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={getGroundColor(currentLevel)} />
      </mesh>

      {/* THE GRID */}
      {/* 0,0,0 is the center anchor for random generation */}
      <group position={[0, 0, 0]}>
        {tiles.map((tile) => (
          <FarmTile 
            key={tile.id} 
            data={tile} 
            position={[tile.col, 0, tile.row]} 
          />
        ))}
      </group>
    </>
  );
};