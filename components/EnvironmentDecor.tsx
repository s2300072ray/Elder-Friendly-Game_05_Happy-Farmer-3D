import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { Group, MathUtils } from 'three';
import { Season, DecorationType } from '../types';

const getLevelInfo = (level: number) => {
  if (level === 2) return { season: Season.AUTUMN, boundary: 5 };
  if (level === 3) return { season: Season.WINTER, boundary: 6 };
  return { season: Season.SPRING, boundary: 4 };
};

// --- CLOUD COMPONENT ---
interface CloudProps {
  position: [number, number, number];
  scale: number;
  swayOffset: number;
}

const Cloud: React.FC<CloudProps> = ({ position, scale, swayOffset }) => {
  const groupRef = useRef<Group>(null);
  const startX = position[0];

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle Swaying Left/Right (X axis)
      const t = state.clock.elapsedTime;
      groupRef.current.position.x = startX + Math.sin(t * 0.3 + swayOffset) * 1.5;
    }
  });

  const cloudMaterial = (
    <meshStandardMaterial 
      color="white" 
      transparent 
      opacity={0.8} 
      roughness={0.8} 
    />
  );

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0, 0]}> <sphereGeometry args={[1, 16, 16]} /> {cloudMaterial} </mesh>
      <mesh position={[0.9, -0.2, 0]}> <sphereGeometry args={[0.7, 16, 16]} /> {cloudMaterial} </mesh>
      <mesh position={[-0.9, -0.1, 0.2]}> <sphereGeometry args={[0.8, 16, 16]} /> {cloudMaterial} </mesh>
      <mesh position={[0.4, 0.6, 0]}> <sphereGeometry args={[0.6, 16, 16]} /> {cloudMaterial} </mesh>
    </group>
  );
};

// --- HILL COMPONENT ---
interface HillProps {
  position: [number, number, number];
  scale: [number, number, number];
  season: Season;
}

const Hill: React.FC<HillProps> = ({ position, scale, season }) => {
  let color = "#98FB98"; // Spring Green
  if (season === Season.AUTUMN) color = "#E6C288"; // Dried grass
  if (season === Season.WINTER) color = "#E0FFFF"; // Ice/Snow

  return (
    <mesh position={position} scale={scale} receiveShadow>
      <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={color} /> 
    </mesh>
  );
};

// --- TREE COMPONENT ---
const Tree: React.FC<{ position: [number, number, number]; scale?: number; color?: string; season: Season }> = ({ position, scale = 1, color = "#228B22", season }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.2, 1, 6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.8, 0]} scale={[0.8, 0.8, 0.8]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={season === Season.WINTER ? 0.2 : 0.05} />
      </mesh>
    </group>
  );
};

// --- HOUSE DECORATION ---
const HouseDecor: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1, 0]} castShadow receiveShadow>
       <boxGeometry args={[2, 2, 2]} />
       <meshStandardMaterial color="#E9967A" />
    </mesh>
    <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI/4, 0]} castShadow>
       <coneGeometry args={[2, 1.5, 4]} />
       <meshStandardMaterial color="#8B0000" />
    </mesh>
    <mesh position={[0, 1, 1.01]}>
       <boxGeometry args={[0.6, 1.2, 0.1]} />
       <meshStandardMaterial color="#4A3B2A" />
    </mesh>
  </group>
);

// --- WINDMILL DECORATION ---
const WindmillDecor: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const bladesRef = useRef<Group>(null);
  useFrame((state) => {
    if (bladesRef.current) bladesRef.current.rotation.z -= 0.02;
  });
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
         <cylinderGeometry args={[0.8, 1.2, 3, 6]} />
         <meshStandardMaterial color="#F5F5DC" />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
         <coneGeometry args={[1, 1, 6]} />
         <meshStandardMaterial color="#A52A2A" />
      </mesh>
      <group ref={bladesRef} position={[0, 2.5, 0.8]}>
         <mesh position={[0, 0, 0]}><boxGeometry args={[0.3, 0.3, 0.2]} /><meshStandardMaterial color="#333" /></mesh>
         <mesh position={[0, 1.2, 0]}><boxGeometry args={[0.2, 2.4, 0.05]} /><meshStandardMaterial color="#FFF" /></mesh>
         <mesh position={[0, -1.2, 0]}><boxGeometry args={[0.2, 2.4, 0.05]} /><meshStandardMaterial color="#FFF" /></mesh>
         <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI/2]}><boxGeometry args={[0.2, 2.4, 0.05]} /><meshStandardMaterial color="#FFF" /></mesh>
         <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI/2]}><boxGeometry args={[0.2, 2.4, 0.05]} /><meshStandardMaterial color="#FFF" /></mesh>
      </group>
    </group>
  );
};

