import * as THREE from 'three'
import { instanceEdges, mergeWire } from './mergeWire'

// Bespoke monumental outline figures, assembled from primitive edges. Each
// returns ONE merged line-segment BufferGeometry, base at y=0, ~10 units tall.
// Simple, geometric, mythic — not realistic.

const E = (geo) => new THREE.EdgesGeometry(geo)
const mat = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(sx, sy, sz)
  )

// reusable primitive edge units
const torso = E(new THREE.CylinderGeometry(0.5, 0.9, 6, 6))
const head = E(new THREE.IcosahedronGeometry(0.9, 0))
const limb = E(new THREE.BoxGeometry(0.4, 3, 0.4))
const ring = E(new THREE.TorusGeometry(1.4, 0.12, 6, 28))
const plinth = E(new THREE.BoxGeometry(3, 1.2, 3))
const vessel = E(new THREE.CylinderGeometry(0.9, 0.7, 1.4, 8))
const arch = E(new THREE.BoxGeometry(0.5, 8, 0.5))

function assemble(parts) {
  return mergeWire(parts.map(([geo, m]) => instanceEdges(geo, [m])))
}

// figure holding a circle overhead — the "source" keeper
function holdCircle() {
  return assemble([
    [plinth, mat(0, 0.6, 0)],
    [torso, mat(0, 4.2, 0)],
    [head, mat(0, 7.8, 0)],
    [limb, mat(-0.8, 6.6, 0, 0, 0, 0.5)],
    [limb, mat(0.8, 6.6, 0, 0, 0, -0.5)],
    [ring, mat(0, 9.6, 0, Math.PI / 2, 0, 0)],
  ])
}

// figure pointing downstream — one arm extended forward (+Z)
function pointing() {
  return assemble([
    [plinth, mat(0, 0.6, 0)],
    [torso, mat(0, 4.2, 0)],
    [head, mat(0, 7.8, 0)],
    [limb, mat(0, 6.4, 1.4, Math.PI / 2, 0, 0)],
  ])
}

// figure carrying a vessel of water
function vesselBearer() {
  return assemble([
    [plinth, mat(0, 0.6, 0)],
    [torso, mat(0, 4.2, 0)],
    [head, mat(0, 7.8, 0)],
    [vessel, mat(1.2, 5.2, 0, 0, 0, 0.3)],
    [limb, mat(0.7, 5.4, 0, 0, 0, -0.4)],
  ])
}

// tall figure standing between two arches
function betweenArches() {
  return assemble([
    [plinth, mat(0, 0.6, 0)],
    [torso, mat(0, 4.4, 0, 0, 0, 0)],
    [head, mat(0, 8, 0)],
    [arch, mat(-2.2, 4, 0)],
    [arch, mat(2.2, 4, 0)],
  ])
}

const BUILDERS = [holdCircle, pointing, vesselBearer, betweenArches]

// cache one geometry per design
const cache = []
export function statueGeometry(design = 0) {
  const d = design % BUILDERS.length
  if (!cache[d]) cache[d] = BUILDERS[d]()
  return cache[d]
}

export const STATUE_DESIGN_COUNT = BUILDERS.length
