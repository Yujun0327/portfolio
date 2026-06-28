import * as THREE from 'three'

// Fade a whole scene group by writing opacity onto every line material it
// holds, toggling visibility off entirely when fully transparent (free culling).
export function setGroupOpacity(group, opacity) {
  if (!group) return
  const visible = opacity > 0.001
  group.visible = visible
  if (!visible) return
  group.traverse((o) => {
    if (o.material && 'opacity' in o.material) {
      o.material.transparent = true
      o.material.opacity = opacity
    }
  })
}

// Crisp silhouette edges of any geometry (hard edges only).
export const edgesOf = (geometry, thresholdDeg = 1) =>
  new THREE.EdgesGeometry(geometry, thresholdDeg)

// A single closed ring of points in the XZ plane at height y. Optional radial
// `wobble` breaks the perfect circle for organic islands/contours.
export function ringPoints(radius, y = 0, segments = 64, wobble = 0, seed = 0) {
  const pts = []
  for (let s = 0; s <= segments; s++) {
    const a = (s / segments) * Math.PI * 2
    const r = radius * (1 + wobble * Math.sin(a * 3 + seed) * 0.5)
    pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r))
  }
  return pts
}

// Stacked contour rings approximating a cone — the topographic "map" look.
// Returns an array of point-arrays (one per ring) for rendering as <Line>s.
// (Milestone 3 will merge these into a single buffer for performance.)
export function contourRings({
  baseRadius = 20,
  height = 40,
  levels = 9,
  segments = 64,
  wobble = 0,
  seed = 0,
}) {
  const rings = []
  for (let i = 0; i < levels; i++) {
    const t = i / (levels - 1)
    const y = t * height
    const r = baseRadius * (1 - t)
    if (r < 0.05) continue
    rings.push(ringPoints(r, y, segments, wobble, seed + i))
  }
  return rings
}
