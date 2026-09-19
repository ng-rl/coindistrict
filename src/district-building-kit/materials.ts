import * as THREE from 'three'

/** Chris creative frame — locked tokens */
export const COLORS = {
  bg: '#0B0B0C',
  bodyTop: '#2A2A30',
  bodyBottom: '#151518',
  bodyEdge: '#333339',
  mint: '#3DFF9A',
  gold: '#E8C36A',
  dueTint: '#1a1214',
  windowOff: '#0e1012',
} as const

/** Prevent R3F from disposing shared materials on unmount */
function markShared<T extends THREE.Material>(m: T): T {
  // no-op dispose — materials are reused across mounts
  m.dispose = () => {}
  return m
}

/** Shared body material — dark night massing */
export function createBodyMaterial(isAd: boolean, isDue: boolean): THREE.MeshStandardMaterial {
  if (isAd) {
    return markShared(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1a1810'),
        roughness: 0.72,
        metalness: 0.08,
        emissive: new THREE.Color(COLORS.gold),
        emissiveIntensity: 0.04,
      }),
    )
  }
  return markShared(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(isDue ? COLORS.dueTint : COLORS.bodyBottom),
      roughness: 0.85,
      metalness: 0.05,
      emissive: new THREE.Color(COLORS.bodyEdge),
      emissiveIntensity: isDue ? 0.02 : 0.05,
    }),
  )
}

/** Window emissive — mint for PAID, dim for DUE, gold for ads */
export function createWindowMaterial(
  status: 'PAID' | 'DUE',
  isAd: boolean,
): THREE.MeshStandardMaterial {
  if (isAd) {
    return markShared(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2a2414'),
        emissive: new THREE.Color(COLORS.gold),
        emissiveIntensity: 0.55,
        roughness: 0.4,
        metalness: 0.1,
        toneMapped: false,
      }),
    )
  }
  if (status === 'PAID') {
    return markShared(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0a1a12'),
        emissive: new THREE.Color(COLORS.mint),
        emissiveIntensity: 0.65,
        roughness: 0.35,
        metalness: 0.05,
        toneMapped: false,
      }),
    )
  }
  return markShared(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(COLORS.windowOff),
      emissive: new THREE.Color('#1a2220'),
      emissiveIntensity: 0.08,
      roughness: 0.7,
      metalness: 0.02,
      toneMapped: false,
    }),
  )
}

export function createStorefrontMaterial(): THREE.MeshStandardMaterial {
  return markShared(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1c180c'),
      emissive: new THREE.Color(COLORS.gold),
      emissiveIntensity: 0.75,
      roughness: 0.35,
      metalness: 0.15,
      toneMapped: false,
    }),
  )
}

export function createRoofMaterial(isAd: boolean): THREE.MeshStandardMaterial {
  return markShared(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(isAd ? '#2a2410' : '#121214'),
      roughness: 0.9,
      metalness: 0.02,
    }),
  )
}
