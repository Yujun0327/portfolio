// Small math helpers shared across the world.

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v))

export const lerp = (a, b, t) => a + (b - a) * t

export const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

// Remap x from [inMin,inMax] to [outMin,outMax].
export const mapRange = (x, inMin, inMax, outMin, outMax) =>
  outMin + ((x - inMin) / (inMax - inMin)) * (outMax - outMin)

// Map a global scroll offset to a scene-local 0..1 phase, plus an `active`
// flag (with a fade margin) so a scene can cheaply toggle visibility.
export const scenePhase = (offset, [start, end], fade = 0.03) => {
  const raw = (offset - start) / (end - start)
  return {
    phase: clamp(raw, 0, 1),
    raw,
    active: offset > start - fade && offset < end + fade,
  }
}

// Opacity envelope for a scene given its raw (un-clamped) phase: ramps in over
// the first `f` and out over the last `f` of the [0,1] range, 0 outside it.
export const sceneFade = (raw, f = 0.2) => {
  if (raw <= 0 || raw >= 1) return 0
  return Math.min(smoothstep(0, f, raw), smoothstep(1, 1 - f, raw))
}
