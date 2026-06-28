import { useMemo } from 'react'
import * as THREE from 'three'
import { LANDMARKS, COLORS, MODE } from '../data/journey'
import { fbm2 } from '../utils/noise'
import { mergeRingsToSegments } from '../utils/mergeWire'

const BLENDING = MODE === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending

// Build a topographic peak as stacked, noise-perturbed contour rings. Coherent
// angular noise gives the mountain consistent ridges/gullies up its whole height
// (the "3D map" look). The whole stack is merged into ONE LineSegments buffer.
function buildPeakGeometry({ baseRadius, height, levels, segments, roughness, seed }) {
  const rings = []
  for (let l = 0; l < levels; l++) {
    const t = l / (levels - 1)
    const y = t * height
    const baseR = baseRadius * (1 - t) * (1 - t * 0.15) // slightly concave slope
    if (baseR < 0.4) break
    const pts = []
    for (let s = 0; s <= segments; s++) {
      const a = (s / segments) * Math.PI * 2
      // angular noise shared across heights = coherent ridges; small height term
      // lets the silhouette wander as it rises
      const nr = fbm2(Math.cos(a) * 1.1 + seed, Math.sin(a) * 1.1 + seed * 0.5 + t * 0.7, 3)
      const r = baseR * (1 + roughness * nr)
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r))
    }
    rings.push(pts)
  }
  return mergeRingsToSegments(rings)
}

function Peak({ baseRadius, height, levels, segments, roughness = 0.16, dim = 1, seed = 0, position }) {
  const geo = useMemo(
    () => buildPeakGeometry({ baseRadius, height, levels, segments, roughness, seed }),
    [baseRadius, height, levels, segments, roughness, seed]
  )
  return (
    <lineSegments geometry={geo} position={position}>
      <lineBasicMaterial
        color={COLORS.line}
        transparent
        opacity={0.85 * dim}
        depthWrite={false}
        blending={BLENDING}
      />
    </lineSegments>
  )
}

// Hero mountain + a background range fanned left/right and stepped back (kept
// lower so it never blocks the centre) + foothills flanking the descent. Distant
// peaks get fewer rings/segments (LOD) and fainter lines. Always present.
export function Mountain() {
  const base = LANDMARKS.mountainBase
  return (
    <group position={[base[0], base[1], base[2]]}>
      {/* hero — full detail */}
      <Peak baseRadius={32} height={56} levels={22} segments={120} roughness={0.17} seed={3} position={[0, 0, 0]} />

      {/* background range — LOD: fewer rings/segments, fainter */}
      <Peak baseRadius={24} height={36} levels={12} segments={72} roughness={0.22} dim={0.5} seed={11} position={[-72, 0, -40]} />
      <Peak baseRadius={26} height={40} levels={12} segments={72} roughness={0.2} dim={0.5} seed={17} position={[74, 0, -48]} />
      <Peak baseRadius={20} height={28} levels={9} segments={56} roughness={0.24} dim={0.34} seed={23} position={[-44, 0, -110]} />
      <Peak baseRadius={22} height={30} levels={9} segments={56} roughness={0.24} dim={0.34} seed={29} position={[50, 0, -120]} />
      <Peak baseRadius={28} height={26} levels={8} segments={56} roughness={0.26} dim={0.22} seed={31} position={[2, 0, -170]} />

      {/* foothills flanking the descent to the river */}
      <Peak baseRadius={16} height={20} levels={9} segments={56} roughness={0.28} dim={0.5} seed={5} position={[-50, 0, 6]} />
      <Peak baseRadius={14} height={16} levels={8} segments={48} roughness={0.3} dim={0.42} seed={7} position={[52, 0, 20]} />
      <Peak baseRadius={12} height={13} levels={7} segments={48} roughness={0.32} dim={0.34} seed={13} position={[-40, 0, 64]} />
    </group>
  )
}
