import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TowerSpec } from './layout';
import { COLORS, REDUCED_MOTION, TOWER_Z } from './constants';
import { allocAttrs, attachAttrs, createFacadeMaterial, createFloorBox } from './FacadeMaterial';
import { isAdPlot } from '../types';

interface TowersProps {
  towers: TowerSpec[];
  focusRef: React.MutableRefObject<number>;
  /** receives the instanced mesh + instance→tower map for tap raycasting */
  onMesh: (mesh: THREE.InstancedMesh | null, map: number[]) => void;
}

/** Per-kind window treatment. Mint = paid life. Grey = lights going out. Gold = purchased. */
function kindStyle(kind: TowerSpec['kind']) {
  switch (kind) {
    case 'paid':
      return { tint: COLORS.paidGlass, lit: 0.55, glow: 1.45, dim: 1.0, breathe: true };
    case 'due':
      return { tint: COLORS.dueGlass, lit: 0.16, glow: 0.55, dim: 0.55, breathe: false };
    case 'ad':
      return { tint: COLORS.ad, lit: 0.5, glow: 1.3, dim: 0.95, breathe: false };
  }
}

function makeBillboardTexture(title: string, tagline: string) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 176;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#1A1408';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#E8C36A';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, c.width - 16, c.height - 16);
  // AD badge
  ctx.fillStyle = '#E8C36A';
  ctx.fillRect(24, 24, 58, 30);
  ctx.fillStyle = '#1A1408';
  ctx.font = '700 20px -apple-system, Helvetica, Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('AD', 36, 40);
  // copy
  ctx.fillStyle = '#E8C36A';
  ctx.font = '650 26px -apple-system, Helvetica, Arial, sans-serif';
  ctx.fillText(title.slice(0, 16), 24, 92);
  ctx.font = '400 17px -apple-system, Helvetica, Arial, sans-serif';
  ctx.fillStyle = 'rgba(232,195,106,0.8)';
  ctx.fillText(tagline.slice(0, 26), 24, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function Towers({ towers, focusRef, onMesh }: TowersProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const outlineRef = useRef<THREE.LineSegments>(null);
  const material = useMemo(() => createFacadeMaterial(), []);
  const reflectMaterial = useMemo(() => createFacadeMaterial(true), []);
  const reflectRef = useRef<THREE.InstancedMesh>(null);

  const { geometry, count, instanceToTower, crowns, masts, billboards } = useMemo(() => {
    const geometry = createFloorBox();
    const segCount = towers.reduce((n, t) => n + t.segments.length, 0);
    const attrs = allocAttrs(segCount);
    const instanceToTower: number[] = [];
    const m = new THREE.Matrix4();
    const crowns: { x: number; y: number; z: number }[] = [];
    const masts: { x: number; y: number; h: number }[] = [];
    const billboards: { x: number; y: number; z: number; w: number; h: number; tex: THREE.CanvasTexture }[] = [];
    const matrices: THREE.Matrix4[] = [];
    let i = 0;
    for (const t of towers) {
      const s = kindStyle(t.kind);
      for (const seg of t.segments) {
        m.makeScale(seg.w, seg.h, seg.d);
        m.setPosition(t.x, seg.y, TOWER_Z);
        matrices.push(m.clone());
        attrs.seed[i] = t.seed + i * 0.013;
        attrs.lit[i] = s.lit;
        attrs.tint.set([s.tint.r, s.tint.g, s.tint.b], i * 3);
        attrs.glow[i] = s.glow;
        attrs.phase[i] = s.breathe && !REDUCED_MOTION ? (t.index * 0.12 * Math.PI * 2) / 2.4 : -1;
        attrs.dim[i] = s.dim;
        instanceToTower.push(t.index);
        i++;
      }
      if (t.mast > 0) masts.push({ x: t.x, y: t.height, h: t.mast });
      if (t.kind === 'paid') crowns.push({ x: t.x, y: t.height + t.mast + 0.08, z: TOWER_Z });
      if (isAdPlot(t.plot)) {
        const w = t.width * 0.86;
        billboards.push({
          x: t.x,
          y: t.height * 0.5,
          z: TOWER_Z + t.depth / 2 + 0.02,
          w,
          h: w * (176 / 256),
          tex: makeBillboardTexture(t.plot.advertiser, t.plot.tagline ?? 'Sponsored plot'),
        });
      }
    }
    attachAttrs(geometry, attrs);
    return { geometry, count: segCount, instanceToTower, crowns, masts, billboards, matrices };
  }, [towers]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    let i = 0;
    for (const t of towers) {
      for (const seg of t.segments) {
        m.makeScale(seg.w, seg.h, seg.d);
        m.setPosition(t.x, seg.y, TOWER_Z);
        mesh.setMatrixAt(i++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    const refl = reflectRef.current;
    if (refl) {
      let j = 0;
      for (const t of towers) {
        for (const seg of t.segments) {
          m.makeScale(seg.w, -seg.h, seg.d);
          m.setPosition(t.x, -seg.y, TOWER_Z);
          refl.setMatrixAt(j++, m);
        }
      }
      refl.instanceMatrix.needsUpdate = true;
      refl.computeBoundingSphere();
    }
    onMesh(mesh, instanceToTower);
    return () => onMesh(null, []);
  }, [towers, instanceToTower, onMesh]);

  const outlineGeo = useMemo(() => new THREE.EdgesGeometry(createFloorBox()), []);
  const outlineTarget = useRef({ x: 0, w: 1, h: 1, d: 1 });

  useFrame(({ clock }, dt) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    reflectMaterial.uniforms.uTime.value = clock.elapsedTime;
    const o = outlineRef.current;
    const t = towers[focusRef.current];
    if (o && t) {
      const base = t.segments[0];
      const tgt = outlineTarget.current;
      const k = 1 - Math.pow(0.0005, dt);
      tgt.x += (t.x - tgt.x) * k;
      tgt.w += (base.w + 0.12 - tgt.w) * k;
      tgt.d += (base.d + 0.12 - tgt.d) * k;
      tgt.h += (t.height + 0.06 - tgt.h) * k;
      o.position.set(tgt.x, -0.01, TOWER_Z);
      o.scale.set(tgt.w, tgt.h, tgt.d);
    }
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />
      <instancedMesh ref={reflectRef} args={[geometry, reflectMaterial, count]} frustumCulled={false} renderOrder={2} />

      {/* focus outline: quiet mint wireframe around the plot under the thumb */}
      <lineSegments ref={outlineRef} geometry={outlineGeo}>
        <lineBasicMaterial color={COLORS.mint} transparent opacity={0.55} toneMapped={false} />
      </lineSegments>

      {/* crown lights on PAID towers */}
      {crowns.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]}>
          <boxGeometry args={[0.22, 0.16, 0.22]} />
          <meshBasicMaterial color={COLORS.mint.clone().multiplyScalar(2.2)} toneMapped={false} />
        </mesh>
      ))}

      {masts.map((m, i) => (
        <mesh key={`m${i}`} position={[m.x, m.y + m.h / 2, TOWER_Z]}>
          <boxGeometry args={[0.06, m.h, 0.06]} />
          <meshBasicMaterial color={0x2a2a30} />
        </mesh>
      ))}

      {/* gold storefront billboards on ad plots */}
      {billboards.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <planeGeometry args={[b.w, b.h]} />
          <meshBasicMaterial map={b.tex} color={new THREE.Color(1.35, 1.35, 1.35)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
