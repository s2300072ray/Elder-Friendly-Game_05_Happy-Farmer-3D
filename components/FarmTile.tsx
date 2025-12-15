import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Mesh } from 'three';
import { TileData } from '../types';
import { useGameStore } from '../store';
import { Crop } from './Crop';

interface FarmTileProps {
  data: TileData;
  position: [number, number, number];
}

export const FarmTile: React.FC<FarmTileProps> = ({ data, position }) => {
  const meshRef = useRef<Mesh>(null);
  const { handleTileClick, activeTileIds } = useGameStore();
  const [hovered, setHovered] = useState(false);

  // Derived state: Check if this tile ID is in the active array
  const isActive = activeTileIds.includes(data.id);

  // Animation logic
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle bobbing if active to attract attention
      const targetY = position[1] + (isActive ? Math.sin(state.clock.elapsedTime * 5) * 0.1 + 0.1 : 0);
      // Smooth lerp for Y position
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;

      // Color transition logic manually for performance
      const material = meshRef.current.material as any;
      
      let targetColor = new Color("#5D4037"); // Default Dirt Brown
      let targetEmissive = new Color("#000000");
      let targetEmissiveIntensity = 0;

      if (isActive) {
        // Gold/Yellow glow for active target - High visibility
        targetColor = new Color("#D2691E"); // Chocolate
        targetEmissive = new Color("#FFD700"); // Gold
        targetEmissiveIntensity = 0.5;
      } else if (hovered) {
        // Slight highlight on hover
        targetColor = new Color("#6D5047");
      }

      material.color.lerp(targetColor, 0.1);
      material.emissive.lerp(targetEmissive, 0.1);
      material.emissiveIntensity = targetEmissiveIntensity;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 
        THE CLICK TARGET
        This box mesh acts as the Raycast receiver.
        The pointer events are naturally handled by R3F.
      */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]} // Initial local position
        onClick={(e) => {
          e.stopPropagation(); // Prevent clicking through to ground
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
        {/* BoxGeometry: Width, Height, Depth. Height is small to look like a tile */}
        <boxGeometry args={[0.9, 0.2, 0.9]} />
        <meshStandardMaterial 
          roughness={1} 
          color="#5D4037"
        />
      </mesh>

      {/* The Crop sits on top of the tile */}
      <group position={[0, 0.1, 0]}>
         {/* Pass position 0,0,0 relative to parent group */}
        <Crop stage={data.stage} />
      </group>
    </group>
  );
};