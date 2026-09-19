import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BuildingPlotProps {
  materials: {
    building1: THREE.Material;
    building2: THREE.Material;
    building3: THREE.Material;
    windows: THREE.Material;
    road: THREE.Material;
    sidewalk: THREE.Material;
    streetlight: THREE.Material;
    boxGeo: THREE.BoxGeometry;
    planeGeo: THREE.PlaneGeometry;
  };
  position: [number, number, number];
}

export function BuildingPlot({ materials, position }: BuildingPlotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const building1Ref = useRef<THREE.InstancedMesh>(null);
  const building2Ref = useRef<THREE.InstancedMesh>(null);
  const building3Ref = useRef<THREE.InstancedMesh>(null);
  const windowsRef = useRef<THREE.InstancedMesh>(null);
  const roadRef = useRef<THREE.InstancedMesh>(null);
  const streetlightRef = useRef<THREE.InstancedMesh>(null);

  const buildingData = useMemo(() => {
    const data = {
      buildings1: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      buildings2: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      buildings3: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      windows: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      roads: [] as Array<{ pos: [number, number, number] }>,
      streetlights: [] as Array<{ pos: [number, number, number] }>,
    };

    const gridSizeX = 16;
    const gridSizeZ = 11;
    const startX = -400;
    const startZ = 200;

    for (let z = 0; z < gridSizeZ; z++) {
      let x = startX;
      for (let i = 0; i < gridSizeX; i++) {
        if (Math.random() > 0.2) {
          const height = 30 + Math.random() * 120;
          const width = 15 + Math.random() * 15;
          const depth = 15 + Math.random() * 15;
          
          const posX = x;
          const posY = height / 2;
          const posZ = startZ - z * 50;
          
          const buildingType = Math.floor(Math.random() * 3);
          const targetArray = buildingType === 0 ? data.buildings1 
                            : buildingType === 1 ? data.buildings2 
                            : data.buildings3;
          
          targetArray.push({
            pos: [posX, posY, posZ],
            scale: [width, height, depth]
          });

          const windowHeight = height * 0.85;
          const windowScale = width * 0.9;
          data.windows.push({
            pos: [posX, posY + height * 0.05, posZ],
            scale: [windowScale, windowHeight, depth + 0.5]
          });
        }
        
        x += 50 + Math.random() * 20;
      }
    }

    for (let i = 0; i < 20; i++) {
      data.roads.push({
        pos: [0, 0, -50 - i * 50]
      });
      
      data.streetlights.push({
        pos: [-450, 3, -50 - i * 50]
      });
      data.streetlights.push({
        pos: [450, 3, -50 - i * 50]
      });
    }

    return data;
  }, []);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    
    if (building1Ref.current) {
      buildingData.buildings1.forEach((building, i) => {
        dummy.position.set(...building.pos);
        dummy.scale.set(...building.scale);
        dummy.updateMatrix();
        building1Ref.current!.setMatrixAt(i, dummy.matrix);
      });
      building1Ref.current.instanceMatrix.needsUpdate = true;
    }

    if (building2Ref.current) {
      buildingData.buildings2.forEach((building, i) => {
        dummy.position.set(...building.pos);
        dummy.scale.set(...building.scale);
        dummy.updateMatrix();
        building2Ref.current!.setMatrixAt(i, dummy.matrix);
      });
      building2Ref.current.instanceMatrix.needsUpdate = true;
    }

    if (building3Ref.current) {
      buildingData.buildings3.forEach((building, i) => {
        dummy.position.set(...building.pos);
        dummy.scale.set(...building.scale);
        dummy.updateMatrix();
        building3Ref.current!.setMatrixAt(i, dummy.matrix);
      });
      building3Ref.current.instanceMatrix.needsUpdate = true;
    }

    if (windowsRef.current) {
      buildingData.windows.forEach((window, i) => {
        dummy.position.set(...window.pos);
        dummy.scale.set(...window.scale);
        dummy.updateMatrix();
        windowsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      windowsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (roadRef.current) {
      buildingData.roads.forEach((road, i) => {
        dummy.position.set(...road.pos);
        dummy.scale.set(900, 50, 1);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.updateMatrix();
        roadRef.current!.setMatrixAt(i, dummy.matrix);
      });
      roadRef.current.instanceMatrix.needsUpdate = true;
    }

    if (streetlightRef.current) {
      buildingData.streetlights.forEach((light, i) => {
        dummy.position.set(...light.pos);
        dummy.scale.set(2, 15, 2);
        dummy.updateMatrix();
        streetlightRef.current!.setMatrixAt(i, dummy.matrix);
      });
      streetlightRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [buildingData]);

  useFrame(({ camera }) => {
    if (groupRef.current && camera.position.z < groupRef.current.position.z - 400) {
      groupRef.current.position.z -= 1000;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <instancedMesh
        ref={building1Ref}
        args={[materials.boxGeo, materials.building1, buildingData.buildings1.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={building2Ref}
        args={[materials.boxGeo, materials.building2, buildingData.buildings2.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={building3Ref}
        args={[materials.boxGeo, materials.building3, buildingData.buildings3.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={windowsRef}
        args={[materials.boxGeo, materials.windows, buildingData.windows.length]}
      />
      <instancedMesh
        ref={roadRef}
        args={[materials.planeGeo, materials.road, buildingData.roads.length]}
        receiveShadow
      />
      <instancedMesh
        ref={streetlightRef}
        args={[materials.boxGeo, materials.streetlight, buildingData.streetlights.length]}
      />
    </group>
  );
}
