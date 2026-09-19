import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLORS, LAMP_Z, PLOT_SPACING, TOWER_Z } from './constants';
import { allocAttrs, attachAttrs, createFacadeMaterial, createFloorBox } from './FacadeMaterial';
import { mulberry32 } from './layout';
import { hazeFragment, hazeVertex } from './shaders';

interface BackdropProps {
  streetLength: number;
}

interface Block {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  lit: number;
  glow: number;
  dim: number;
  seed: number;
  tintMint: number;
}

/**
 * The rest of the city. Rows of filler blocks behind the ranked street (silhouette + depth),
 * low blocks on the near sidewalk for parallax. All one InstancedMesh.
 */
function generateBlocks(streetLength: number): Block[] {
  const rnd = mulberry32(0.4242);
  const blocks: Block[] = [];
  const x0 = -34;
  const x1 = streetLength + 34;

  // rows behind the street
  const rows = [
    { z: -5.5, hMin: 1.8, hMax: 5.5, gap: [2.0, 3.2], lit: 0.4, glow: 0.7, dim: 0.9 },
    { z: -10.5, hMin: 2.5, hMax: 8, gap: [2.0, 3.4], lit: 0.42, glow: 0.65, dim: 0.85 },
    { z: -16.5, hMin: 3, hMax: 10, gap: [2.2, 3.6], lit: 0.45, glow: 0.6, dim: 0.8 },
    { z: -24, hMin: 4, hMax: 14, gap: [2.4, 4], lit: 0.48, glow: 0.55, dim: 0.75 },
    { z: -33, hMin: 5, hMax: 18, gap: [2.6, 4.2], lit: 0.5, glow: 0.5, dim: 0.7 },
    { z: -44, hMin: 6, hMax: 22, gap: [2.8, 4.6], lit: 0.5, glow: 0.48, dim: 0.65 },
    { z: -57, hMin: 7, hMax: 26, gap: [3, 5], lit: 0.5, glow: 0.55, dim: 0.6 },
    { z: -72, hMin: 8, hMax: 30, gap: [3.2, 5.4], lit: 0.5, glow: 0.58, dim: 0.55 },
    { z: -90, hMin: 9, hMax: 34, gap: [3.4, 5.8], lit: 0.5, glow: 0.62, dim: 0.5 },
    { z: -112, hMin: 10, hMax: 40, gap: [3.6, 6.2], lit: 0.5, glow: 0.66, dim: 0.45 },
    { z: -136, hMin: 12, hMax: 46, gap: [3.8, 6.6], lit: 0.5, glow: 0.7, dim: 0.42 },
  ];
  for (const r of rows) {
    let x = x0 + rnd() * 3;
    while (x < x1) {
      const w = 1.3 + rnd() * 1.9;
      const d = 1.3 + rnd() * 1.9;
      let h = r.hMin + Math.pow(rnd(), 1.6) * (r.hMax - r.hMin);
      // a few landmark spires so the skyline has a silhouette
      if (r.z < -20 && rnd() < 0.07) h = r.hMax * (1.25 + rnd() * 0.5);
      // occasional cross-street gap
      if (rnd() < 0.12) {
        x += 3.5;
        continue;
      }
      blocks.push({
        x: x + w / 2,
        z: r.z - rnd() * 2.5,
        w,
        d,
        h,
        lit: r.lit * (0.8 + rnd() * 0.5),
        glow: r.glow,
        dim: r.dim,
        seed: rnd(),
        tintMint: rnd() < 0.12 ? 0.55 : 0.0,
      });
      x += w + r.gap[0] + rnd() * (r.gap[1] - r.gap[0]);
    }
  }

  return blocks;
}

export function Backdrop({ streetLength }: BackdropProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const material = useMemo(() => createFacadeMaterial(), []);
  const blocks = useMemo(() => generateBlocks(streetLength), [streetLength]);

  const geometry = useMemo(() => {
    const geo = createFloorBox();
    const attrs = allocAttrs(blocks.length);
    blocks.forEach((b, i) => {
      const tint = COLORS.pale.clone().lerp(COLORS.mint, b.tintMint);
      attrs.seed[i] = b.seed;
      attrs.lit[i] = b.lit;
      attrs.tint.set([tint.r, tint.g, tint.b], i * 3);
      attrs.glow[i] = b.glow;
      attrs.phase[i] = -1;
      attrs.dim[i] = b.dim;
    });
    attachAttrs(geo, attrs);
    return geo;
  }, [blocks]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    blocks.forEach((b, i) => {
      m.makeScale(b.w, b.h, b.d);
      m.setPosition(b.x, 0, b.z);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [blocks]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  // street lamps stand in the gaps between plots, on the tower line, so they never cover a facade
  const lamps = useMemo(() => {
    const out: number[] = [];
    for (let i = -10; i * PLOT_SPACING < streetLength + 30; i++) out.push((i + 0.5) * PLOT_SPACING);
    return out;
  }, [streetLength]);

  // stars
  const stars = useMemo(() => {
    const rnd = mulberry32(0.77);
    const n = 260;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = -80 + rnd() * (streetLength + 160);
      pos[i * 3 + 1] = 20 + rnd() * 60;
      pos[i * 3 + 2] = -150 - rnd() * 20;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [streetLength]);

  const hazeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: hazeVertex,
        fragmentShader: hazeFragment,
        uniforms: { uMint: { value: COLORS.mint } },
        depthWrite: false,
      }),
    []
  );

  return (
    <group>
      <instancedMesh ref={meshRef} args={[geometry, material, blocks.length]} frustumCulled={false} />

      {/* horizon haze: the city's own light bouncing off the night */}
      <mesh position={[streetLength / 2, 30, -150]} material={hazeMat}>
        <planeGeometry args={[streetLength + 500, 60]} />
      </mesh>

      <points geometry={stars}>
        <pointsMaterial color={0x9aa3a8} size={1.6} sizeAttenuation={false} transparent opacity={0.55} />
      </points>

      {lamps.map((x) => (
        <group key={x} position={[x, 0, LAMP_Z]}>
          <mesh position={[0, 1.55, 0]}>
            <boxGeometry args={[0.07, 3.1, 0.07]} />
            <meshBasicMaterial color={0x0a0a0c} />
          </mesh>
          <mesh position={[0, 3.12, 0.16]}>
            <sphereGeometry args={[0.11, 10, 8]} />
            <meshBasicMaterial color={new THREE.Color(1.6, 1.75, 1.7)} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* the rank line: a glowing curb along the base of every plot */}
      <mesh position={[streetLength / 2, 0.03, TOWER_Z + 1.9]}>
        <boxGeometry args={[streetLength + 80, 0.05, 0.05]} />
        <meshBasicMaterial color={COLORS.mint.clone().multiplyScalar(0.9)} toneMapped={false} />
      </mesh>
    </group>
  );
}
