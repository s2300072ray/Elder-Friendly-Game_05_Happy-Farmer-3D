import React from 'react';
import { Environment } from '@react-three/drei';
import { useGameStore } from '../store';
import { LEVELS, ATMOSPHERE } from '../gameConfig';

export const LightingController: React.FC = () => {
  const { currentLevel } = useGameStore();
  const config = LEVELS[currentLevel];
  const atmos = ATMOSPHERE[config?.season] || ATMOSPHERE.SPRING;

  return (
    <>
      {/* Dynamic Background & Fog */}
      <color attach="background" args={[atmos.fogColor]} />
      <fog attach="fog" args={[atmos.fogColor, atmos.fogNear, atmos.fogFar]} />

      {/* Image Based Lighting */}
      <Environment preset={atmos.envPreset} />

      {/* Main Directional Light (Simulates Sun) */}
      <directionalLight 
        position={[10, 20, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
        shadow-bias={-0.0001}
      />

      {/* Ambient Fill */}
      <ambientLight intensity={0.4} />
      
      {/* Ground Plane */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={atmos.groundColor} roughness={0.8} />
      </mesh>
    </>
  );
};