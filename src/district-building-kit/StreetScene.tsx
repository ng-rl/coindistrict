import { useLayoutEffect, type CSSProperties } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import {
  DistrictBuilding,
  type RentStatus,
} from './DistrictBuilding'
import { COLORS } from './materials'

/**
 * Recommended host scale: world X = centerDomPx / STREET_PX_PER_WORLD.
 * Auto-frame then sets ortho zoom so the full plot span fits the canvas width.
 * Any consistent world units work — this constant documents the Cody convention.
 */
export const STREET_PX_PER_WORLD = 30

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
   * Ortho camera — auto-framed to plot span by default.
   * Host may override zoom / position / lookAt; overrides merge on top of auto.
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
 * Frames the orthographic camera to the plot span so a full-street-width
 * canvas (thousands of px) still shows every building — not a black/mint void.
 * Host overrides (zoom / position / lookAt) merge on top of auto values.
 */
function AutoFrame({
  plots,
  cameraOverride,
}: {
  plots: StreetPlot[]
  cameraOverride?: StreetSceneProps['camera']
}) {
  const { camera, size } = useThree()
  const overrideZoom = cameraOverride?.zoom
  const overridePos = cameraOverride?.position
  const overrideLookAt = cameraOverride?.lookAt

  // Stable dependency key for plot X positions
  const plotXsKey = plots.map((p) => p.x).join(',')

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return

    const xs = plots.map((p) => p.x)
    const minX = xs.length ? Math.min(...xs) : -2
    const maxX = xs.length ? Math.max(...xs) : 2
    const midX = (minX + maxX) / 2
    // pad ~1.2 each side for building half-width
    const worldW = Math.max(4, maxX - minX + 2.4)

    const autoZoom = size.width > 0 ? size.width / worldW : 95
    const autoPos: [number, number, number] = [midX + 2.2, 2.2, 5]
    const autoLookAt: [number, number, number] = [midX, 1.1, 0]

    const zoom = overrideZoom ?? autoZoom
    const pos = overridePos ?? autoPos
    const lookAt = overrideLookAt ?? autoLookAt

    camera.zoom = zoom
    camera.position.set(pos[0], pos[1], pos[2])
    camera.lookAt(lookAt[0], lookAt[1], lookAt[2])
    camera.updateProjectionMatrix()
  }, [
    camera,
    size.width,
    size.height,
    plotXsKey,
    plots,
    overrideZoom,
    overridePos,
    overrideLookAt,
  ])

  return null
}

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
        <OrthographicCamera makeDefault near={0.1} far={80} />
        <AutoFrame plots={plots} cameraOverride={camera} />

        {/* Night vibe — cool white/grey only; mint/gold only via building emissive */}
        <ambientLight intensity={0.28} color="#a8b0c0" />
        <directionalLight
          position={[4, 8, 5]}
          intensity={0.35}
          color="#c8d0e0"
        />
        <directionalLight
          position={[-3, 4, -2]}
          intensity={0.1}
          color="#9aa3b2"
        />

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
