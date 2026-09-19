import * as THREE from 'three';

/** World layout (1 unit ≈ 10 m). Rank axis is +X: left = biggest mcap. */
export const PLOT_SPACING = 3.2;
/** Focused plot sits slightly left of centre so the next (lower-mcap) plots peek in. */
export const FOCUS_OFFSET = 0.9;

/** Tower height range for organic plots (HEIGHT doc: log10(volume) → lerp with clamps). */
export const H_MIN = 3.4;
export const H_MAX = 13.5;
/** Ad plots: height decoupled from mcap/volume (rate-card height). */
export const AD_HEIGHT = 5.6;

/** Depth layout along Z. Towers stand on z = 0, camera looks from +Z. */
export const TOWER_Z = 0;
export const CURB_Z = 1.9;
export const LAMP_Z = 3.1;
export const STREET_Z0 = 3.6;
export const STREET_Z1 = 11.2;

export const CAMERA = {
  distance: 26,
  height: 5.4,
  lookY: 6.2,
  yaw: -2.2, // camera x offset from focus (negative = we stand a little left, see right faces)
  fov: 52,
};

export const FOG = { near: 24, far: 165 };

/** Palette in linear space (the renderer works in linear, outputs sRGB). */
const lin = (hex: string) => new THREE.Color(hex).convertSRGBToLinear();
export const COLORS = {
  bg: lin('#0B0B0C'),
  /** PAID windows: mint-leaning glass (brand accent without the casino) */
  paidGlass: lin('#3DFF9A').lerp(lin('#DDEFE6'), 0.42),
  mint: lin('#3DFF9A'),
  ad: lin('#E8C36A'),
  due: lin('#FF6B6B'),
  /** backdrop windows: quiet pale glass, so mint on ranked towers stays the one accent */
  pale: lin('#B9C6C4'),
  /** DUE windows: cold grey, lights going out */
  dueGlass: lin('#6F7378'),
};

export const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
