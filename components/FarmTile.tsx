import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Mesh } from 'three';
import { TileData, TileStatus } from '../types';
import { useGameStore } from '../store';
import { Crop } from './Crop';

interface FarmTileProps {
  data: TileData;
  position: [number, number, number];
}

// Simple weed geometry
const Weed: React.FC = () => {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Jagged spikes */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, i * (Math.PI / 2), Math.PI / 6]} position={[0, 0, 0]}>
           <coneGeometry args={[0.1, 0.4, 3]} />
           <meshStandardMaterial color="#8B0000" />
        </mesh>
      ))}
    </group>
  );
};

export const FarmTile: React.FC<FarmTileProps> = ({ data, position }) => {
  const meshRef = useRef<Mesh>(null);
  const { handleTileClick, bearData } = useGameStore();
  const [hovered, setHovered] = useState(false);

  // Derived state
  const isTarget = data.status === TileStatus.GROWTH_TARGET;
  const isWeed = data.status === TileStatus.WEED;
  // Check if this tile is the specific target of the active bear
  const isBearTarget = bearData?.targetTileId === data.id;

  // Animation logic
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle bobbing if active
      const isActive = isTarget || isWeed || isBearTarget;
      const targetY = position[1] + (isActive ? Math.sin(state.clock.elapsedTime * 5) * 0.1 + 0.1 : 0);
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;

      // Color transition
      const material = meshRef.current.material as any;
      
      let targetColor = new Color("#5D4037"); // Default Dirt Brown
      let targetEmissive = new Color("#000000");
      let targetEmissiveIntensity = 0;

      if (isBearTarget) {
        // High priority: Bear is attacking this tile!
        // Pale Red Background + Pulsing Red Emissive
        const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.5 + 0.5; // Faster pulse
        targetColor = new Color("#FFCDD2"); // Pale Red
        targetEmissive = new Color("#FF0000"); // Red Warning
        targetEmissiveIntensity = 0.5 + (pulse * 0.5); // 0.5 to 1.0 intensity
      } else if (isTarget) {
        // Gold/Yellow glow for growth target
        targetColor = new Color("#D2691E"); 
        targetEmissive = new Color("#FFD700"); 
        targetEmissiveIntensity = 0.5;
      } else if (isWeed) {
        // Red glow for weed
        targetColor = new Color("#5D4037"); 
        targetEmissive = new Color("#FF0000"); // Red Warning
        targetEmissiveIntensity = 0.6;
      } else if (hovered) {
        targetColor = new Color("#6D5047");
      }

      material.color.lerp(targetColor, 0.1);
      material.emissive.lerp(targetEmissive, 0.1);
      material.emissiveIntensity = targetEmissiveIntensity;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh
        ref={meshRef}
        position={[0, 0, 0]} 
        onClick={(e) => {
          e.stopPropagation(); 
          handleTileClick(data.id);
        }}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[0.9, 0.2, 0.9]} />
        <meshStandardMaterial 
          roughness={1} 
          color="#5D4037"
        />
      </mesh>

      {/* The Crop or Weed sits on top */}
      <group position={[0, 0.1, 0]}>
         {isWeed ? <Weed /> : <Crop stage={data.stage} />}
      </group>
    </group>
  );
};