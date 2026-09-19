import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BuildingPlotProps {
  materials: {
    building1: THREE.Material;
    building2: THREE.Material;
    building3: THREE.Material;
    windowPane: THREE.Material;
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
  const windowPanesRef = useRef<THREE.InstancedMesh>(null);
  const roadRef = useRef<THREE.InstancedMesh>(null);
  const streetlightRef = useRef<THREE.InstancedMesh>(null);
  const streetlightPoleRef = useRef<THREE.InstancedMesh>(null);

  const buildingData = useMemo(() => {
    const data = {
      buildings1: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      buildings2: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      buildings3: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      windowPanes: [] as Array<{ pos: [number, number, number]; scale: [number, number, number] }>,
      roads: [] as Array<{ pos: [number, number, number] }>,
      streetlights: [] as Array<{ pos: [number, number, number] }>,
      streetlightPoles: [] as Array<{ pos: [number, number, number] }>,
    };

    const gridSizeX = 16;
    const gridSizeZ = 11;
    const startX = -400;
    const startZ = 200;

    for (let z = 0; z < gridSizeZ; z++) {
      let x = startX;
      for (let i = 0; i < gridSizeX; i++) {
        if (Math.random() > 0.15) {
          const height = 40 + Math.random() * 140;
          const width = 18 + Math.random() * 20;
          const depth = 18 + Math.random() * 20;
          
          const posX = x;
          const posY = height / 2;
          const posZ = startZ - z * 55;
          
          const buildingType = Math.floor(Math.random() * 3);
          const targetArray = buildingType === 0 ? data.buildings1 
                            : buildingType === 1 ? data.buildings2 
                            : data.buildings3;
          
          targetArray.push({
            pos: [posX, posY, posZ],
            scale: [width, height, depth]
          });

          const floorsY = Math.floor(height / 4);
          const windowsX = Math.floor(width / 3.5);
          const windowsZ = Math.floor(depth / 3.5);
          
          for (let fy = 1; fy < floorsY; fy++) {
            for (let wx = 0; wx < windowsX; wx++) {
              for (let wz = 0; wz < windowsZ; wz++) {
                if (Math.random() > 0.2) {
                  const windowX = posX - width/2 + (wx + 0.5) * (width / windowsX);
                  const windowY = posY - height/2 + (fy + 0.5) * (height / floorsY);
                  const windowZ = posZ - depth/2 + (wz + 0.5) * (depth / windowsZ);
                  
                  data.windowPanes.push({
                    pos: [windowX, windowY, windowZ],
                    scale: [1.5, 2.5, 1.5]
                  });
                }
              }
            }
          }
        }
        
        x += 55 + Math.random() * 20;
      }
    }

    for (let i = 0; i < 20; i++) {
      data.roads.push({
        pos: [0, 0, -50 - i * 55]
      });
      
      data.streetlightPoles.push({
        pos: [-480, 8, -50 - i * 55]
      });
      data.streetlightPoles.push({
        pos: [480, 8, -50 - i * 55]
      });
      
      data.streetlights.push({
        pos: [-480, 16, -50 - i * 55]
      });
      data.streetlights.push({
        pos: [480, 16, -50 - i * 55]
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

    if (windowPanesRef.current) {
      buildingData.windowPanes.forEach((pane, i) => {
        dummy.position.set(...pane.pos);
        dummy.scale.set(...pane.scale);
        dummy.updateMatrix();
        windowPanesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      windowPanesRef.current.instanceMatrix.needsUpdate = true;
    }

    if (roadRef.current) {
      buildingData.roads.forEach((road, i) => {
        dummy.position.set(...road.pos);
        dummy.scale.set(1000, 55, 1);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.updateMatrix();
        roadRef.current!.setMatrixAt(i, dummy.matrix);
      });
      roadRef.current.instanceMatrix.needsUpdate = true;
    }

    if (streetlightPoleRef.current) {
      buildingData.streetlightPoles.forEach((pole, i) => {
        dummy.position.set(...pole.pos);
        dummy.scale.set(1.5, 16, 1.5);
        dummy.updateMatrix();
        streetlightPoleRef.current!.setMatrixAt(i, dummy.matrix);
      });
      streetlightPoleRef.current.instanceMatrix.needsUpdate = true;
    }

    if (streetlightRef.current) {
      buildingData.streetlights.forEach((light, i) => {
        dummy.position.set(...light.pos);
        dummy.scale.set(4, 4, 4);
        dummy.updateMatrix();
        streetlightRef.current!.setMatrixAt(i, dummy.matrix);
      });
      streetlightRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [buildingData]);

  useFrame(({ camera }) => {
    if (groupRef.current && camera.position.z < groupRef.current.position.z - 400) {
      groupRef.current.position.z -= 1100;
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
        ref={windowPanesRef}
        args={[materials.boxGeo, materials.windowPane, buildingData.windowPanes.length]}
      />
      <instancedMesh
        ref={roadRef}
        args={[materials.planeGeo, materials.road, buildingData.roads.length]}
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
          intensity={120}
          distance={80}
          color="#ffdd66"
          castShadow={false}
        />
      ))}
    </group>
  );
}