// --- WATER WHEEL DECORATION ---
const WaterWheelDecor: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const wheelRef = useRef<Group>(null);
  useFrame((state) => {
    if (wheelRef.current) wheelRef.current.rotation.x += 0.01;
  });
  return (
    <group position={position}>
       {/* Support */}
       <mesh position={[-0.6, 1, 0]}><boxGeometry args={[0.2, 2, 0.2]} /><meshStandardMaterial color="#8B4513" /></mesh>
       <mesh position={[0.6, 1, 0]}><boxGeometry args={[0.2, 2, 0.2]} /><meshStandardMaterial color="#8B4513" /></mesh>
       {/* Wheel */}
       <group ref={wheelRef} position={[0, 1.5, 0]}>
          <mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[1.5, 1.5, 0.5, 16]} /><meshStandardMaterial color="#CD853F" wireframe /></mesh>
          {[0, 45, 90, 135].map(deg => (
             <mesh key={deg} rotation={[MathUtils.degToRad(deg), 0, 0]}><boxGeometry args={[0.2, 3, 0.4]} /><meshStandardMaterial color="#8B4513" /></mesh>
          ))}
       </group>
    </group>
  );
};

// --- LAKE ---
const Lake: React.FC = () => {
  return (
    <group position={[14, -0.4, 2]}>
      <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
         <circleGeometry args={[6, 32]} />
         <meshStandardMaterial 
          color="#ADD8E6" 
          roughness={0.1} 
          metalness={0.4} 
          transparent 
          opacity={0.6} 
         />
      </mesh>
    </group>
  );
};

export const EnvironmentDecor: React.FC = () => {
  const { currentLevel, inventory } = useGameStore();
  const { season, boundary } = getLevelInfo(currentLevel);

  // Generate trees
  const trees = useMemo(() => {
    const items = [];
    const count = 18;
    const minRadius = boundary + 4; 
    const maxRadius = minRadius + 8;
    
    let treeColors = ["#228B22", "#006400", "#32CD32"];
    if (season === Season.AUTUMN) treeColors = ["#CD853F", "#D2691E", "#FF8C00"];
    else if (season === Season.WINTER) treeColors = ["#FFFFFF", "#F0F8FF"];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random();
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.6 + Math.random() * 0.9; 
      const color = treeColors[Math.floor(Math.random() * treeColors.length)];
      items.push(<Tree key={`tree-${i}`} position={[x, 0, z]} scale={scale} color={color} season={season} />);
    }
    return items;
  }, [season, boundary]);

  // Generate Hills
  const hills = useMemo(() => {
    const items = [];
    const count = 8;
    const radius = 18;
    
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random();
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const width = 3 + Math.random() * 4;
        const height = 1 + Math.random() * 2;
        items.push(<Hill key={`hill-${i}`} position={[x, -0.5, z]} scale={[width, height, width]} season={season} />)
    }
    return items;
  }, [season]);

  // Generate clouds - STRICTLY 2 CLOUDS in Corners
  const clouds = useMemo(() => {
    return [
        // Top Left Area (Deep Background)
        <Cloud key="c1" position={[-16, 14, -16]} scale={3} swayOffset={0} />,
        
        // Bottom Right Area (Foreground)
        <Cloud key="c2" position={[16, 12, 16]} scale={2.5} swayOffset={2.5} />,
    ];
  }, []);

  // Calculate road
  const innerSize = (boundary * 2) + 2; 
  const outerSize = innerSize + 3;

  return (
    <group>
      {trees}
      {hills}
      {clouds}
      <Lake />

      {/* Default Houses */}
      <group position={[-9, 0, -9]} rotation={[0, Math.PI/4, 0]}>
         <mesh position={[0, 0.75, 0]}><boxGeometry args={[1.8, 1.5, 1.5]} /><meshStandardMaterial color="#F5DEB3" /></mesh>
         <mesh position={[0, 2.1, 0]} rotation={[0, Math.PI/4, 0]}><coneGeometry args={[1.6, 1.2, 4]} /><meshStandardMaterial color="#A52A2A" /></mesh>
      </group>

      {/* Render Purchased Inventory */}
      {inventory.map((type, idx) => {
        // Simple slotting mechanism to place them around the farm
        // Base position offset
        const slot = idx;
        let x = 12;
        let z = -5 + (slot * 5); // Line them up on the right side
        
        if (type === DecorationType.HOUSE) return <HouseDecor key={idx} position={[x, 0, z]} />;
        if (type === DecorationType.WINDMILL) return <WindmillDecor key={idx} position={[x, 0, z]} />;
        // Place water wheel near/in the lake if possible, or just default spot
        if (type === DecorationType.WATER_WHEEL) return <WaterWheelDecor key={idx} position={[10, 0, 5]} />; 
        return null;
      })}

      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[outerSize, outerSize]} />
        <meshStandardMaterial color="#808080" /> 
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[innerSize - 1, innerSize - 1]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    </group>
  );
};