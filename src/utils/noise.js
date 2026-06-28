import { createNoise2D, createNoise3D } from 'simplex-noise'

// Deterministic PRNG so the world is identical every load (simplex-noise v4
// defaults to Math.random, which we don't want).
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const makeRng = (seed = 1) => mulberry32(seed)

const rng = mulberry32(1337)
export const noise2D = createNoise2D(rng)
export const noise3D = createNoise3D(rng)

// Fractal brownian motion (layered noise) in 2D → [-~1, ~1].
export function fbm2(x, y, octaves = 4, lacunarity = 2, gain = 0.5) {
  let amp = 0.5
  let freq = 1
  let sum = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2D(x * freq, y * freq)
    freq *= lacunarity
    amp *= gain
  }
  return sum
}
