import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { Group, MathUtils } from 'three';
import { Season, DecorationType } from '../types';
import { LEVELS, GAME_CONSTANTS } from '../gameConfig';

// --- SUB-COMPONENTS (Cloud, Hill, Tree, Houses) ---
// Kept in same file for cohesion, but could be separated in a larger project.

const Cloud: React.FC<{ position: [number, number, number]; scale: number; swayOffset: number }> = ({ position, scale, swayOffset }) => {
  const groupRef = useRef<Group>(null);
  const startX = position[0];
  useFrame((state) => {
    if (groupRef.current) groupRef.current.position.x = startX + Math.sin(state.clock.elapsedTime * 0.3 + swayOffset) * 1.5;
  });
  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0, 0]}> <sphereGeometry args={[1, 16, 16]} /> <meshStandardMaterial color="white" transparent opacity={0.8} /> </mesh>
      <mesh position={[0.9, -0.2, 0]}> <sphereGeometry args={[0.7, 16, 16]} /> <meshStandardMaterial color="white" transparent opacity={0.8} /> </mesh>
      <mesh position={[-0.9, -0.1, 0.2]}> <sphereGeometry args={[0.8, 16, 16]} /> <meshStandardMaterial color="white" transparent opacity={0.8} /> </mesh>
    </group>
  );
};

const Hill: React.FC<{ position: [number, number, number]; scale: [number, number, number]; season: Season }> = ({ position, scale, season }) => {
  let color = "#98FB98";
  if (season === Season.AUTUMN) color = "#E6C288";
  if (season === Season.WINTER) color = "#E0FFFF";
  return (
    <mesh position={position} scale={scale} receiveShadow>
      <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={color} /> 
    </mesh>
  );
};

const Tree: React.FC<{ position: [number, number, number]; scale?: number; color?: string; season: Season }> = ({ position, scale = 1, color = "#228B22", season }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.15, 0.2, 1, 6]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
    <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={season === Season.WINTER ? 0.2 : 0} />
    </mesh>
  </group>
);

const StarterCabin: React.FC = () => (
  <group>
    <mesh position={[0, 0.75, 0]} castShadow receiveShadow><boxGeometry args={[2, 1.5, 2]} /><meshStandardMaterial color="#8B4513" /></mesh>
    <mesh position={[0, 2, 0]} rotation={[0, Math.PI/4, 0]} castShadow><coneGeometry args={[1.8, 1.5, 4]} /><meshStandardMaterial color="#5D4037" /></mesh>
    <mesh position={[0, 0.6, 1.01]}><boxGeometry args={[0.6, 1.2, 0.1]} /><meshStandardMaterial color="#2F1B10" /></mesh>
  </group>
);

const UpgradedFarmhouse: React.FC = () => (
  <group>
    <mesh position={[0, 1, 0]} castShadow receiveShadow><boxGeometry args={[3, 2, 2.5]} /><meshStandardMaterial color="#FDF5E6" /></mesh>
    <mesh position={[0, 2.5, 0]} castShadow><coneGeometry args={[2.5, 1.5, 4]} rotation={[0, Math.PI/4, 0]} /><meshStandardMaterial color="#B22222" /></mesh>
    <mesh position={[-1.5, 0.75, 0]} castShadow receiveShadow><boxGeometry args={[1.5, 1.5, 2]} /><meshStandardMaterial color="#FDF5E6" /></mesh>
    <mesh position={[-1.5, 1.8, 0]} castShadow><coneGeometry args={[1.5, 1, 4]} rotation={[0, Math.PI/4, 0]} /><meshStandardMaterial color="#8B0000" /></mesh>
    <mesh position={[0, 0.8, 1.26]}><boxGeometry args={[0.8, 1.6, 0.1]} /><meshStandardMaterial color="#8B4513" /></mesh>
  </group>
);

const WindmillDecor: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const bladesRef = useRef<Group>(null);
  useFrame(() => { if (bladesRef.current) bladesRef.current.rotation.z -= 0.02; });
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.8, 1.2, 3, 6]} /><meshStandardMaterial color="#F5F5DC" /></mesh>
      <mesh position={[0, 3, 0]} castShadow><coneGeometry args={[1, 1, 6]} /><meshStandardMaterial color="#A52A2A" /></mesh>
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

