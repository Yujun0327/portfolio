import { useMemo } from 'react'
import * as THREE from 'three'
import { COLORS, MODE } from '../data/journey'
import { getRiverFrame } from '../utils/curveSampler'
import { instanceEdges, mergeRingsToSegments } from '../utils/mergeWire'
import { contourRings } from '../utils/geometry'
import { fbm2 } from '../utils/noise'
import { nearStatue } from '../utils/places'

const BLENDING = MODE === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending

// Background landscape fill — faint, low-detail hills, tree clusters and a few
// tiny far villages scattered across the land so the holistic overviews read as
// a whole world. Stays clear of the river channel, the mountain, and the sea.
// Everything merged → 3 draw calls total.
export function Scenery() {
  const { hills, trees, villages } = useMemo(() => {
    const frame = getRiverFrame(320)
    // coarse river sample for "keep clear of the water" tests
    const riverPts = []
    for (let i = 0; i <= frame.N; i += 5) {
      riverPts.push(frame.points[i * 3], frame.points[i * 3 + 2])
    }
    const nearRiver = (x, z, clearance) => {
      for (let i = 0; i < riverPts.length; i += 2) {
        const dx = x - riverPts[i]
        const dz = z - riverPts[i + 1]
        if (dx * dx + dz * dz < clearance * clearance) return true
      }
      return false
    }
    const rejected = (x, z, clearance) =>
      z > 285 || // sea
      (Math.abs(x) < 72 && z < 8) || // mountain massif
      nearStatue(x, z, 14) || // keep monuments clear
      nearRiver(x, z, clearance)

    let s = 271
    const rand = () => ((s = (s * 16807) % 2147483647), s / 2147483647)
    const candidate = () => [(rand() * 2 - 1) * 175, -150 + rand() * 430]

    // --- hills: faint contour mounds, density driven by noise ---
    const hillRings = []
    for (let n = 0, tries = 0; n < 46 && tries < 600; tries++) {
      const [x, z] = candidate()
      if (rejected(x, z, 26)) continue
      if (fbm2(x * 0.012, z * 0.012, 3) < -0.15) continue // leave clearings
      const c = new THREE.Vector3(x, 0, z)
      const r = 7 + rand() * 16
      const rings = contourRings({
        baseRadius: r,
        height: 5 + rand() * 16,
        levels: 4 + Math.floor(rand() * 3),
        segments: 40,
        wobble: 0.5,
        seed: n * 2 + 1,
      })
      rings.forEach((ring) => hillRings.push(ring.map((pt) => pt.clone().add(c))))
      n++
    }
    const hills = mergeRingsToSegments(hillRings)

    // --- tree clusters ---
    const treeUnit = instanceEdges(
      new THREE.EdgesGeometry(new THREE.ConeGeometry(1.4, 4.4, 5)),
      [new THREE.Matrix4().makeTranslation(0, 2.2, 0)]
    )
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const scl = new THREE.Vector3()
    const treeMats = []
    for (let n = 0, tries = 0; n < 34 && tries < 600; tries++) {
      const [cx, cz] = candidate()
      if (rejected(cx, cz, 24)) continue
      const cluster = 3 + Math.floor(rand() * 6)
      for (let k = 0; k < cluster; k++) {
        const x = cx + (rand() - 0.5) * 18
        const z = cz + (rand() - 0.5) * 18
        const sc = 0.6 + rand() * 1.1
        e.set(0, rand() * Math.PI, 0)
        q.setFromEuler(e)
        scl.set(sc, sc, sc)
        treeMats.push(new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), q, scl))
      }
      n++
    }
    const trees = instanceEdges(treeUnit, treeMats)

    // --- a few tiny far villages ---
    const houseUnit = instanceEdges(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 1.6, 2)),
      [new THREE.Matrix4().makeTranslation(0, 0.8, 0)]
    )
    const villMats = []
    for (let n = 0, tries = 0; n < 6 && tries < 300; tries++) {
      const [cx, cz] = candidate()
      if (rejected(cx, cz, 34)) continue
      const count = 3 + Math.floor(rand() * 4)
      for (let k = 0; k < count; k++) {
        const x = cx + (rand() - 0.5) * 12
        const z = cz + (rand() - 0.5) * 12
        e.set(0, rand() * Math.PI, 0)
        q.setFromEuler(e)
        scl.set(1, 1, 1)
        villMats.push(new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), q, scl))
      }
      n++
    }
    const villages = instanceEdges(houseUnit, villMats)

    return { hills, trees, villages }
  }, [])

  return (
    <group>
      <lineSegments geometry={hills}>
        <lineBasicMaterial color={COLORS.line} transparent opacity={0.28} depthWrite={false} blending={BLENDING} />
      </lineSegments>
      <lineSegments geometry={trees}>
        <lineBasicMaterial color={COLORS.line} transparent opacity={0.34} depthWrite={false} blending={BLENDING} />
      </lineSegments>
      <lineSegments geometry={villages}>
        <lineBasicMaterial color={COLORS.line} transparent opacity={0.4} depthWrite={false} blending={BLENDING} />
      </lineSegments>
    </group>
  )
}
