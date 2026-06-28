import { useMemo, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LANDMARKS, COLORS, MODE } from '../data/journey'
import { scrollStore } from '../hooks/scrollStore'
import { finaleProgress, skyPoint, SKY_TOP, MOON_RISE_ANGLE } from '../utils/finale'
import { lerp } from '../utils/math'

const BLENDING = MODE === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending
const R = LANDMARKS.sunRadius * 0.92

// the sky dims toward this dusk tone (subtly)
const DUSK = new THREE.Color('#c2c5d4')
const DIM = 0.55

const V = (x, y, z) => new THREE.Vector3(x, y, z)
const strip = (pts) => {
  const s = []
  for (let i = 0; i < pts.length - 1; i++) s.push(pts[i], pts[i + 1])
  return new THREE.BufferGeometry().setFromPoints(s)
}

// ---- ambient star field --------------------------------------------------
// A scattered dust of star dots (deterministic pseudo-scatter, both sides of the
// sky) so the finale reads clearly as night. Off-frustum dots are simply clipped.
const FIELD = []
for (let i = 0; i < 38; i++) {
  const a = Math.sin(i * 12.9898) * 43758.5453
  const b = Math.sin(i * 78.233) * 12543.123
  const rx = a - Math.floor(a)
  const ry = b - Math.floor(b)
  const x = (rx - 0.5) * 380 // −190 … 190 (both directions)
  const y = 58 + ry * 108 // 58 … 166 (upper sky only)
  const z = 60 + ((i * 53) % 100) * 3 // 60 … 360 depth spread
  // keep the immediate halo around the moon's resting spot clear
  if (Math.abs(x) < 22 && Math.abs(y - 152) < 22) continue
  FIELD.push([x, y, z])
}

// 3 little constellations (pts + edges) in distinct corners of the sky.
const CONSTELLATIONS = [
  {
    // a "W" up and to the right
    pts: [
      [82, 122, 200],
      [101, 137, 202],
      [121, 116, 200],
      [141, 139, 202],
      [161, 119, 200],
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    // a bent "dipper" up and to the left
    pts: [
      [-152, 114, 222],
      [-131, 128, 222],
      [-110, 119, 220],
      [-94, 134, 222],
      [-90, 152, 226],
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    // a small triangle, centre-right (clear of the moon)
    pts: [
      [30, 110, 150],
      [66, 119, 150],
      [48, 95, 150],
    ],
    edges: [[0, 1], [1, 2], [2, 0]],
  },
]

// Night finale: a simple crescent (초승달) rises along the celestial circle to the
// sun's old spot, an ambient star field + constellations fade in, and the sky
// dims a touch. No craters — just clean arcs and dots.
export function NightFinale() {
  const moonGroup = useRef()
  const moonMat = useRef()
  const dotMat = useRef()
  const linkMat = useRef()
  const scene = useThree((s) => s.scene)
  const scratch = useMemo(() => new THREE.Vector3(), [])

  const paperBg = useMemo(() => new THREE.Color(COLORS.bg), [])
  const paperFog = useMemo(() => new THREE.Color(COLORS.fog), [])

  const moonGeo = useMemo(() => {
    // a crescent = outer rim (far semicircle) closed by an inner terminator arc
    // (a half-ellipse). The two arcs meet at the cusps (top & bottom).
    const n = 90
    const HALF = Math.PI / 2
    const pts = []
    // lit limb on the +x side (facing the setting sun)
    for (let i = 0; i <= n; i++) {
      const t = HALF + (i / n) * Math.PI // outer rim: 90° → 270°
      pts.push(V(-Math.cos(t) * R, Math.sin(t) * R, 0))
    }
    for (let i = 0; i <= n; i++) {
      const t = 3 * HALF - (i / n) * Math.PI // terminator back: 270° → 90°, x flattened
      pts.push(V(-Math.cos(t) * R * 0.42, Math.sin(t) * R, 0))
    }
    return strip(pts)
  }, [])

  const dotsGeo = useMemo(() => {
    const pts = FIELD.map((p) => V(...p))
    CONSTELLATIONS.forEach((c) => c.pts.forEach((p) => pts.push(V(...p))))
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  const linksGeo = useMemo(() => {
    const seg = []
    CONSTELLATIONS.forEach((c) => c.edges.forEach(([a, b]) => seg.push(V(...c.pts[a]), V(...c.pts[b]))))
    return new THREE.BufferGeometry().setFromPoints(seg)
  }, [])

  useFrame(() => {
    const fp = finaleProgress(scrollStore.offset)

    if (moonGroup.current) {
      moonGroup.current.visible = fp > 0.002
      skyPoint(lerp(MOON_RISE_ANGLE, SKY_TOP, fp), scratch)
      moonGroup.current.position.copy(scratch)
    }
    if (moonMat.current) moonMat.current.opacity = fp
    if (dotMat.current) dotMat.current.opacity = fp
    if (linkMat.current) linkMat.current.opacity = fp * 0.32

    // dim the sky + fog toward dusk
    const k = fp * DIM
    if (scene.background) scene.background.copy(paperBg).lerp(DUSK, k)
    if (scene.fog) scene.fog.color.copy(paperFog).lerp(DUSK, k)
  })

  return (
    <>
      <group ref={moonGroup} visible={false}>
        <lineSegments geometry={moonGeo}>
          <lineBasicMaterial ref={moonMat} color={COLORS.line} transparent opacity={0} depthWrite={false} blending={BLENDING} />
        </lineSegments>
      </group>

      <points geometry={dotsGeo}>
        <pointsMaterial ref={dotMat} color={COLORS.line} size={2.6} sizeAttenuation={false} transparent opacity={0} depthWrite={false} />
      </points>
      <lineSegments geometry={linksGeo}>
        <lineBasicMaterial ref={linkMat} color={COLORS.line} transparent opacity={0} depthWrite={false} blending={BLENDING} />
      </lineSegments>
    </>
  )
}
