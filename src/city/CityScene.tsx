import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { BuildingPlot } from './BuildingPlot';
import { useMemo } from 'react';
import * as THREE from 'three';

export function CityScene() {
  const materials = useMemo(() => {
    const createBuildingMaterial = (color: string, emissiveIntensity: number = 0.3) => {
      return new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity,
        roughness: 0.7,
        metalness: 0.3,
      });
    };

    return {
      building1: createBuildingMaterial('#1a1a2e', 0.4),
      building2: createBuildingMaterial('#16213e', 0.35),
      building3: createBuildingMaterial('#0f3460', 0.3),
      windows: createBuildingMaterial('#4a90e2', 0.6),
      road: new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 }),
      sidewalk: new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.8 }),
      streetlight: new THREE.MeshStandardMaterial({ 
        color: '#ffcc00', 
        emissive: '#ffcc00',
        emissiveIntensity: 0.8 
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
      background: 'linear-gradient(180deg, #0a0a1e 0%, #1a1a3e 50%, #0f0f2e 100%)'
    }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 100, 300]} fov={75} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={50}
          maxDistance={500}
          maxPolarAngle={Math.PI / 2}
        />
        
        <ambientLight intensity={0.3} color="#4040ff" />
        <directionalLight position={[10, 50, 10]} intensity={0.5} color="#8080ff" />
        <pointLight position={[0, 100, 0]} intensity={0.4} color="#6060ff" />
        
        <fog attach="fog" args={['#0a0a1e', 200, 800]} />
        
        <BuildingPlot materials={materials} position={[0, 0, 0]} />
        <BuildingPlot materials={materials} position={[0, 0, -500]} />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[2000, 2000]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      </Canvas>
    </div>
  );
}
