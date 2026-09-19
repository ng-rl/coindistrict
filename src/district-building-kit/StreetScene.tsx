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
 * Centers are measured in the scroll-content coordinate system (0 = left of content).
 * Match ~88px DOM plot width so a ~1wu-wide building fills one plot under
 * viewport framing (zoom = STREET_PX_PER_WORLD → 1 world unit ≈ 88 canvas px).
 */
export const STREET_PX_PER_WORLD = 88

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
  /**
   * DOM scrollLeft of the street scroller (px). Camera X tracks this.
   * At scrollLeft 0 the camera centers on world X = visibleWorldW/2
   * (i.e. left edge of the viewport shows world x ≈ 0 / first-plot origin).
   * If the host adds paddingLeft on the scroll content, either:
   *   - include that pad in the scroll→world mapping when computing plot.x, OR
   *   - pass scrollLeftPx + paddingLeft so camX stays aligned with DOM centers.
   * Default assumption: scrollLeft 0 shows world x starting at the first plot;
   * plot.x values already live in the same content coordinate system.
   */
  scrollLeftPx?: number
  /** Visible row height hint (px) — optional; parent CSS height is authoritative */
  visibleRowHeight?: number
  /** optional className/style for the wrapping div that fills the viewport street area */
  className?: string
  style?: CSSProperties
  /**
   * Ortho camera — viewport-framed + scroll-linked by default.
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
 * Viewport framing + scroll-linked camera.
 * Canvas must fill a VIEWPORT-sized parent (phone width), NOT full street width.
 * zoom stays at STREET_PX_PER_WORLD; camX tracks scrollLeftPx so towers stay
 * readable while the host scrolls DOM HUD over the same street.
 */
function AutoFrame({
  plots,
  scrollLeftPx = 0,
  cameraOverride,
}: {
  plots: StreetPlot[]
  scrollLeftPx?: number
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

    // Show ~phone-width of street in world units
    const visibleWorldW =
      size.width > 0 ? size.width / STREET_PX_PER_WORLD : 4

    // Stable zoom: 1 wu ≈ STREET_PX_PER_WORLD canvas px
    const autoZoom =
      visibleWorldW > 0 ? size.width / visibleWorldW : STREET_PX_PER_WORLD
    // (= STREET_PX_PER_WORLD when size.width is valid)

    // Center of current viewport in world X
    const camX =
      (scrollLeftPx ?? 0) / STREET_PX_PER_WORLD + visibleWorldW / 2

    // Street elevation — slight side offset, eye height, pull back
    const autoPos: [number, number, number] = [camX + 0.5, 1.55, 6.5]
    const autoLookAt: [number, number, number] = [camX, 1.45, 0]

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
    scrollLeftPx,
    plotXsKey,
    plots,
    overrideZoom,
    overridePos,
    overrideLookAt,
  ])

  return null
}

/**
 * ONE R3F Canvas for an entire street row — sized to the VIEWPORT, not the
 * full street width. Host scrolls a DOM layer on top and passes scrollLeftPx
 * so the camera tracks. Never mount a full-street-width WebGL canvas on phone
 * (max texture + bad framing → Fran tall FAIL / gray slabs).
 *
 * P0: never mount one Canvas per plot — that breaks 60fps continuous district swipe.
 */
export function StreetScene({
  plots,
  scrollLeftPx = 0,
  visibleRowHeight,
  className,
  style,
  camera,
}: StreetSceneProps) {
  // Ground covers full plot span (+ margin) so scrolling never shows floating void
  const xs = plots.map((p) => p.x)
  const minX = xs.length ? Math.min(...xs) : -4
  const maxX = xs.length ? Math.max(...xs) : 4
  const span = Math.max(8, maxX - minX + 6)
  const midX = (minX + maxX) / 2

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: visibleRowHeight ?? '100%',
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
        <AutoFrame
          plots={plots}
          scrollLeftPx={scrollLeftPx}
          cameraOverride={camera}
        />

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

        {/* Dumb dark ground plane under the full street span */}
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
          <planeGeometry args={[span * 0.9, 1.3]} />
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
