import type { CSSProperties } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import {
  DistrictBuilding,
  type RentStatus,
} from './DistrictBuilding'
import { COLORS } from './materials'

export interface StreetPlot {
  id: string
  /** already log-scaled by host */
  height: number
  status: RentStatus
  isAd?: boolean
  seed?: string
  ticker?: string
  /** world X position along the street (host computes spacing) */
  x: number
}

export interface StreetSceneProps {
  plots: StreetPlot[]
  /** optional className/style for the wrapping div that fills plot row height */
  className?: string
  style?: CSSProperties
  /**
   * Ortho camera defaults — modest street-level, NOT free-fly city.
   * Host may override zoom / position for their row height.
   */
  camera?: {
    position?: [number, number, number]
    zoom?: number
    lookAt?: [number, number, number]
  }
}

const GROUND_MAT = new THREE.MeshStandardMaterial({
  color: COLORS.bg,
  roughness: 0.95,
  metalness: 0,
})
// Shared across StreetScene mounts — do not dispose on unmount
GROUND_MAT.dispose = () => {}

const STRIP_MAT = new THREE.MeshStandardMaterial({
  color: '#111114',
  roughness: 0.9,
  metalness: 0,
})
STRIP_MAT.dispose = () => {}

/**
 * ONE R3F Canvas for an entire street row.
 * Host owns log height + L→R `x` spacing; kit only places DistrictBuilding instances.
 *
 * P0: never mount one Canvas per plot — that breaks 60fps continuous district swipe.
 */
export function StreetScene({
  plots,
  className,
  style,
  camera,
}: StreetSceneProps) {
  const camPos = camera?.position ?? ([3.2, 2.8, 5.5] as [number, number, number])
  const camZoom = camera?.zoom ?? 95
  const lookAt = camera?.lookAt ?? ([0, 1.4, 0] as [number, number, number])

  // Thin ground strip sized to cover the plot span (dumb dark plane — not a bg kit)
  const xs = plots.map((p) => p.x)
  const minX = xs.length ? Math.min(...xs) : -4
  const maxX = xs.length ? Math.max(...xs) : 4
  const span = Math.max(8, maxX - minX + 4)
  const midX = (minX + maxX) / 2

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        ...style,
      }}
    >
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <OrthographicCamera
          makeDefault
          position={camPos}
          zoom={camZoom}
          near={0.1}
          far={80}
          onUpdate={(c) => c.lookAt(...lookAt)}
        />

        {/* Night vibe — soft ambient + cool directional; mint/gold only via buildings */}
        <ambientLight intensity={0.28} color="#a8b0c0" />
        <directionalLight
          position={[4, 8, 5]}
          intensity={0.35}
          color="#c8d0e0"
        />
        <directionalLight position={[-3, 4, -2]} intensity={0.12} color="#3DFF9A" />

        {/* Dumb dark ground plane under the street */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[midX, 0, 0]}
          material={GROUND_MAT}
          receiveShadow
        >
          <planeGeometry args={[span, 6]} />
        </mesh>
        {/* Subtle street strip so buildings aren't floating */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[midX, 0.005, 0.55]}
          material={STRIP_MAT}
        >
          <planeGeometry args={[span * 0.85, 1.3]} />
        </mesh>

        {plots.map((plot) => (
          <group key={plot.id} position={[plot.x, 0, 0]}>
            <DistrictBuilding
              height={plot.height}
              status={plot.status}
              isAd={plot.isAd}
              seed={plot.seed ?? plot.id}
              ticker={plot.ticker}
            />
          </group>
        ))}
      </Canvas>
    </div>
  )
}

/** Alias — same component */
export const DistrictStreet = StreetScene

export default StreetScene
