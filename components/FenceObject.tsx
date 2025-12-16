import React from 'react';

// A simple wooden fence that surrounds a tile visually
export const FenceObject: React.FC = () => {
  return (
    <group>
      {/* 4 Corner Posts */}
      <mesh position={[0.4, 0.3, 0.4]} castShadow><boxGeometry args={[0.1, 0.6, 0.1]} /><meshStandardMaterial color="#8D6E63" /></mesh>
      <mesh position={[-0.4, 0.3, 0.4]} castShadow><boxGeometry args={[0.1, 0.6, 0.1]} /><meshStandardMaterial color="#8D6E63" /></mesh>
      <mesh position={[0.4, 0.3, -0.4]} castShadow><boxGeometry args={[0.1, 0.6, 0.1]} /><meshStandardMaterial color="#8D6E63" /></mesh>
      <mesh position={[-0.4, 0.3, -0.4]} castShadow><boxGeometry args={[0.1, 0.6, 0.1]} /><meshStandardMaterial color="#8D6E63" /></mesh>

      {/* Cross Rails */}
      <mesh position={[0, 0.4, 0.4]}><boxGeometry args={[0.9, 0.05, 0.05]} /><meshStandardMaterial color="#A1887F" /></mesh>
      <mesh position={[0, 0.2, 0.4]}><boxGeometry args={[0.9, 0.05, 0.05]} /><meshStandardMaterial color="#A1887F" /></mesh>

      <mesh position={[0, 0.4, -0.4]}><boxGeometry args={[0.9, 0.05, 0.05]} /><meshStandardMaterial color="#A1887F" /></mesh>
      <mesh position={[0, 0.2, -0.4]}><boxGeometry args={[0.9, 0.05, 0.05]} /><meshStandardMaterial color="#A1887F" /></mesh>

      <mesh position={[0.4, 0.4, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[0.9, 0.05, 0.05]} /><meshStandardMaterial color="#A1887F" /></mesh>
      <mesh position={[0.4, 0.2, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[0.9, 0.05, 0.05]} /><meshStandardMaterial color="#A1887F" /></mesh>

      <mesh position={[-0.4, 0.4, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[0.9, 0.05, 0.05]} /><meshStandardMaterial color="#A1887F" /></mesh>
      <mesh position={[-0.4, 0.2, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[0.9, 0.05, 0.05]} /><meshStandardMaterial color="#A1887F" /></mesh>
      
      {/* Magic Shield Effect */}
      <mesh position={[0, 0.3, 0]}>
         <boxGeometry args={[0.85, 0.6, 0.85]} />
         <meshStandardMaterial color="#4FC3F7" transparent opacity={0.2} emissive="#4FC3F7" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};