import * as THREE from 'three'
import { buildRiverCurve } from '../world/Paths'
import { lerp, smoothstep } from './math'

// Pre-sample the river ONCE into flat typed arrays — the single source of truth
// for the river's points, bank normals, and width-at-u. River rendering, flow
// particles, and (later) town/forest placement all read this instead of
// re-sampling the CatmullRom independently.
let cached = null

export function getRiverFrame(N = 320) {
  if (cached) return cached
  const curve = buildRiverCurve()
  const pts = curve.getSpacedPoints(N)
  const up = new THREE.Vector3(0, 1, 0)
  const tan = new THREE.Vector3()
  const nor = new THREE.Vector3()
  const points = new Float32Array((N + 1) * 3)
  const normals = new Float32Array((N + 1) * 3)
  const widths = new Float32Array(N + 1)
  for (let i = 0; i <= N; i++) {
    const u = i / N
    curve.getTangentAt(u, tan)
    nor.crossVectors(tan, up).normalize()
    const p = pts[i]
    points[i * 3] = p.x
    points[i * 3 + 1] = p.y
    points[i * 3 + 2] = p.z
    normals[i * 3] = nor.x
    normals[i * 3 + 1] = nor.y
    normals[i * 3 + 2] = nor.z
    // tight at the source, broad downstream, then a dramatic flare into the sea
    widths[i] = lerp(1.2, 13, u * u) + smoothstep(0.78, 1, u) * 24
  }
  cached = { N, points, normals, widths, curve }
  return cached
}

// Interpolated sample at u∈[0,1]. Writes into outPos / outNor (optional) and
// returns the local half-width. No allocation.
export function sampleRiver(frame, u, outPos, outNor) {
  const { N, points, normals, widths } = frame
  const f = Math.min(0.999999, Math.max(0, u)) * N
  const i = Math.floor(f)
  const t = f - i
  const j = Math.min(N, i + 1)
  const a = i * 3
  const b = j * 3
  outPos.set(
    points[a] + (points[b] - points[a]) * t,
    points[a + 1] + (points[b + 1] - points[a + 1]) * t,
    points[a + 2] + (points[b + 2] - points[a + 2]) * t
  )
  if (outNor) {
    outNor.set(
      normals[a] + (normals[b] - normals[a]) * t,
      normals[a + 1] + (normals[b + 1] - normals[a + 1]) * t,
      normals[a + 2] + (normals[b + 2] - normals[a + 2]) * t
    )
  }
  return widths[i] + (widths[j] - widths[i]) * t
}
