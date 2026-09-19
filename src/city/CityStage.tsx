import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { PlotData, isCoinPlot } from '../types';
import { buildTowers, streetLength } from './layout';
import { COLORS, FOG, TOWER_Z } from './constants';
import { StreetController } from './StreetController';
import { CameraRig } from './CameraRig';
import { Towers } from './Towers';
import { Backdrop } from './Backdrop';
import { Ground } from './Ground';
import { CoinLogo } from '../components/CoinLogo';

interface CityStageProps {
  plots: PlotData[];
  controller: StreetController;
  focusIndex: number;
  onTapPlot: (index: number) => void;
}

/** Converts controller taps into instance picks on the ranked towers. */
function TapPicker({
  controller,
  meshRef,
  mapRef,
  onTapPlot,
}: {
  controller: StreetController;
  meshRef: React.MutableRefObject<THREE.InstancedMesh | null>;
  mapRef: React.MutableRefObject<number[]>;
  onTapPlot: (index: number) => void;
}) {
  const { camera, gl } = useThree();
  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    return controller.onTap((cx, cy) => {
      const mesh = meshRef.current;
      if (!mesh) return;
      const r = gl.domElement.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObject(mesh, false);
      const hit = hits.find((h) => h.instanceId !== undefined);
      if (hit && hit.instanceId !== undefined) {
        const idx = mapRef.current[hit.instanceId];
        if (idx !== undefined) onTapPlot(idx);
      }
    });
  }, [controller, camera, gl, meshRef, mapRef, onTapPlot]);
  return null;
}

/** Ticker badges pinned to each crown: mint for organic, gold for ads. HUD, not mesh. */
function CrownLabels({ towers, focusIndex }: { towers: ReturnType<typeof buildTowers>; focusIndex: number }) {
  return (
    <>
      {towers.map((t) => {
        const dist = Math.abs(t.index - focusIndex);
        if (dist > 3) return null;
        const coin = isCoinPlot(t.plot) ? t.plot : null;
        const focused = dist === 0;
        return (
          <Html
            key={t.plot.id}
            position={[t.x, t.height + t.mast + (t.kind === 'paid' ? 0.6 : 0.35), TOWER_Z]}
            center
            zIndexRange={[5, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div
              className={`crown-badge ${coin ? 'crown-badge--logo' : 'crown-badge--ad'} ${focused ? 'crown-badge--focus' : ''}`}
              style={{ opacity: focused ? 1 : dist === 1 ? 0.85 : dist === 2 ? 0.5 : 0.25 }}
            >
              {coin ? <CoinLogo src={coin.image} ticker={coin.ticker} size={30} ring={coin.rentStatus === 'PAID' ? 'paid' : 'due'} /> : 'AD'}
            </div>
          </Html>
        );
      })}
    </>
  );
}

function Scene({ plots, controller, focusIndex, onTapPlot }: CityStageProps) {
  const towers = useMemo(() => buildTowers(plots), [plots]);
  const length = streetLength(plots.length);
  const focusRef = useRef(focusIndex);
  focusRef.current = focusIndex;
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const mapRef = useRef<number[]>([]);
  const onMesh = useCallback((mesh: THREE.InstancedMesh | null, map: number[]) => {
    meshRef.current = mesh;
    mapRef.current = map;
  }, []);

  useEffect(() => {
    controller.count = plots.length;
  }, [controller, plots.length]);

  return (
    <>
      <color attach="background" args={[COLORS.bg.getHex()]} />
      <fog attach="fog" args={[COLORS.bg.getHex(), FOG.near, FOG.far]} />
      <CameraRig controller={controller} />
      <Ground streetLength={length} />
      <Backdrop streetLength={length} />
      <Towers towers={towers} focusRef={focusRef} onMesh={onMesh} />
      <CrownLabels towers={towers} focusIndex={focusIndex} />
      <TapPicker controller={controller} meshRef={meshRef} mapRef={mapRef} onTapPlot={onTapPlot} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.55} luminanceSmoothing={0.2} intensity={1.15} radius={0.6} />
        <Vignette eskil={false} offset={0.25} darkness={0.55} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}

export function CityStage(props: CityStageProps) {
  const { controller } = props;
  const hostRef = useRef<HTMLDivElement>(null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    return controller.attach(el);
  }, [controller]);

  return (
    <div
      ref={hostRef}
      className="city-stage absolute inset-0 select-none"
      style={{ touchAction: 'none', cursor: 'grab' }}
      aria-label="CoinDistrict street. Swipe horizontally to move along the ranking."
    >
      {webgl ? (
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true, toneMapping: THREE.NoToneMapping }}
          camera={{ position: [0, 6, 30], fov: 52 }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', () => setWebgl(false));
          }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Suspense fallback={null}>
            <Scene {...props} />
          </Suspense>
        </Canvas>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-cd-muted text-sm">
          WebGL unavailable on this device.
        </div>
      )}
    </div>
  );
}
