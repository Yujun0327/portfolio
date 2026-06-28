import * as THREE from 'three'
import { getRiverFrame, sampleRiver } from './curveSampler'

// Single source of truth for statue placements, so Towns can render them and the
// terrain layers (forest/cliffs/scenery) can keep clear of them.
export const TOWN_STATUES = [
  { u: 0.3, design: 0, scale: 1, offset: [0, 0, 0] },
  // Project 6 — nudged +X and -Z so it doesn't overlap Project 7 (tune `offset`)
  { u: 0.42, design: 1, scale: 1, offset: [-12, 0, -45] },
  { u: 0.54, design: 2, scale: 1, offset: [0, 0, -20] },
]

export const EXTRA_STATUES = [{ u: 0.36, side: -1, dist: 8, scale: 1, design: 3 }]

let cache = null
export function getStatues() {
  if (cache) return cache
  const frame = getRiverFrame(320)
  const p = new THREE.Vector3()
  const n = new THREE.Vector3()
  const out = []
  TOWN_STATUES.forEach((s) => {
    const w = sampleRiver(frame, s.u, p, n)
    const pos = p.clone().addScaledVector(n, w + 12 * s.scale)
    const o = s.offset || [0, 0, 0]
    out.push({ pos: [pos.x + o[0], pos.y + o[1], pos.z + o[2]], scale: s.scale, design: s.design })
  })
  EXTRA_STATUES.forEach((s) => {
    const w = sampleRiver(frame, s.u, p, n)
    const pos = p.clone().addScaledVector(n, s.side * (w + s.dist))
    out.push({ pos: [pos.x, pos.y, pos.z], scale: s.scale, design: s.design })
  })
  cache = out
  return out
}

// True if (x,z) is within a statue's keep-clear radius (so it stands alone).
export function nearStatue(x, z, radius = 12) {
  const sts = getStatues()
  for (const s of sts) {
    const r = radius + s.scale * 5
    const dx = x - s.pos[0]
    const dz = z - s.pos[2]
    if (dx * dx + dz * dz < r * r) return true
  }
  return false
}
