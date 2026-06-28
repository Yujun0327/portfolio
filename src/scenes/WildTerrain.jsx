import { useMemo } from 'react'
import * as THREE from 'three'
import { COLORS, MODE } from '../data/journey'
import { getRiverFrame, sampleRiver } from '../utils/curveSampler'
import { instanceEdges, mergeRingsToSegments } from '../utils/mergeWire'
import { contourRings } from '../utils/geometry'
import { nearStatue } from '../utils/places'

const BLENDING = MODE === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending

// Forests, contour cliffs and reed wetlands flanking the widening river — the
// geography travelled through on the way to the sea. Everything is merged into a
// few draw calls (forest / cliffs / reeds), each rendered as line segments.
export function WildTerrain() {
  const { forest, cliffs, reeds } = useMemo(() => {
    const frame = getRiverFrame(320)
    const p = new THREE.Vector3()
    const n = new THREE.Vector3()
    let s = 4
    const rand = () => ((s = (s * 16807) % 2147483647), s / 2147483647)

    // --- forest: one tree unit stamped across many transforms ---
    const treeUnit = instanceEdges(
      new THREE.EdgesGeometry(new THREE.ConeGeometry(1.5, 5, 5)),
      [new THREE.Matrix4().makeTranslation(0, 2.5, 0)]
    )
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const scl = new THREE.Vector3()
    const treeMats = []
    for (let i = 0; i < 170; i++) {
      const u = 0.5 + rand() * 0.46
      const w = sampleRiver(frame, u, p, n)
      const side = rand() > 0.5 ? 1 : -1
      const d = w + 4 + rand() * 42
      const pos = p.clone().addScaledVector(n, side * d)
      if (nearStatue(pos.x, pos.z, 12)) continue // let the monuments stand alone
      const sc = 0.7 + rand() * 1.5
      e.set(0, rand() * Math.PI, 0)
      q.setFromEuler(e)
      scl.set(sc, sc, sc)
      treeMats.push(new THREE.Matrix4().compose(new THREE.Vector3(pos.x, pos.y, pos.z), q, scl))
    }
    const forest = instanceEdges(treeUnit, treeMats)

    // --- contour cliffs: noisy ring stacks at a few landmarks ---
    const cliffRings = []
    ;[0.56, 0.68, 0.8, 0.9].forEach((u, k) => {
      const w = sampleRiver(frame, u, p, n)
      const side = k % 2 === 0 ? 1 : -1
      const c = p.clone().addScaledVector(n, side * (w + 22 + k * 8))
      if (nearStatue(c.x, c.z, 18)) return // keep cliffs off the monuments
      const rings = contourRings({
        baseRadius: 9 + k * 2.5,
        height: 12 + k * 4,
        levels: 6,
        segments: 48,
        wobble: 0.55,
        seed: k * 3 + 1,
      })
      rings.forEach((ring) => cliffRings.push(ring.map((pt) => pt.clone().add(c))))
    })
    const cliffs = mergeRingsToSegments(cliffRings)

    // --- reed wetlands: short vertical strokes near the water's edge ---
    const reedVerts = []
    for (let i = 0; i < 140; i++) {
      const u = 0.55 + rand() * 0.4
      const w = sampleRiver(frame, u, p, n)
      const side = rand() > 0.5 ? 1 : -1
      const off = w + rand() * 5
      const x = p.x + n.x * side * off
      const z = p.z + n.z * side * off
      const h = 0.8 + rand() * 1.6
      reedVerts.push(x, p.y, z, x + (rand() - 0.5) * 0.5, p.y + h, z + (rand() - 0.5) * 0.5)
    }
    const reeds = new THREE.BufferGeometry()
    reeds.setAttribute('position', new THREE.BufferAttribute(new Float32Array(reedVerts), 3))

    return { forest, cliffs, reeds }
  }, [])

  return (
    <group>
      <lineSegments geometry={forest}>
        <lineBasicMaterial color={COLORS.line} transparent opacity={0.6} depthWrite={false} blending={BLENDING} />
      </lineSegments>
      <lineSegments geometry={cliffs}>
        <lineBasicMaterial color={COLORS.line} transparent opacity={0.45} depthWrite={false} blending={BLENDING} />
      </lineSegments>
      <lineSegments geometry={reeds}>
        <lineBasicMaterial color={COLORS.line} transparent opacity={0.4} depthWrite={false} blending={BLENDING} />
      </lineSegments>
    </group>
  )
}
