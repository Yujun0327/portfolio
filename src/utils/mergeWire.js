import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Merge an array of line-loops (each an array of Vector3) into ONE LineSegments
// BufferGeometry — expands each loop into segment pairs, then merges. A whole
// contour stack becomes a single draw call.
export function mergeRingsToSegments(rings) {
  const geos = []
  for (const pts of rings) {
    const seg = []
    for (let i = 0; i < pts.length - 1; i++) {
      seg.push(pts[i], pts[i + 1])
    }
    geos.push(new THREE.BufferGeometry().setFromPoints(seg))
  }
  const merged = mergeGeometries(geos, false)
  geos.forEach((g) => g.dispose())
  return merged
}

// Stamp a unit line-segment geometry across many transforms into ONE merged
// BufferGeometry (static "instancing" for wireframes → one draw call). `unitGeo`
// must expose a flat position attribute of segment-pair vertices (e.g. an
// EdgesGeometry, or a geometry produced by mergeRingsToSegments / this fn).
export function instanceEdges(unitGeo, matrices) {
  const src = unitGeo.attributes.position.array
  const n = src.length
  const out = new Float32Array(n * matrices.length)
  const v = new THREE.Vector3()
  for (let m = 0; m < matrices.length; m++) {
    const mat = matrices[m]
    const off = m * n
    for (let i = 0; i < n; i += 3) {
      v.set(src[i], src[i + 1], src[i + 2]).applyMatrix4(mat)
      out[off + i] = v.x
      out[off + i + 1] = v.y
      out[off + i + 2] = v.z
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(out, 3))
  return g
}

// Merge an arbitrary list of line geometries into one.
export const mergeWire = (list) => mergeGeometries(list, false)

