import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { useGameStore } from '../store';
import { FarmTile } from './FarmTile';
import { EnvironmentDecor } from './EnvironmentDecor';
import { Bear } from './Bear';
import { GamePhase } from '../types';
import { LightingController } from './LightingController';
import { LEVELS } from '../gameConfig';

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
  const config = LEVELS[currentLevel];

  useFrame((state, delta) => {
    if (gamePhase !== GamePhase.PLAYING) return;

    tickTimer(delta);

    // Beat System (Spawning logic)
    if (config) {
        beatTimerRef.current += delta * 1000;
        if (beatTimerRef.current > config.beatSpeed) {
            beatTimerRef.current = 0;
            triggerNextBeat();
        }
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

      <LightingController />
      <EnvironmentDecor />

      <Suspense fallback={null}>
        {bearData && gamePhase === GamePhase.PLAYING && <Bear data={bearData} />}
      </Suspense>

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