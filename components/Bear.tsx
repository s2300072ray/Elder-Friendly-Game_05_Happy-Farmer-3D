import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useGameStore } from '../store';
import { BearData, GamePhase } from '../types';
import { Text } from '@react-three/drei';

interface BearProps {
  data: BearData;
}

export const Bear: React.FC<BearProps> = ({ data }) => {
  const groupRef = useRef<Group>(null);
  const { shooBear, bearAttack, gamePhase } = useGameStore();
  const [isLeaving, setIsLeaving] = useState(false);
  
  // Timer for the bear to attack if not clicked
  useEffect(() => {
    // Check game phase instead of isPlaying
    if (gamePhase !== GamePhase.PLAYING) return;
    
    // UPDATE: 2000ms (2 seconds)
    const attackTime = 2000; 
    
    const timer = setTimeout(() => {
        setIsLeaving(true);
        // Small delay for visual effect (shrink) before actually updating state
        setTimeout(() => {
             // This function in store handles removing the bear and the crop
             bearAttack();
        }, 300);
    }, attackTime);

    return () => clearTimeout(timer);
  }, [data.id, bearAttack, gamePhase]);

  // Animation Loop
  useFrame((state) => {
    if (groupRef.current) {
      // Bobbing animation (breathing/walking in place)
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = Math.abs(Math.sin(t * 5)) * 0.1;
      
      // If leaving (attacking), scale down quickly
      if (isLeaving) {
        groupRef.current.scale.lerp({ x: 0, y: 0, z: 0 } as any, 0.2);
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    shooBear();
  };

  return (
    <group 
        position={data.position} 
        rotation={[0, data.rotationY, 0]}
    >
      <group 
        ref={groupRef}
        onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        {/* Floating text to prompt user */}
        <Text position={[0, 2.5, 0]} fontSize={0.5} color="red" outlineWidth={0.05} outlineColor="white">
          !
        </Text>

        {/* Main Body */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.8, 0.9, 1.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.2, 0.5]} castShadow>
          <boxGeometry args={[0.7, 0.6, 0.6]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Snout */}
        <mesh position={[0, 1.1, 0.85]}>
          <boxGeometry args={[0.3, 0.25, 0.2]} />
          <meshStandardMaterial color="#D2B48C" />
        </mesh>
        <mesh position={[0, 1.2, 0.96]}>
           <sphereGeometry args={[0.08]} />
           <meshStandardMaterial color="black" />
        </mesh>

        {/* Ears */}
        <mesh position={[0.25, 1.55, 0.6]}>
          <boxGeometry args={[0.15, 0.15, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[-0.25, 1.55, 0.6]}>
          <boxGeometry args={[0.15, 0.15, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Legs (Front Left) */}
        <mesh position={[-0.3, 0.3, 0.4]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.6]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        {/* Legs (Front Right) */}
        <mesh position={[0.3, 0.3, 0.4]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.6]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        {/* Legs (Back Left) */}
        <mesh position={[-0.3, 0.3, -0.4]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.6]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        {/* Legs (Back Right) */}
        <mesh position={[0.3, 0.3, -0.4]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.6]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      </group>
    </group>
  );
};