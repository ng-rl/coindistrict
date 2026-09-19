import * as THREE from 'three';
import { facadeFragment, facadeVertex } from './shaders';

export function createFacadeMaterial(reflect = false) {
  const mat = new THREE.ShaderMaterial({
    vertexShader: facadeVertex,
    fragmentShader: facadeFragment,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uTime: { value: 0 },
        uCell: { value: new THREE.Vector2(0.27, 0.23) },
        uReflect: { value: reflect ? 1 : 0 },
      },
    ]),
    fog: true,
    transparent: reflect,
    depthWrite: !reflect,
    // mirrored instances have inverted winding, so their outer faces are back faces
    side: reflect ? THREE.BackSide : THREE.FrontSide,
  });
  return mat;
}

/** Unit box whose origin sits on its floor, so scale.y = height. */
export function createFloorBox() {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  geo.translate(0, 0.5, 0);
  return geo;
}

export interface InstanceAttrs {
  seed: Float32Array;
  lit: Float32Array;
  tint: Float32Array;
  glow: Float32Array;
  phase: Float32Array;
  dim: Float32Array;
}

export function allocAttrs(n: number): InstanceAttrs {
  return {
    seed: new Float32Array(n),
    lit: new Float32Array(n),
    tint: new Float32Array(n * 3),
    glow: new Float32Array(n),
    phase: new Float32Array(n),
    dim: new Float32Array(n),
  };
}

export function attachAttrs(geo: THREE.BufferGeometry, a: InstanceAttrs) {
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(a.seed, 1));
  geo.setAttribute('aLit', new THREE.InstancedBufferAttribute(a.lit, 1));
  geo.setAttribute('aTint', new THREE.InstancedBufferAttribute(a.tint, 3));
  geo.setAttribute('aGlow', new THREE.InstancedBufferAttribute(a.glow, 1));
  geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(a.phase, 1));
  geo.setAttribute('aDim', new THREE.InstancedBufferAttribute(a.dim, 1));
}
