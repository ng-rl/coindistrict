import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { BuildingPlot } from './BuildingPlot';
import { useMemo, useRef, useEffect } from 'react';
import { createBuildingMaterials } from './materials';
import * as THREE from 'three';

export function CityScene() {
  const materials = useMemo(() => createBuildingMaterials(), []);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 20, -300);
    }
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      zIndex: 0,
      background: 'linear-gradient(180deg, #020208 0%, #0a0a18 30%, #12122a 60%, #0a0a15 100%)'
    }}>
      <Canvas>
        <PerspectiveCamera 
          ref={cameraRef}
          makeDefault 
          position={[0, 35, 420]} 
          fov={65}
        />
        
        <ambientLight intensity={0.2} color="#2a2a66" />
        <directionalLight 
          position={[-40, 100, 50]} 
          intensity={0.3} 
          color="#4a4a99"
        />
        <hemisphereLight 
          color="#3a3a88"
          groundColor="#0a0a1a"
          intensity={0.25}
        />
        
        <fog attach="fog" args={['#020208', 300, 900]} />
        
        <BuildingPlot materials={materials} position={[0, 0, 0]} />
        <BuildingPlot materials={materials} position={[0, 0, -700]} />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[3000, 3000]} />
          <meshPhongMaterial 
            color="#0d0d12" 
            shininess={10}
            emissive="#050508"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
