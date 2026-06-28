import * as THREE from 'three'
import { mergeWire } from './mergeWire'

// Detailed wireframe sailing boats at a small-village tech level. Each builder
// returns ONE merged line-segment BufferGeometry, origin at the waterline centre,
// bow toward +X. Built from hull cross-section ribs + rigging + billowed sails.

const V = (x, y, z) => new THREE.Vector3(x, y, z)

// open polyline -> segment-pair geometry
function strip(pts) {
  const seg = []
  for (let i = 0; i < pts.length - 1; i++) seg.push(pts[i], pts[i + 1])
  return new THREE.BufferGeometry().setFromPoints(seg)
}
const loop = (pts) => strip([...pts, pts[0]])

function boxEdges(w, h, d, cx, cy, cz) {
  const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d))
  g.translate(cx, cy, cz)
  return g
}

// leaf-shaped hull: ribs at stations + port/starboard gunwales + keel
function buildHull({ L, B, D, deck, bowSheer, stations = 7 }) {
  const parts = []
  const beam = (x) => {
    const t = x / (L / 2)
    const s = Math.sqrt(Math.max(0, 1 - t * t))
    const bowTaper = x > 0 ? 1 - 0.35 * t : 1
    return B * s * bowTaper
  }
  const keelY = (x) => {
    const t = x / (L / 2)
    return -D + D * 0.55 * t * t
  }
  const gunY = (x) => {
    const t = x / (L / 2)
    return deck + bowSheer * Math.max(0, t) + bowSheer * 0.4 * Math.max(0, -t)
  }
  const portTop = []
  const starTop = []
  const keelLine = []
  for (let i = 0; i < stations; i++) {
    const x = -L / 2 + (i / (stations - 1)) * L
    const b = beam(x)
    const ky = keelY(x)
    const gy = gunY(x)
    parts.push(strip([V(x, gy, b), V(x, ky, 0), V(x, gy, -b)]))
    portTop.push(V(x, gy, b))
    starTop.push(V(x, gy, -b))
    keelLine.push(V(x, ky, 0))
  }
  parts.push(strip(portTop), strip(starTop), strip(keelLine))
  return { parts, gunY }
}

// a billowed square sail on a yard, bulging toward +X
function squareSail({ x, yardY, half, bottomY, billow }) {
  const parts = []
  parts.push(strip([V(x, yardY, -half), V(x, yardY, half)])) // yard
  const bh = half * 0.86
  parts.push(
    loop([
      V(x, yardY, half),
      V(x + billow, yardY, 0),
      V(x, yardY, -half),
      V(x, bottomY, -bh),
      V(x + billow * 0.7, bottomY, 0),
      V(x, bottomY, bh),
    ])
  )
  // centre seam
  parts.push(strip([V(x + billow, yardY, 0), V(x + billow * 0.7, bottomY, 0)]))
  return parts
}

function mast({ x, gunY, top }) {
  return strip([V(x, gunY(x), 0), V(x, top, 0)])
}

function pennant({ x, top }) {
  return loop([V(x, top, 0), V(x + 1.6, top + 0.5, 0), V(x, top + 0.9, 0)])
}

function rigging({ x, top, L, gunY }) {
  const t = V(x, top, 0)
  return [
    strip([t, V(L / 2 - 0.3, gunY(L / 2 - 0.3) - 0.1, 0)]), // forestay -> bow
    strip([t, V(-L / 2 + 0.3, gunY(-L / 2 + 0.3) - 0.1, 0)]), // backstay -> stern
    strip([t, V(x, gunY(x), 1.4)]), // shroud
    strip([t, V(x, gunY(x), -1.4)]),
  ]
}

// --- 3 designs ---
function design0() {
  const L = 10
  const { parts, gunY } = buildHull({ L, B: 1.6, D: 1.4, deck: 0.7, bowSheer: 0.5 })
  const x = 0.6
  const top = 7
  parts.push(mast({ x, gunY, top }))
  parts.push(...squareSail({ x, yardY: top - 1, half: 2.3, bottomY: 1.6, billow: 0.7 }))
  parts.push(...rigging({ x, top, L, gunY }))
  parts.push(pennant({ x, top }))
  return mergeWire(parts)
}

function design1() {
  const L = 12
  const { parts, gunY } = buildHull({ L, B: 1.9, D: 1.6, deck: 0.8, bowSheer: 0.6 })
  // fore + main masts
  parts.push(mast({ x: -2, gunY, top: 6 }))
  parts.push(...squareSail({ x: -2, yardY: 5.2, half: 1.9, bottomY: 1.7, billow: 0.6 }))
  parts.push(mast({ x: 1.8, gunY, top: 8 }))
  parts.push(...squareSail({ x: 1.8, yardY: 7, half: 2.5, bottomY: 1.8, billow: 0.8 }))
  parts.push(...rigging({ x: 1.8, top: 8, L, gunY }))
  parts.push(pennant({ x: 1.8, top: 8 }))
  return mergeWire(parts)
}

function design2() {
  const L = 9
  const { parts, gunY } = buildHull({ L, B: 1.5, D: 1.3, deck: 0.7, bowSheer: 0.4 })
  const x = 0.2
  const top = 7.5
  parts.push(mast({ x, gunY, top }))
  // lateen (triangular) sail on a slanted yard
  parts.push(
    loop([V(x + 1.4, 1.4, 0), V(x - 0.4, top, 0), V(x - 2.6, 1.7, 0)])
  )
  parts.push(strip([V(x - 0.4, top, 0), V(x - 1.0, 4.0, 0)])) // batten
  // small cabin box at the stern
  parts.push(boxEdges(2.2, 1.3, 2.0, -2.7, gunY(-2.7) + 0.6, 0))
  parts.push(...rigging({ x, top, L, gunY }))
  parts.push(pennant({ x, top }))
  return mergeWire(parts)
}

const BUILDERS = [design0, design1, design2]
const cache = []
export function shipGeometry(design = 0) {
  const d = design % BUILDERS.length
  if (!cache[d]) cache[d] = BUILDERS[d]()
  return cache[d]
}
export const SHIP_DESIGN_COUNT = BUILDERS.length
