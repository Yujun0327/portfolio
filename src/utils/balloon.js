import * as THREE from 'three'
import { mergeWire } from './mergeWire'

// A wireframe hot-air balloon: onion envelope (gores + rings), decorative band +
// pennant skirt, basket with rigging, a burner flame, sandbags, and a top flag.
// One merged line geometry. Origin at the basket bottom (y=0).

const V = (x, y, z) => new THREE.Vector3(x, y, z)
function strip(pts) {
  const seg = []
  for (let i = 0; i < pts.length - 1; i++) seg.push(pts[i], pts[i + 1])
  return new THREE.BufferGeometry().setFromPoints(seg)
}
const loop = (pts) => strip([...pts, pts[0]])

export function buildBalloon() {
  const parts = []
  const R = 11
  const yMouth = 10
  const yTop = 34
  const LEV = 9
  const GORES = 12
  const SEG = 30
  const prof = (tt) => R * Math.sin(Math.PI * (0.1 + 0.75 * tt))

  const rings = []
  for (let l = 0; l <= LEV; l++) {
    const tt = l / LEV
    rings.push({ y: yMouth + (yTop - yMouth) * tt, r: prof(tt) })
  }
  const ringAt = (y) => {
    const tt = (y - yMouth) / (yTop - yMouth)
    return prof(Math.max(0, Math.min(1, tt)))
  }

  // horizontal rings
  for (const { y, r } of rings) {
    const pts = []
    for (let st = 0; st <= SEG; st++) {
      const a = (st / SEG) * Math.PI * 2
      pts.push(V(Math.cos(a) * r, y, Math.sin(a) * r))
    }
    parts.push(strip(pts))
  }
  // vertical gores
  for (let g = 0; g < GORES; g++) {
    const a = (g / GORES) * Math.PI * 2
    parts.push(strip(rings.map(({ y, r }) => V(Math.cos(a) * r, y, Math.sin(a) * r))))
  }

  // --- decorative zigzag band around the widest part ---
  const yA = rings[4].y
  const yB = rings[5].y
  const zz = []
  const ZN = 36
  for (let st = 0; st <= ZN; st++) {
    const a = (st / ZN) * Math.PI * 2
    const y = st % 2 === 0 ? yA : yB
    const r = ringAt(y)
    zz.push(V(Math.cos(a) * r, y, Math.sin(a) * r))
  }
  parts.push(strip(zz))

  // --- pennant skirt hanging from the mouth ring ---
  const mouthR = prof(0)
  const SK = 12
  for (let i = 0; i < SK; i++) {
    const a0 = (i / SK) * Math.PI * 2
    const a1 = ((i + 1) / SK) * Math.PI * 2
    const am = (a0 + a1) / 2
    parts.push(
      strip([
        V(Math.cos(a0) * mouthR, yMouth, Math.sin(a0) * mouthR),
        V(Math.cos(am) * (mouthR + 0.3), yMouth - 2.6, Math.sin(am) * (mouthR + 0.3)),
        V(Math.cos(a1) * mouthR, yMouth, Math.sin(a1) * mouthR),
      ])
    )
  }

  // --- basket + rigging ---
  const basket = new THREE.EdgesGeometry(new THREE.BoxGeometry(4, 3, 4))
  basket.translate(0, 1.5, 0)
  parts.push(basket)
  const bk = 1.7
  ;[
    [bk, bk],
    [bk, -bk],
    [-bk, bk],
    [-bk, -bk],
  ].forEach(([cx, cz]) => {
    const ang = Math.atan2(cz, cx)
    parts.push(strip([V(cx, 3, cz), V(Math.cos(ang) * mouthR, yMouth, Math.sin(ang) * mouthR)]))
  })

  // --- burner flame above the basket ---
  parts.push(strip([V(-0.9, 4, 0), V(0, 7.5, 0), V(0.9, 4, 0)]))
  parts.push(strip([V(0, 4, -0.9), V(0, 7.5, 0), V(0, 4, 0.9)]))
  parts.push(strip([V(-0.45, 4.5, 0), V(0, 6, 0), V(0.45, 4.5, 0)]))

  // --- sandbags hanging from two corners ---
  ;[
    [bk, bk],
    [-bk, -bk],
  ].forEach(([cx, cz]) => {
    parts.push(strip([V(cx, 0.6, cz), V(cx, -2, cz)]))
    const bag = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1.4, 1))
    bag.translate(cx, -2.7, cz)
    parts.push(bag)
  })

  // --- little flag on a pole at the top ---
  parts.push(strip([V(0, yTop, 0), V(0, yTop + 3.5, 0)]))
  parts.push(loop([V(0, yTop + 3.5, 0), V(3, yTop + 2.9, 0), V(0, yTop + 2.3, 0)]))

  return mergeWire(parts)
}

let cache = null
export function balloonGeometry() {
  if (!cache) cache = buildBalloon()
  return cache
}
