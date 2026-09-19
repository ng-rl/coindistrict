/**
 * Deterministic seeded RNG (mulberry32-style).
 * Inspired by BuildingGeneratorThreeJS hash(id, seed) patterns — not a fork.
 */
export function hashString(input: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function createRng(seed: string) {
  let state = hashString(seed) || 1
  return function next(): number {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length) % items.length]
}

export function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}
