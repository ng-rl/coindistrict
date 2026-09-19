import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { createRng, range } from './rng'
import {
  createBodyMaterial,
  createWindowMaterial,
  createStorefrontMaterial,
  createRoofMaterial,
  COLORS,
} from './materials'

export type RentStatus = 'PAID' | 'DUE'

export interface DistrictBuildingProps {
  /** World height — Cody owns log10(volume)+clamps; kit does NOT re-log */
  height: number
  status: RentStatus
  /** gold storefront; fixed ad massing; ignore height for ads or use short fixed height */
  isAd?: boolean
  /** ticker/id for procedural variety */
  seed?: string
  /** optional label */
  ticker?: string
}

const AD_HEIGHT = 1.6
const FLOOR_H = 0.28
const WINDOW_W = 0.1
const WINDOW_H = 0.14
const WINDOW_D = 0.02

type MassTier = { y: number; h: number; w: number; d: number }

/**
 * Procedural massing inspired by BuildingGeneratorThreeJS patterns:
 * - seeded footprint / bay count / setback tiers
 * - facade window grid via InstancedMesh (one draw call per building)
 * - shared materials; no unique GLB kit fork
 */
function planMassing(
  height: number,
  seed: string,
  isAd: boolean,
): { tiers: MassTier[]; floors: number; cols: number; width: number; depth: number } {
  const rng = createRng(seed)
  if (isAd) {
    const w = range(rng, 0.85, 1.05)
    const d = range(rng, 0.7, 0.9)
    return {
      tiers: [{ y: 0, h: AD_HEIGHT, w, d }],
      floors: Math.max(2, Math.floor(AD_HEIGHT / FLOOR_H)),
      cols: 3,
      width: w,
      depth: d,
    }
  }

  const width = range(rng, 0.75, 1.15)
  const depth = range(rng, 0.65, 1.0)
  const h = Math.max(0.8, height)
  const floors = Math.max(2, Math.round(h / FLOOR_H))
  const cols = Math.max(2, Math.min(5, Math.floor(width / 0.22)))

  // Setback tiers for taller buildings (podium + shaft + optional crown)
  const tiers: MassTier[] = []
  if (h < 2.2) {
    tiers.push({ y: 0, h, w: width, d: depth })
  } else if (h < 3.8) {
    const podium = h * range(rng, 0.22, 0.32)
    const shaft = h - podium
    tiers.push({ y: 0, h: podium, w: width, d: depth })
    tiers.push({
      y: podium,
      h: shaft,
      w: width * range(rng, 0.82, 0.92),
      d: depth * range(rng, 0.82, 0.92),
    })
  } else {
    const podium = h * range(rng, 0.15, 0.22)
    const crown = h * range(rng, 0.08, 0.14)
    const shaft = h - podium - crown
    tiers.push({ y: 0, h: podium, w: width, d: depth })
    tiers.push({
      y: podium,
      h: shaft,
      w: width * range(rng, 0.78, 0.88),
      d: depth * range(rng, 0.78, 0.88),
    })
    tiers.push({
      y: podium + shaft,
      h: crown,
      w: width * range(rng, 0.55, 0.7),
      d: depth * range(rng, 0.55, 0.7),
    })
  }

  return { tiers, floors, cols, width, depth }
}

function buildWindowMatrices(
  tiers: MassTier[],
  cols: number,
  seed: string,
  litChance: number,
): THREE.Matrix4[] {
  const rng = createRng(seed + ':win')
  const mats: THREE.Matrix4[] = []
  const dummy = new THREE.Object3D()

  for (const tier of tiers) {
    const floorCount = Math.max(1, Math.floor(tier.h / FLOOR_H))
    const faces: Array<{ nx: number; nz: number; faceW: number }> = [
      { nx: 0, nz: 1, faceW: tier.w },
      { nx: 0, nz: -1, faceW: tier.w },
      { nx: 1, nz: 0, faceW: tier.d },
      { nx: -1, nz: 0, faceW: tier.d },
    ]

    for (const face of faces) {
      const nCols = Math.max(2, Math.min(cols, Math.floor(face.faceW / 0.2)))
      const spacing = face.faceW / (nCols + 1)
      for (let f = 0; f < floorCount; f++) {
        // Skip some windows for variety (dark panes)
        for (let c = 0; c < nCols; c++) {
          if (rng() > litChance) continue
          const along = -face.faceW / 2 + spacing * (c + 1)
          const y = tier.y + FLOOR_H * (f + 0.5)
          let x = 0
          let z = 0
          let rotY = 0
          if (face.nz === 1) {
            x = along
            z = tier.d / 2 + WINDOW_D * 0.5
            rotY = 0
          } else if (face.nz === -1) {
            x = along
            z = -tier.d / 2 - WINDOW_D * 0.5
            rotY = Math.PI
          } else if (face.nx === 1) {
            x = tier.w / 2 + WINDOW_D * 0.5
            z = along
            rotY = Math.PI / 2
          } else {
            x = -tier.w / 2 - WINDOW_D * 0.5
            z = along
            rotY = -Math.PI / 2
          }
          dummy.position.set(x, y, z)
          dummy.rotation.set(0, rotY, 0)
          dummy.scale.set(1, 1, 1)
          dummy.updateMatrix()
          mats.push(dummy.matrix.clone())
        }
      }
    }
  }
  return mats
}

