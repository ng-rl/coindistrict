import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { BuildingPlot } from './BuildingPlot';
import { useMemo } from 'react';
import * as THREE from 'three';

export function CityScene() {
  const materials = useMemo(() => {
    const createBuildingMaterial = (color: string, emissiveIntensity: number = 0.15) => {
      return new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity,
        roughness: 0.8,
        metalness: 0.2,
      });
    };

    return {
      building1: createBuildingMaterial('#1a1a2e', 0.1),
      building2: createBuildingMaterial('#16213e', 0.12),
      building3: createBuildingMaterial('#0f3460', 0.08),
      windowPane: new THREE.MeshStandardMaterial({
        color: '#ffd966',
        emissive: '#ffd966',
        emissiveIntensity: 0.9,
        roughness: 0.3,
        metalness: 0.1,
      }),
      road: new THREE.MeshStandardMaterial({ 
        color: '#1a1a1a', 
        roughness: 0.95,
        metalness: 0.05,
      }),
      sidewalk: new THREE.MeshStandardMaterial({ 
        color: '#2a2a2a', 
        roughness: 0.9 
      }),
      streetlight: new THREE.MeshStandardMaterial({ 
        color: '#ffeeaa', 
        emissive: '#ffeeaa',
        emissiveIntensity: 1.2,
        roughness: 0.1,
        metalness: 0.3,
      }),
      boxGeo: new THREE.BoxGeometry(1, 1, 1),
      planeGeo: new THREE.PlaneGeometry(1, 1),
    };
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      zIndex: 0,
      background: 'linear-gradient(180deg, #0a0a1e 0%, #1a1a3e 40%, #0f0f2e 100%)'
    }}>
      <Canvas shadows>
        <PerspectiveCamera 
          makeDefault 
          position={[0, 18, 120]} 
          fov={75}
          rotation={[-0.1, 0, 0]}
        />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={30}
          maxDistance={400}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={0}
          target={[0, 10, 0]}
        />
        
        <ambientLight intensity={0.25} color="#3030aa" />
        <directionalLight 
          position={[-20, 60, 30]} 
          intensity={0.35} 
          color="#6060dd"
          castShadow
        />
        <hemisphereLight 
          color="#4040bb"
          groundColor="#1a1a3e"
          intensity={0.3}
        />
        
        <fog attach="fog" args={['#0a0a1e', 150, 600]} />
        
        <BuildingPlot materials={materials} position={[0, 0, 0]} />
        <BuildingPlot materials={materials} position={[0, 0, -550]} />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[2400, 2400]} />
          <meshStandardMaterial 
            color="#0d0d1a" 
            roughness={0.95}
            emissive="#0a0a12"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
