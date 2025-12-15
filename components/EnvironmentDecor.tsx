import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { Mesh, Group } from 'three';
import { Season, LevelConfig } from '../types';

// Need access to LEVEL_CONFIGS logic or pass season in props.
// Since store.ts doesn't export the object directly for consumption here easily without duplicating,
// We will look up season based on currentLevel from a small local helper or hardcoded map matching store.
const getLevelInfo = (level: number) => {
  if (level === 2) return { season: Season.AUTUMN, boundary: 5 };
  if (level === 3) return { season: Season.WINTER, boundary: 6 };
  return { season: Season.SPRING, boundary: 4 };
};

// --- TREE COMPONENT ---
interface TreeProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
  season: Season;
}

const Tree: React.FC<TreeProps> = ({ position, scale = 1, color = "#228B22", season }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.2, 1, 6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Leaves - Layer 1 */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Leaves - Layer 2 */}
      <mesh position={[0, 1.8, 0]} scale={[0.8, 0.8, 0.8]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={season === Season.WINTER ? 0.2 : 0.05} />
      </mesh>
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

// --- BIRD COMPONENT ---
interface BirdProps {
  startPosition: [number, number, number];
  speed?: number;
  offset?: number;
}

const Bird: React.FC<BirdProps> = ({ startPosition, speed = 2, offset = 0 }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime + offset;
      
      const radius = 12;
      groupRef.current.position.x = Math.sin(time * speed * 0.1) * radius;
      groupRef.current.position.z = Math.cos(time * speed * 0.1) * (radius - 5);
      groupRef.current.position.y = startPosition[1] + Math.sin(time * 2) * 0.5;
      
      groupRef.current.rotation.y = time * speed * 0.1 + Math.PI;
      groupRef.current.rotation.z = Math.sin(time * 3) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={startPosition}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.5, 4]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.2]} />
        <meshStandardMaterial color="#EEE" />
      </mesh>
    </group>
  );
};

// --- RABBIT COMPONENT ---
interface RabbitProps {
  startPosition: [number, number, number];
  jumpOffset?: number;
}

const Rabbit: React.FC<RabbitProps> = ({ startPosition, jumpOffset = 0 }) => {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime + jumpOffset;
      // Jumping motion
      const jumpHeight = Math.abs(Math.sin(t * 3));
      groupRef.current.position.y = jumpHeight * 0.5;
      
      // Moving in a small circle around start position
      groupRef.current.position.x = startPosition[0] + Math.cos(t * 0.5) * 2;
      groupRef.current.position.z = startPosition[2] + Math.sin(t * 0.5) * 2;
      
      // Face movement direction roughly
      groupRef.current.rotation.y = -t * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={startPosition}>
      {/* Body */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Head */}
      <mesh position={[0.12, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Ears */}
      <mesh position={[0.15, 0.4, 0.05]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.03, 0.2, 4]} />
        <meshStandardMaterial color="pink" />
      </mesh>
      <mesh position={[0.15, 0.4, -0.05]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.03, 0.2, 4]} />
        <meshStandardMaterial color="pink" />
      </mesh>
    </group>
  );
};

// --- HOUSE COMPONENT ---
interface FarmHouseProps {
  position: [number, number, number];
  rotationY?: number;
  color?: string;
  roofColor?: string;
}

const FarmHouse: React.FC<FarmHouseProps> = ({ position, rotationY = 0, color = "#F5DEB3", roofColor = "#A52A2A" }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main Body */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.5, 1.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 1.5 + 0.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.6, 1.2, 4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.6, 0.76]} castShadow>
        <boxGeometry args={[0.5, 1, 0.1]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>

      {/* Window */}
      <mesh position={[0.5, 0.8, 0.76]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
      
      {/* Chimney */}
      <mesh position={[0.5, 2, 0.5]} castShadow>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
    </group>
  );
};

export const EnvironmentDecor: React.FC = () => {
  const { currentLevel } = useGameStore();
  const { season, boundary } = getLevelInfo(currentLevel);

  // Generate trees around the farm with varied colors
  const trees = useMemo(() => {
    const items = [];
    const count = 20;
    // Calculate radius based on the boundary to ensure they are outside the play area
    const minRadius = boundary + 3; 
    const maxRadius = minRadius + 8;
    
    // Define palette based on season
    let treeColors = ["#228B22", "#006400", "#32CD32", "#6B8E23"]; // Spring default
    if (season === Season.AUTUMN) {
      treeColors = ["#CD853F", "#D2691E", "#FF8C00", "#8B4513", "#DAA520", "#9ACD32"]; // Orange, Brown, Gold, YellowGreen
    } else if (season === Season.WINTER) {
      treeColors = ["#FFFFFF", "#F0F8FF", "#E0FFFF", "#F5FFFA"]; // White, AliceBlue, LightCyan
    }

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.5);
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Varied Scale
      const scale = 0.6 + Math.random() * 0.9; 
      
      const color = treeColors[Math.floor(Math.random() * treeColors.length)];
      
      items.push(<Tree key={`tree-${i}`} position={[x, 0, z]} scale={scale} color={color} season={season} />);
    }
    return items;
  }, [season, boundary]);

  // Generate hills around the periphery
  const hills = useMemo(() => {
    const items = [];
    const count = 10;
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

  // Generate rabbits
  const rabbits = useMemo(() => {
    return [
      <Rabbit key="r1" startPosition={[-7, 0, 7]} jumpOffset={0} />,
      <Rabbit key="r2" startPosition={[8, 0, 5]} jumpOffset={1.5} />,
      <Rabbit key="r3" startPosition={[-5, 0, -8]} jumpOffset={2.7} />,
    ];
  }, []);


  // Calculate road size
  // Farm boundary dictates the range (e.g. 4 means -4 to 4).
  // Total width of farm area is (boundary * 2) + 1 (for 0). 
  // Add some padding for the road.
  const innerSize = (boundary * 2) + 2; 
  const outerSize = innerSize + 3; // 1.5 unit wide road

  return (
    <group>
      {/* Trees */}
      {trees}

      {/* Hills */}
      {hills}

      {/* Rabbits */}
      {rabbits}

      {/* Farm Houses */}
      <FarmHouse position={[-9, 0, -9]} rotationY={Math.PI / 4} />
      <FarmHouse position={[10, 0, -3]} rotationY={-Math.PI / 6} color="#8B0000" roofColor="#333" />
      <FarmHouse position={[-5, 0, 10]} rotationY={Math.PI / 3} />

      {/* Birds */}
      <Bird startPosition={[0, 6, 0]} speed={1.5} offset={0} />
      <Bird startPosition={[5, 7, 5]} speed={1.2} offset={123} />
      <Bird startPosition={[-5, 5.5, -5]} speed={1.8} offset={456} />

      {/* Road / Path */}
      {/* A plane slightly lower than the farm tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[outerSize, outerSize]} />
        <meshStandardMaterial color="#808080" /> {/* Grey Road */}
      </mesh>
      
      {/* Darker patch directly under farm, slightly larger than grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[innerSize - 1, innerSize - 1]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    </group>
  );
};