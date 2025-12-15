import React from 'react';
import { GrowthStage } from '../types';

interface CropProps {
  stage: GrowthStage;
}

// Low-poly procedural crops optimized for performance and clarity
export const Crop: React.FC<CropProps> = ({ stage }) => {
  if (stage === GrowthStage.DIRT) return null;

  return (
    <group position={[0, 0.1, 0]}>
      {/* SEEDLING: Small Green Sprout */}
      {stage === GrowthStage.SEEDLING && (
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          <meshStandardMaterial color="#90EE90" />
        </mesh>
      )}

      {/* SAPLING: Taller with small leaves */}
      {stage === GrowthStage.SAPLING && (
        <group>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          {/* Leaves */}
          <mesh position={[0.2, 0.6, 0]} rotation={[0, 0, -0.5]}>
            <capsuleGeometry args={[0.05, 0.3, 4]} />
            <meshStandardMaterial color="#32CD32" />
          </mesh>
          <mesh position={[-0.2, 0.5, 0]} rotation={[0, 0, 0.5]}>
            <capsuleGeometry args={[0.05, 0.3, 4]} />
            <meshStandardMaterial color="#32CD32" />
          </mesh>
        </group>
      )}

      {/* MATURE: Full plant with "Fruit" */}
      {stage === GrowthStage.MATURE && (
        <group>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
            <meshStandardMaterial color="#006400" />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 0.8, 0]}>
            <dodecahedronGeometry args={[0.4]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          {/* Fruit (Bright Red for contrast) */}
          <mesh position={[0.2, 0.9, 0.2]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#FF4500" emissive="#FF0000" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[-0.2, 0.7, -0.1]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#FF4500" emissive="#FF0000" emissiveIntensity={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
};