export function DistrictBuilding({
  height,
  status,
  isAd = false,
  seed = 'default',
  ticker,
}: DistrictBuildingProps) {
  const groupRef = useRef<THREE.Group>(null)
  const windowMatRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const storeMatRef = useRef<THREE.MeshStandardMaterial | null>(null)

  const plan = useMemo(
    () => planMassing(isAd ? AD_HEIGHT : height, seed, isAd),
    [height, seed, isAd],
  )

  const bodyMat = useMemo(() => createBodyMaterial(isAd, status === 'DUE'), [isAd, status])
  const windowMat = useMemo(() => {
    const m = createWindowMaterial(status, isAd)
    windowMatRef.current = m
    return m
  }, [status, isAd])
  const roofMat = useMemo(() => createRoofMaterial(isAd), [isAd])
  const storeMat = useMemo(() => {
    const m = createStorefrontMaterial()
    storeMatRef.current = m
    return m
  }, [])

  const litChance = isAd ? 0.85 : status === 'PAID' ? 0.72 : 0.18
  const windowMatrices = useMemo(
    () => buildWindowMatrices(plan.tiers, plan.cols, seed, litChance),
    [plan, seed, litChance],
  )

  const windowGeo = useMemo(
    () => new THREE.BoxGeometry(WINDOW_W, WINDOW_H, WINDOW_D),
    [],
  )

  const totalH = plan.tiers.reduce((max, t) => Math.max(max, t.y + t.h), 0)

  // PAID mint breathe; ads stay steady gold; DUE stays dim
  useFrame(({ clock }) => {
    if (isAd && storeMatRef.current) {
      storeMatRef.current.emissiveIntensity = 0.7
      if (windowMatRef.current) windowMatRef.current.emissiveIntensity = 0.5
      return
    }
    if (status === 'PAID' && windowMatRef.current) {
      const t = clock.getElapsedTime()
      // Soft pulse ~2.4s period — matches DESIGN-SPEC rent pulse
      const pulse = 0.45 + 0.25 * (0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 2.4))
      windowMatRef.current.emissiveIntensity = pulse
    }
  })

  const label = ticker ?? (isAd ? 'AD' : seed)

  return (
    <group ref={groupRef}>
      {/* Massing tiers */}
      {plan.tiers.map((tier, i) => (
        <mesh
          key={`tier-${i}`}
          position={[0, tier.y + tier.h / 2, 0]}
          material={bodyMat}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[tier.w, tier.h, tier.d]} />
        </mesh>
      ))}

      {/* Thin roof cap */}
      <mesh position={[0, totalH + 0.03, 0]} material={roofMat}>
        <boxGeometry
          args={[
            plan.tiers[plan.tiers.length - 1].w * 1.02,
            0.06,
            plan.tiers[plan.tiers.length - 1].d * 1.02,
          ]}
        />
      </mesh>

      {/* Instanced window grid */}
      {windowMatrices.length > 0 && (
        <instancedMesh
          args={[windowGeo, windowMat, windowMatrices.length]}
          ref={(mesh) => {
            if (!mesh) return
            windowMatrices.forEach((m, i) => mesh.setMatrixAt(i, m))
            mesh.instanceMatrix.needsUpdate = true
          }}
        />
      )}

      {/* Gold storefront band for ads only */}
      {isAd && (
        <mesh position={[0, 0.22, plan.depth / 2 + 0.01]} material={storeMat}>
          <boxGeometry args={[plan.width * 0.92, 0.38, 0.04]} />
        </mesh>
      )}

      {/* Ticker label */}
      {label && (
        <Html
          position={[0, totalH + 0.35, 0]}
          center
          distanceFactor={6}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: isAd ? '#1A1408' : '#0B0B0C',
              background: isAd
                ? COLORS.gold
                : status === 'PAID'
                  ? COLORS.mint
                  : '#8B8B93',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

export default DistrictBuilding
