import * as THREE from 'three';

function createWindowTexture(windowsX: number, windowsY: number, litProbability: number = 0.8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#0a0a15';
  ctx.fillRect(0, 0, size, size);
  
  const windowWidth = size / windowsX;
  const windowHeight = size / windowsY;
  
  for (let y = 0; y < windowsY; y++) {
    for (let x = 0; x < windowsX; x++) {
      const wx = x * windowWidth;
      const wy = y * windowHeight;
      
      const isLit = Math.random() < litProbability;
      
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(wx + 2, wy + 2, windowWidth - 4, windowHeight - 4);
      
      if (isLit) {
        ctx.fillStyle = '#ffd966';
        ctx.fillRect(wx + 4, wy + 4, windowWidth - 8, windowHeight - 8);
      } else {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(wx + 4, wy + 4, windowWidth - 8, windowHeight - 8);
      }
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  
  return texture;
}

function createWindowEmissiveMap(windowsX: number, windowsY: number, litProbability: number = 0.8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);
  
  const windowWidth = size / windowsX;
  const windowHeight = size / windowsY;
  
  for (let y = 0; y < windowsY; y++) {
    for (let x = 0; x < windowsX; x++) {
      const wx = x * windowWidth;
      const wy = y * windowHeight;
      
      const isLit = Math.random() < litProbability;
      
      if (isLit) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(wx + 4, wy + 4, windowWidth - 8, windowHeight - 8);
      }
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  
  return texture;
}

export function createBuildingMaterials() {
  const windowTexture1 = createWindowTexture(4, 8, 0.85);
  const windowEmissive1 = createWindowEmissiveMap(4, 8, 0.85);
  
  const windowTexture2 = createWindowTexture(5, 10, 0.75);
  const windowEmissive2 = createWindowEmissiveMap(5, 10, 0.75);
  
  const windowTexture3 = createWindowTexture(3, 6, 0.9);
  const windowEmissive3 = createWindowEmissiveMap(3, 6, 0.9);
  
  const building1 = new THREE.MeshPhongMaterial({
    map: windowTexture1,
    emissiveMap: windowEmissive1,
    emissive: new THREE.Color('#ffd966'),
    emissiveIntensity: 1.2,
    shininess: 100,
    side: THREE.FrontSide,
  });
  
  const building2 = new THREE.MeshPhongMaterial({
    map: windowTexture2,
    emissiveMap: windowEmissive2,
    emissive: new THREE.Color('#ffe680'),
    emissiveIntensity: 1.0,
    shininess: 100,
    side: THREE.FrontSide,
  });
  
  const building3 = new THREE.MeshPhongMaterial({
    map: windowTexture3,
    emissiveMap: windowEmissive3,
    emissive: new THREE.Color('#ffd966'),
    emissiveIntensity: 1.5,
    shininess: 100,
    side: THREE.FrontSide,
  });
  
  const roof = new THREE.MeshPhongMaterial({
    color: '#0a0a15',
    shininess: 50,
  });
  
  const road = new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.95,
    metalness: 0.05,
  });
  
  const sidewalk = new THREE.MeshStandardMaterial({
    color: '#2a2a2a',
    roughness: 0.9,
  });
  
  const streetlight = new THREE.MeshStandardMaterial({
    color: '#ffeeaa',
    emissive: '#ffeeaa',
    emissiveIntensity: 1.5,
    roughness: 0.1,
    metalness: 0.3,
  });
  
  return {
    building1: [building1, building1, roof, building1, building1, building1],
    building2: [building2, building2, roof, building2, building2, building2],
    building3: [building3, building3, roof, building3, building3, building3],
    road,
    sidewalk,
    streetlight,
    boxGeo: new THREE.BoxGeometry(1, 1, 1),
    planeGeo: new THREE.PlaneGeometry(1, 1),
  };
}
