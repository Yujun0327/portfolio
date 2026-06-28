import * as THREE from 'three'
import { mergeWire } from './mergeWire'

// A wireframe HUMPBACK whale (혹등고래). Signature cues: very long knobbly
// pectoral fins (~1/3 body length), a dorsal fin sitting on a hump ~2/3 back,
// tubercles (bumps) on the head, throat pleats, and broad scalloped tail flukes.
// One merged line-segment geometry; origin at body centre, head toward +X.

const V = (x, y, z) => new THREE.Vector3(x, y, z)
function strip(pts) {
  const seg = []
  for (let i = 0; i < pts.length - 1; i++) seg.push(pts[i], pts[i + 1])
  return new THREE.BufferGeometry().setFromPoints(seg)
}
const loop = (pts) => strip([...pts, pts[0]])

export function buildWhale() {
  const L = 46
  const R = 7
  const half = L / 2
  const parts = []

  // BLUNT broad head, robust body holding fullness to mid, slim tail stock. The
  // front station has real radius (a blunt face) so the head isn't a point.
  const STN = [
    [1.0, 0.45], // blunt face
    [0.9, 0.62],
    [0.78, 0.8],
    [0.6, 0.95],
    [0.38, 1.0], // fullest (chest)
    [0.1, 0.95],
    [-0.18, 0.74],
    [-0.42, 0.52],
    [-0.62, 0.34],
    [-0.78, 0.2],
    [-0.9, 0.11], // peduncle
  ]
  const humpAt = -0.36
  const humpY = (t) => Math.max(0, 1 - Math.abs((t - humpAt) / 0.16)) * 1.8 // the "hump"
  // broaden the head horizontally (humpbacks are broad & flat-topped up front)
  const widen = (t) => 0.9 + 0.42 * Math.max(0, (t - 0.3) / 0.7)
  const radAt = (t) => {
    let best = STN[0]
    for (const s of STN) if (Math.abs(s[0] - t) < Math.abs(best[0] - t)) best = s
    return R * best[1]
  }

  const top = []
  const bot = []
  const sideP = []
  const sideS = []
  const SEG = 20
  for (const [t, m] of STN) {
    const x = t * half
    const ry = R * m
    const rz = R * m * widen(t)
    const bump = humpY(t)
    const flatTop = t > 0.55 ? 0.82 : 1 // flatter-topped head
    const ring = []
    for (let s = 0; s <= SEG; s++) {
      const a = (s / SEG) * Math.PI * 2
      const sa = Math.sin(a)
      // asymmetric profile: arched back (+hump) vs FLATTER belly (×0.74)
      const y = sa > 0 ? sa * ry * flatTop + bump * sa : sa * ry * 0.74
      ring.push(V(x, y, Math.cos(a) * rz))
    }
    parts.push(strip(ring))
    top.push(V(x, ry * flatTop + bump, 0))
    bot.push(V(x, -ry * 0.74, 0))
    sideP.push(V(x, 0, rz))
    sideS.push(V(x, 0, -rz))
  }
  parts.push(strip(top), strip(bot), strip(sideP), strip(sideS))

  // long mouth / gape line down each side of the head, dipping at the corner
  ;[1, -1].forEach((sgn) => {
    const m = []
    for (const t of [1.0, 0.82, 0.6, 0.36, 0.12]) {
      const dip = t < 0.55 ? R * 0.12 : 0
      m.push(V(t * half, -R * 0.22 - dip, sgn * radAt(t) * widen(t) * 0.8))
    }
    parts.push(strip(m))
  })

  // rounded lower-jaw / chin pouch under the throat
  parts.push(
    loop([
      V(0.92 * half, -R * 0.4, 1.6),
      V(0.7 * half, -R * 0.95 - 2.2, 0),
      V(0.92 * half, -R * 0.4, -1.6),
      V(0.5 * half, -R * 0.72, 0),
    ])
  )

  // --- dorsal fin on the hump (small, slightly falcate, swept back) ---
  const dx = humpAt * half
  const dyTop = radAt(humpAt) + humpY(humpAt)
  parts.push(loop([V(dx + 1.6, dyTop - 0.2, 0), V(dx + 0.2, dyTop + 3.2, 0), V(dx - 2.6, dyTop + 1.6, 0), V(dx - 1.0, dyTop + 0.1, 0)]))

  // --- the long knobbly pectoral fins (the defining feature) ---
  const pectoral = (side) => {
    const P0 = V(0.34 * half, -1.6, side * radAt(0.34) * widen(0.34) * 0.95)
    const axis = new THREE.Vector3(-0.12, -0.13, side).normalize() // out, slightly back & down
    const wAxis = new THREE.Vector3(1, 0, 0) // fore-aft width
    const finLen = 16.5
    const maxW = 2.6
    const N = 16
    const lead = []
    const trail = []
    for (let i = 0; i <= N; i++) {
      const f = i / N
      const a = f * finLen
      const w = maxW * Math.sqrt(Math.max(0, Math.sin(Math.PI * (0.12 + 0.85 * f))))
      const knob = f < 0.62 ? Math.max(0, Math.sin(f * Math.PI * 7)) * 0.5 : 0 // tubercles on the leading edge
      lead.push(P0.clone().addScaledVector(axis, a).addScaledVector(wAxis, w / 2 + knob))
      trail.push(P0.clone().addScaledVector(axis, a).addScaledVector(wAxis, -w / 2))
    }
    return loop([...lead, ...trail.reverse()])
  }
  parts.push(pectoral(1), pectoral(-1))

  // --- broad scalloped tail flukes with a centre notch ---
  const tx = -half
  const span = 14
  const flukePts = []
  flukePts.push(V(tx, 0, 0)) // tail stock
  flukePts.push(V(tx - 2.8, 1.4, span)) // left tip
  const sc = 5
  for (let i = 1; i <= sc; i++) {
    const f = i / sc
    const scallop = Math.sin(f * Math.PI * sc) * 0.55
    flukePts.push(V(tx - 1.4 - scallop, 0.3 + 0.4 * (1 - f), span * (1 - f)))
  }
  flukePts.push(V(tx - 0.7, 0.2, 0)) // centre notch
  for (let i = 1; i <= sc; i++) {
    const f = i / sc
    const scallop = Math.sin(f * Math.PI * sc) * 0.55
    flukePts.push(V(tx - 1.4 - scallop, 0.3 + 0.4 * f, -span * f))
  }
  flukePts.push(V(tx - 2.8, 1.4, -span)) // right tip
  parts.push(loop(flukePts))

  // --- throat / ventral pleats ---
  for (let k = 0; k < 5; k++) {
    const z = (k - 2) * 1.0
    parts.push(strip([V(0.66 * half, -R * 0.28, z * 0.4), V(0.3 * half, -R * 0.78, z), V(0, -R * 0.5, z)]))
  }

  // --- head tubercles (knobs on the rostrum) ---
  for (let k = 0; k < 6; k++) {
    const x = (0.52 + 0.46 * (k / 5)) * half
    const y = R * (0.32 + 0.05 * k)
    const z = (k % 2 === 0 ? 1 : -1) * 0.7
    const ring = []
    for (let s = 0; s <= 5; s++) {
      const a = (s / 5) * Math.PI * 2
      ring.push(V(x + Math.cos(a) * 0.45, y + Math.sin(a) * 0.45, z))
    }
    parts.push(strip(ring))
  }

  // --- eyes ---
  ;[1, -1].forEach((sgn) => {
    const e = []
    for (let s = 0; s <= 8; s++) {
      const a = (s / 8) * Math.PI * 2
      e.push(V(0.58 * half + Math.cos(a) * 0.5, 0.6 + Math.sin(a) * 0.5, sgn * radAt(0.58) * widen(0.58) * 0.82))
    }
    parts.push(strip(e))
  })

  return mergeWire(parts)
}

let cache = null
export function whaleGeometry() {
  if (!cache) cache = buildWhale()
  return cache
}
