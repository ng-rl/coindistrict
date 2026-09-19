import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BuildingPlotProps {
  materials: {
    building1: THREE.Material;
    building2: THREE.Material;
    building3: THREE.Material;
    roof: THREE.Material;
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
  const roadRef = useRef<THREE.InstancedMesh>(null);
  const sidewalkRef = useRef<THREE.InstancedMesh>(null);
  const streetlightRef = useRef<THREE.InstancedMesh>(null);
  const streetlightPoleRef = useRef<THREE.InstancedMesh>(null);

  const buildingData = useMemo(() => {
    const data = {
      buildings1: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      buildings2: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      buildings3: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      roads: [] as Array<{ pos: [number, number, number] }>,
      sidewalks: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      streetlights: [] as Array<{ pos: [number, number, number] }>,
      streetlightPoles: [] as Array<{ pos: [number, number, number] }>,
    };

    const gridSizeX = 20;
    const gridSizeZ = 15;
    const startX = -500;
    const startZ = -100;

    for (let z = 0; z < gridSizeZ; z++) {
      let x = startX;
      for (let i = 0; i < gridSizeX; i++) {
        if (Math.random() > 0.1) {
          const height = 80 + Math.random() * 200;
          const width = 30 + Math.random() * 30;
          const depth = 30 + Math.random() * 30;
          
          const posX = x;
          const posY = height / 2;
          const posZ = startZ - z * 70;
          
          const buildingType = Math.floor(Math.random() * 3);
          const targetArray = buildingType === 0 ? data.buildings1 
                            : buildingType === 1 ? data.buildings2 
                            : data.buildings3;
          
          targetArray.push({
            pos: [posX, posY, posZ],
            scale: [width, height, depth]
          });
        }
        
        x += 50 + Math.random() * 30;
      }
    }

    for (let i = 0; i < 30; i++) {
      const z = -50 - i * 70;
      data.roads.push({
        pos: [0, 0.2, z]
      });
      
      data.sidewalks.push({
        pos: [-280, 0.3, z],
        scale: [40, 1, 68]
      });
      data.sidewalks.push({
        pos: [280, 0.3, z],
        scale: [40, 1, 68]
      });
      
      data.streetlightPoles.push({
        pos: [-260, 12, z - 10]
      });
      data.streetlightPoles.push({
        pos: [260, 12, z - 10]
      });
      
      data.streetlights.push({
        pos: [-260, 24, z - 10]
      });
      data.streetlights.push({
        pos: [260, 24, z - 10]
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

    if (roadRef.current) {
      buildingData.roads.forEach((road, i) => {
        dummy.position.set(...road.pos);
        dummy.scale.set(600, 70, 1);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.updateMatrix();
        roadRef.current!.setMatrixAt(i, dummy.matrix);
      });
      roadRef.current.instanceMatrix.needsUpdate = true;
    }

    if (sidewalkRef.current) {
      buildingData.sidewalks.forEach((sidewalk, i) => {
        dummy.position.set(...sidewalk.pos);
        dummy.scale.set(...sidewalk.scale);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.updateMatrix();
        sidewalkRef.current!.setMatrixAt(i, dummy.matrix);
      });
      sidewalkRef.current.instanceMatrix.needsUpdate = true;
    }

    if (streetlightPoleRef.current) {
      buildingData.streetlightPoles.forEach((pole, i) => {
        dummy.position.set(...pole.pos);
        dummy.scale.set(2.5, 24, 2.5);
        dummy.updateMatrix();
        streetlightPoleRef.current!.setMatrixAt(i, dummy.matrix);
      });
      streetlightPoleRef.current.instanceMatrix.needsUpdate = true;
    }

    if (streetlightRef.current) {
      buildingData.streetlights.forEach((light, i) => {
        dummy.position.set(...light.pos);
        dummy.scale.set(8, 8, 8);
        dummy.updateMatrix();
        streetlightRef.current!.setMatrixAt(i, dummy.matrix);
      });
      streetlightRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [buildingData]);

  useFrame(({ camera }) => {
    if (groupRef.current && camera.position.z < groupRef.current.position.z - 600) {
      groupRef.current.position.z -= 1400;
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
        ref={roadRef}
        args={[materials.planeGeo, materials.road, buildingData.roads.length]}
        receiveShadow
      />
      <instancedMesh
        ref={sidewalkRef}
        args={[materials.planeGeo, materials.sidewalk, buildingData.sidewalks.length]}
        receiveShadow
      />
      <instancedMesh
        ref={streetlightPoleRef}
        args={[materials.boxGeo, materials.sidewalk, buildingData.streetlightPoles.length]}
      />
      <instancedMesh
        ref={streetlightRef}
        args={[materials.boxGeo, materials.streetlight, buildingData.streetlights.length]}
      />
      
      {buildingData.streetlights.map((light, i) => (
        <pointLight
          key={i}
          position={light.pos}
          intensity={200}
          distance={120}
          color="#ffdd88"
          decay={2}
        />
      ))}
    </group>
  );
}
