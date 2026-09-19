/**
 * Procedural night-facade shader. Every building is a unit box with per-instance attributes;
 * windows are drawn in the fragment shader on a world-unit grid so density is constant across
 * towers of any size. Lit windows are emissive (>1.0) so the bloom pass makes them glow.
 */
export const facadeVertex = /* glsl */ `
attribute float aSeed;
attribute float aLit;
attribute vec3 aTint;
attribute float aGlow;
attribute float aPhase;
attribute float aDim;

varying vec2 vUvW;
varying vec2 vFaceSize;
varying float vTop;
varying vec3 vNormalW;
varying float vSeed;
varying float vLit;
varying vec3 vTint;
varying float vGlow;
varying float vPhase;
varying float vDim;
varying float vWorldY;

#include <fog_pars_vertex>

void main() {
  vec3 sc = vec3(
    length(instanceMatrix[0].xyz),
    length(instanceMatrix[1].xyz),
    length(instanceMatrix[2].xyz)
  );
  vec3 p = position;
  vTop = step(0.5, abs(normal.y));
  if (abs(normal.x) > 0.5) {
    vUvW = vec2((p.z + 0.5) * sc.z, p.y * sc.y);
    vFaceSize = vec2(sc.z, sc.y);
  } else {
    vUvW = vec2((p.x + 0.5) * sc.x, p.y * sc.y);
    vFaceSize = vec2(sc.x, sc.y);
  }
  vNormalW = normalize(mat3(instanceMatrix) * normal);
  vSeed = aSeed;
  vLit = aLit;
  vTint = aTint;
  vGlow = aGlow;
  vPhase = aPhase;
  vDim = aDim;

  vWorldY = (instanceMatrix * vec4(p, 1.0)).y;
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

export const facadeFragment = /* glsl */ `
uniform float uTime;
uniform vec2 uCell;
uniform float uReflect;

varying vec2 vUvW;
varying vec2 vFaceSize;
varying float vTop;
varying vec3 vNormalW;
varying float vSeed;
varying float vLit;
varying vec3 vTint;
varying float vGlow;
varying float vPhase;
varying float vDim;
varying float vWorldY;

#include <fog_pars_fragment>

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  // concrete + glass facade, front faces catch a little more street light
  float front = abs(vNormalW.z);
  float side = abs(vNormalW.x);
  float shade = 0.35 + 0.65 * front + 0.25 * side;
  vec3 facade = vec3(0.034, 0.034, 0.040) * vDim * shade;
  facade *= 1.0 + 0.9 * exp(-vUvW.y * 0.32);

  vec3 col = facade;
  if (vTop < 0.5) {
    vec2 g = vUvW / uCell;
    vec2 c = floor(g);
    vec2 f = fract(g);

    // skip partial cells on the edges and the ground floor (lobby)
    float inX = step((c.x + 1.0) * uCell.x, vFaceSize.x + 0.001) * step(-0.5, c.x);
    float inY = step((c.y + 1.0) * uCell.y, vFaceSize.y + 0.001) * step(0.5, c.y);

    vec2 fw = fwidth(g);
    vec2 lo = vec2(0.22, 0.30);
    vec2 hi = vec2(0.78, 0.72);
    vec2 m = smoothstep(lo - fw, lo + fw, f) * (1.0 - smoothstep(hi - fw, hi + fw, f));
    float w = m.x * m.y * inX * inY;

    float h1 = hash21(c + vSeed * 17.0);
    float lit = step(h1, vLit);
    float v0 = hash21(c * 1.7 + vSeed + 3.1);
    float vari = 0.18 + 0.82 * v0 * v0;
    float flick = 0.92 + 0.08 * sin(uTime * (0.3 + h1 * 0.6) + h1 * 40.0);
    float breathe = vPhase < 0.0 ? 1.0 : (0.62 + 0.38 * sin(uTime * 2.618 + vPhase));

    vec3 glass = vec3(0.005, 0.006, 0.008);
    vec3 windows = mix(col, glass, w) + w * lit * vTint * (vGlow * vari * flick * breathe);

    // far away the grid aliases: fade to the average lit-window glow
    float farness = smoothstep(0.28, 0.7, max(fw.x, fw.y));
    vec3 avg = col + vTint * vLit * vGlow * 0.16 * breathe;
    col = mix(windows, avg, farness);

    // lobby: a faint strip of light at street level
    float lobby = (1.0 - step(0.5, c.y)) * step(0.0, c.y) * smoothstep(0.85, 0.35, f.y);
    col += lobby * vTint * vGlow * 0.06 * step(0.5, vLit + 0.5);
  } else {
    col *= 0.7;
  }

  // wet-street reflection: mirrored instances below y=0 fade with depth and ripple slightly
  float alpha = 1.0;
  if (uReflect > 0.5) {
    float ripple = 0.85 + 0.15 * sin(vWorldY * 9.0 + uTime * 1.3);
    alpha = 0.32 * exp(vWorldY * 0.42) * ripple;
    col *= 0.9;
  }
  gl_FragColor = vec4(col, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`;

export const groundVertex = /* glsl */ `
varying vec3 vPos;
#include <fog_pars_vertex>
void main() {
  vPos = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

export const groundFragment = /* glsl */ `
uniform vec3 uMint;
uniform float uStreet0;
uniform float uStreet1;
uniform float uCurbZ;
varying vec3 vPos;
#include <fog_pars_fragment>

void main() {
  float z = vPos.z;
  float x = vPos.x;
  vec3 col = vec3(0.0075, 0.0075, 0.009);

  // asphalt strip
  float street = smoothstep(uStreet0 - 0.05, uStreet0 + 0.05, z) * (1.0 - smoothstep(uStreet1 - 0.05, uStreet1 + 0.05, z));
  col = mix(col, vec3(0.011, 0.011, 0.013), street);

  // lane dashes (quiet mint, transit-map line)
  float mid = (uStreet0 + uStreet1) * 0.5;
  float dash = step(0.55, fract(x / 2.4)) * (1.0 - smoothstep(0.04, 0.08, abs(z - mid)));
  col += uMint * 0.045 * dash * street;

  // light spill from the towers onto the curb
  float spill = exp(-max(z - 0.6, 0.0) * 0.9) * step(0.0, z);
  col += uMint * 0.025 * spill;

  // curb line
  float curb = 1.0 - smoothstep(0.02, 0.06, abs(z - uCurbZ));
  col += uMint * 0.35 * curb;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`;

export const hazeVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const hazeFragment = /* glsl */ `
uniform vec3 uMint;
varying vec2 vUv;
void main() {
  float a = pow(1.0 - vUv.y, 3.0);
  vec3 col = uMint * 0.11 * a + vec3(0.02, 0.022, 0.026) * a;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
