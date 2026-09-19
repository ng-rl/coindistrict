import { PlotData, isCoinPlot, isLotPlot } from '../types';
import { AD_HEIGHT, H_MAX, H_MIN, LOT_HEIGHT, PLOT_SPACING } from './constants';

export interface TowerSegment {
  y: number;
  h: number;
  w: number;
  d: number;
}

export interface TowerSpec {
  index: number;
  plot: PlotData;
  x: number;
  width: number;
  depth: number;
  height: number;
  kind: 'paid' | 'due' | 'ad' | 'lot';
  seed: number;
  /** antenna height above the roof (0 = none) */
  mast: number;
  segments: TowerSegment[];
}

/** Deterministic hash → [0,1) so the skyline is stable across renders. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

export function mulberry32(seed: number) {
  let a = Math.floor(seed * 4294967296) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * HEIGHT model (Fran): raw = log10(volume + ε); normalise across the street; lerp(H_MIN, H_MAX).
 * Continuous, so it still feels like data, but BTC no longer erases the mid-street.
 */
export function heightsForStreet(plots: PlotData[]): Map<string, number> {
  const coins = plots.filter(isCoinPlot);
  // normalise over plots with on-chain data; tenants without data stand at base height
  const withData = coins.filter((c) => c.volume24h > 0);
  const raws = withData.map((c) => Math.log10(c.volume24h + 1));
  const min = raws.length ? Math.min(...raws) : 0;
  const max = raws.length ? Math.max(...raws) : 1;
  const span = Math.max(max - min, 1e-6);
  const out = new Map<string, number>();
  coins.forEach((c) => out.set(c.id, H_MIN));
  withData.forEach((c, i) => {
    const t = (raws[i] - min) / span;
    // gentle ease so the top of the street reads tall without flattening the middle
    const eased = Math.pow(t, 0.85);
    out.set(c.id, H_MIN + (H_MAX - H_MIN) * eased);
  });
  return out;
}

export function buildTowers(plots: PlotData[]): TowerSpec[] {
  const heights = heightsForStreet(plots);
  return plots.map((plot, index) => {
    const seed = hashString(plot.id);
    const rnd = mulberry32(seed);
    const isAd = !isCoinPlot(plot) && !isLotPlot(plot);
    const isLot = isLotPlot(plot);
    const height = isLot ? LOT_HEIGHT : isAd ? AD_HEIGHT : heights.get(plot.id) ?? H_MIN;
    const tall = (height - H_MIN) / (H_MAX - H_MIN);

    // footprint: a touch of mass for the top of the street, otherwise seeded variety
    const width = isLot ? 2.4 : isAd ? 2.5 : 1.55 + rnd() * 0.5 + tall * 0.45;
    const depth = isLot ? 2.0 : isAd ? 1.7 : 1.55 + rnd() * 0.5 + tall * 0.25;

    const segments: TowerSegment[] = [];
    const style = rnd();
    if (!isAd && !isLot && height > 7 && style < 0.55) {
      // setback tower: wide base, slimmer shaft
      const baseH = height * (0.28 + rnd() * 0.18);
      segments.push({ y: 0, h: baseH, w: width, d: depth });
      segments.push({ y: baseH, h: height - baseH, w: width * (0.68 + rnd() * 0.14), d: depth * (0.7 + rnd() * 0.15) });
    } else if (!isAd && !isLot && height > 9 && style < 0.8) {
      // stepped crown
      const shaftH = height * 0.86;
      segments.push({ y: 0, h: shaftH, w: width, d: depth });
      segments.push({ y: shaftH, h: height - shaftH, w: width * 0.6, d: depth * 0.6 });
    } else {
      segments.push({ y: 0, h: height, w: width, d: depth });
    }

    const kind: TowerSpec['kind'] = isLot ? 'lot' : !isCoinPlot(plot) ? 'ad' : plot.rentStatus === 'PAID' ? 'paid' : 'due';
    const mast = !isAd && !isLot && height > 9.5 && seed > 0.35 ? 0.6 + seed * 1.2 : 0;
    return { index, plot, x: index * PLOT_SPACING, width, depth, height, kind, seed, mast, segments };
  });
}

export function streetLength(count: number) {
  return Math.max(0, count - 1) * PLOT_SPACING;
}