const WaterWheelDecor: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const wheelRef = useRef<Group>(null);
  useFrame(() => { if (wheelRef.current) wheelRef.current.rotation.x += 0.01; });
  return (
    <group position={position}>
       <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[2.5, 16]} /><meshStandardMaterial color="#4FC3F7" /></mesh>
       <mesh position={[-0.6, 1, 0]}><boxGeometry args={[0.2, 2, 0.2]} /><meshStandardMaterial color="#8B4513" /></mesh>
       <mesh position={[0.6, 1, 0]}><boxGeometry args={[0.2, 2, 0.2]} /><meshStandardMaterial color="#8B4513" /></mesh>
       <group ref={wheelRef} position={[0, 1.5, 0]}>
          <mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[1.5, 1.5, 0.5, 16]} /><meshStandardMaterial color="#CD853F" wireframe /></mesh>
          {[0, 45, 90, 135].map(deg => <mesh key={deg} rotation={[MathUtils.degToRad(deg), 0, 0]}><boxGeometry args={[0.2, 3, 0.4]} /><meshStandardMaterial color="#8B4513" /></mesh>)}
       </group>
    </group>
  );
};

const PlayerFarmBase: React.FC = () => {
  const { inventory } = useGameStore();
  const hasUpgradedHouse = inventory.includes(DecorationType.HOUSE);
  const hasWindmill = inventory.includes(DecorationType.WINDMILL);
  const hasWaterWheel = inventory.includes(DecorationType.WATER_WHEEL);

  return (
    <group 
        position={GAME_CONSTANTS.FARM_BASE_POSITION} 
        rotation={[0, Math.PI/4, 0]} 
        scale={[GAME_CONSTANTS.FARM_BASE_SCALE, GAME_CONSTANTS.FARM_BASE_SCALE, GAME_CONSTANTS.FARM_BASE_SCALE]}
    >
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
         <circleGeometry args={[6, 32]} />
         <meshStandardMaterial color="#7CB342" />
      </mesh>
      <group position={[0, 0, 0]}>{hasUpgradedHouse ? <UpgradedFarmhouse /> : <StarterCabin />}</group>
      {hasWindmill && <WindmillDecor position={[-4, 0, -1]} />}
      {hasWaterWheel && <WaterWheelDecor position={[4, 0, 1]} />}
    </group>
  );
};

export const EnvironmentDecor: React.FC = () => {
  const { currentLevel } = useGameStore();
  const config = LEVELS[currentLevel];
  const { season, gridBoundary } = config || { season: Season.SPRING, gridBoundary: 4 };

  // Memoized generations
  const trees = useMemo(() => {
    const items = [];
    const minRadius = gridBoundary + 4; 
    let treeColors = ["#228B22", "#006400", "#32CD32"];
    if (season === Season.AUTUMN) treeColors = ["#CD853F", "#D2691E", "#FF8C00"];
    if (season === Season.WINTER) treeColors = ["#FFFFFF", "#F0F8FF"];

    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2 + Math.random();
      const r = minRadius + Math.random() * 8;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      
      const distToFarm = Math.sqrt(Math.pow(x - GAME_CONSTANTS.FARM_BASE_POSITION[0], 2) + Math.pow(z - GAME_CONSTANTS.FARM_BASE_POSITION[2], 2));
      if (distToFarm < 5) continue;

      items.push(<Tree key={`t-${i}`} position={[x, 0, z]} scale={0.6 + Math.random()} color={treeColors[i % 3]} season={season} />);
    }
    return items;
  }, [season, gridBoundary]);

  const hills = useMemo(() => {
    const items = [];
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.random();
        const x = Math.cos(angle) * 18;
        const z = Math.sin(angle) * 18;
        const distToFarm = Math.sqrt(Math.pow(x - GAME_CONSTANTS.FARM_BASE_POSITION[0], 2) + Math.pow(z - GAME_CONSTANTS.FARM_BASE_POSITION[2], 2));
        if (distToFarm < 6) continue;
        items.push(<Hill key={`h-${i}`} position={[x, -0.5, z]} scale={[3+Math.random()*4, 1+Math.random()*2, 3+Math.random()*4]} season={season} />)
    }
    return items;
  }, [season]);

  const clouds = useMemo(() => [
        <Cloud key="c1" position={[-16, 14, -16]} scale={3} swayOffset={0} />,
        <Cloud key="c2" position={[16, 12, 16]} scale={2.5} swayOffset={2.5} />,
  ], []);

  const roadSize = (gridBoundary * 2) + 2;

  return (
    <group>
      {trees}
      {hills}
      {clouds}
      <PlayerFarmBase />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[roadSize + 3, roadSize + 3]} />
        <meshStandardMaterial color="#808080" /> 
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[roadSize, roadSize]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    </group>
  );
};