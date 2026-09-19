import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TowerSpec } from './layout';
import { COLORS, PLOT_SPACING, REDUCED_MOTION, STREET_Z0, TOWER_Z } from './constants';
import { allocAttrs, attachAttrs, createFacadeMaterial, createFloorBox } from './FacadeMaterial';
import { isAdPlot, isLeasedPlot, isLotPlot } from '../types';
import { lowestWeekly } from '../data/ledger';

interface TowersProps {
  towers: TowerSpec[];
  /** index of the first District plot; the zone decal is painted just before it */
  districtStart: number;
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
    case 'lot':
      return { tint: COLORS.pale, lit: 0, glow: 0, dim: 0.5, breathe: false };
  }
}

const FONT = '-apple-system, Helvetica, Arial, sans-serif';

/** Tenant storefront (tier 2+): mint on dark, never gold (gold is ads only). */
function makeTenantBoardTexture(title: string, tagline: string) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 176;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0F1512';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#3DFF9A';
  ctx.lineWidth = 5;
  ctx.strokeRect(8, 8, c.width - 16, c.height - 16);
  ctx.fillStyle = 'rgba(61,255,154,0.18)';
  ctx.fillRect(24, 24, 96, 28);
  ctx.fillStyle = '#3DFF9A';
  ctx.font = `700 15px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('LEASED', 34, 38);
  ctx.fillStyle = '#F4F4F5';
  ctx.font = `650 26px ${FONT}`;
  ctx.fillText(title.slice(0, 16), 24, 92);
  ctx.font = `400 17px ${FONT}`;
  ctx.fillStyle = 'rgba(244,244,245,0.75)';
  ctx.fillText(tagline.slice(0, 26), 24, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** FOR LEASE sign on an empty lot: the sales funnel lives in the world. */
function makeLotSignTexture(lotNumber: number) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 144;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0B0B0C';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#3DFF9A';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, c.width - 16, c.height - 16);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#3DFF9A';
  ctx.font = `800 34px ${FONT}`;
  ctx.fillText('FOR LEASE', c.width / 2, 52);
  ctx.fillStyle = '#F4F4F5';
  ctx.font = `600 18px ${FONT}`;
  ctx.fillText(`Plot #${lotNumber} · from $${lowestWeekly()}/wk`, c.width / 2, 98);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Painted on the asphalt where downtown ends: no occlusion, reads from the camera angle. */
function makeZoneDecalTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#3DFF9A';
  ctx.font = `800 44px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText('DOWNTOWN', 224, 64);
  ctx.textAlign = 'left';
  ctx.fillText('DISTRICT', 288, 64);
  ctx.fillRect(252, 24, 8, 80);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
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

export function Towers({ towers, districtStart, focusRef, onMesh }: TowersProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const outlineRef = useRef<THREE.LineSegments>(null);
  const material = useMemo(() => createFacadeMaterial(), []);
  const reflectMaterial = useMemo(() => createFacadeMaterial(true), []);
  const reflectRef = useRef<THREE.InstancedMesh>(null);

  const { geometry, count, instanceToTower, crowns, masts, billboards, signs } = useMemo(() => {
    const geometry = createFloorBox();
    const segCount = towers.reduce((n, t) => n + t.segments.length, 0);
    const attrs = allocAttrs(segCount);
    const instanceToTower: number[] = [];
    const m = new THREE.Matrix4();
    const crowns: { x: number; y: number; z: number }[] = [];
    const masts: { x: number; y: number; h: number }[] = [];
    const billboards: { x: number; y: number; z: number; w: number; h: number; tex: THREE.CanvasTexture; boost: number }[] = [];
    const signs: { x: number; tex: THREE.CanvasTexture }[] = [];
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
          boost: 1.35,
        });
      } else if (isLeasedPlot(t.plot) && t.plot.lease.tier >= 2) {
        const w = t.width * 0.86;
        billboards.push({
          x: t.x,
          y: Math.min(t.height * 0.5, 2.6),
          z: TOWER_Z + t.segments[0].d / 2 + 0.02,
          w,
          h: w * (176 / 256),
          tex: makeTenantBoardTexture(t.plot.name, t.plot.lease.tagline),
          boost: 1.2,
        });
      } else if (isLotPlot(t.plot)) {
        signs.push({ x: t.x, tex: makeLotSignTexture(t.plot.lotNumber) });
      }
    }
    attachAttrs(geometry, attrs);
    return { geometry, count: segCount, instanceToTower, crowns, masts, billboards, signs, matrices };
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

  useEffect(
    () => () => {
      geometry.dispose();
      billboards.forEach((b) => b.tex.dispose());
      signs.forEach((s) => s.tex.dispose());
    },
    [geometry, billboards, signs]
  );

  const zoneDecal = useMemo(() => makeZoneDecalTexture(), []);
  const hasDistrict = districtStart < towers.length && districtStart > 0;
  const decalX = hasDistrict ? (districtStart - 0.5) * PLOT_SPACING : 0;

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

      {/* storefront billboards: gold on ad plots, mint on tier-2+ tenants */}
      {billboards.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <planeGeometry args={[b.w, b.h]} />
          <meshBasicMaterial map={b.tex} color={new THREE.Color(b.boost, b.boost, b.boost)} toneMapped={false} />
        </mesh>
      ))}

      {/* FOR LEASE signs on empty lots */}
      {signs.map((s, i) => (
        <group key={`s${i}`} position={[s.x, 0, TOWER_Z]}>
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[0.07, 1.5, 0.07]} />
            <meshBasicMaterial color={0x2a2a30} />
          </mesh>
          <mesh position={[0, 1.55, 0.05]}>
            <planeGeometry args={[1.7, 1.7 * (144 / 256)]} />
            <meshBasicMaterial map={s.tex} color={new THREE.Color(1.4, 1.4, 1.4)} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* zone marker painted on the asphalt where downtown ends */}
      {hasDistrict && (
        <mesh position={[decalX, 0.02, STREET_Z0 + 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.4, 1.6]} />
          <meshBasicMaterial map={zoneDecal} transparent opacity={0.85} color={new THREE.Color(1.3, 1.3, 1.3)} toneMapped={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
