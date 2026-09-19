import { useMemo } from 'react';
import * as THREE from 'three';
import { COLORS, CURB_Z, STREET_Z0, STREET_Z1 } from './constants';
import { groundFragment, groundVertex } from './shaders';

export function Ground({ streetLength }: { streetLength: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: groundVertex,
        fragmentShader: groundFragment,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uMint: { value: COLORS.mint },
            uStreet0: { value: STREET_Z0 },
            uStreet1: { value: STREET_Z1 },
            uCurbZ: { value: CURB_Z },
          },
        ]),
        fog: true,
        depthWrite: false,
      }),
    []
  );
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(streetLength + 500, 300, 1, 1);
    g.rotateX(-Math.PI / 2);
    g.translate(streetLength / 2, 0, -60);
    return g;
  }, [streetLength]);
  return <mesh geometry={geometry} material={material} />;
}
