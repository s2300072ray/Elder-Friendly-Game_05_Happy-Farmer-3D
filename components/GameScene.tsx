import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { useGameStore } from '../store';
import { FarmTile } from './FarmTile';
import { EnvironmentDecor } from './EnvironmentDecor';
import { Bear } from './Bear';
import { GamePhase } from '../types';

export const GameScene: React.FC = () => {
  const { 
    tiles, 
    gamePhase,
    bearData,
    triggerNextBeat,
    tickTimer,
    currentLevel
  } = useGameStore();
  
  const beatTimerRef = useRef<number>(0);

  const getSpeed = (level: number) => {
    switch(level) {
      case 3: return 1700;
      default: return 2000;
    }
  };
  
  const getGroundColor = (level: number) => {
    if (level === 2) return "#DEB887"; // Autumn
    if (level === 3) return "#E0F7FA"; // Winter
    return "#8FBC8F"; // Spring/Summer
  };

  useFrame((state, delta) => {
    if (gamePhase !== GamePhase.PLAYING) return;

    tickTimer(delta);

    beatTimerRef.current += delta * 1000;
    const speed = getSpeed(currentLevel);

    if (beatTimerRef.current > speed) {
      beatTimerRef.current = 0;
      triggerNextBeat();
    }
  });

  return (
    <>
      <OrthographicCamera 
        makeDefault 
        position={[20, 20, 20]} 
        zoom={50} 
        near={-50} 
        far={200}
        onUpdate={c => c.lookAt(0, 0, 0)}
      />

      <ambientLight intensity={0.7} color="#ffffff" />
      <directionalLight 
        position={[10, 20, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      <directionalLight position={[-10, 10, -5]} intensity={0.3} color="#b0e0e6" />

      <EnvironmentDecor />

      <Suspense fallback={null}>
        {bearData && gamePhase === GamePhase.PLAYING && <Bear data={bearData} />}
      </Suspense>

      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={getGroundColor(currentLevel)} />
      </mesh>

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