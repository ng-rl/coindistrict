import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { BuildingPlot } from './BuildingPlot';
import { useMemo } from 'react';
import { createBuildingMaterials } from './materials';

export function CityScene() {
  const materials = useMemo(() => createBuildingMaterials(), []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      zIndex: 0,
      background: 'linear-gradient(180deg, #050510 0%, #0f0f1e 30%, #1a1a2e 60%, #0a0a15 100%)'
    }}>
      <Canvas>
        <PerspectiveCamera 
          makeDefault 
          position={[0, 25, 150]} 
          fov={70}
          rotation={[-0.12, 0, 0]}
        />
        
        <ambientLight intensity={0.15} color="#2a2a66" />
        <directionalLight 
          position={[-30, 80, 40]} 
          intensity={0.25} 
          color="#4a4a99"
        />
        <hemisphereLight 
          color="#3a3a88"
          groundColor="#0a0a1a"
          intensity={0.2}
        />
        
        <fog attach="fog" args={['#050510', 200, 700]} />
        
        <BuildingPlot materials={materials} position={[0, 0, 0]} />
        <BuildingPlot materials={materials} position={[0, 0, -600]} />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[2600, 2600]} />
          <meshStandardMaterial 
            color="#0a0a12" 
            roughness={0.98}
            emissive="#050508"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
