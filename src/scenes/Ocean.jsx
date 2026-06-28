import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { LANDMARKS, COLORS, MODE } from '../data/journey'
import { ringPoints } from '../utils/geometry'
import { waveVertex, waveFragment } from '../shaders/wave'
import { prefersReducedMotion } from '../utils/reducedMotion'
import { smoothstep } from '../utils/math'

const BLENDING = MODE === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending

// The "large circle": the ocean only exists OUTSIDE this radius; inside reads as
// clean paper, bounded by the prominent ring.
//   BOUNDARY_CENTER — world [x, z] the circle is centred on. Set to the MIDDLE
//                     of the scenery (not the river mouth). ← ADJUST CENTER HERE
//   BOUNDARY_R      — radius of the clean interior.          ← ADJUST SIZE HERE
const BOUNDARY_CENTER = [0, 40]
const BOUNDARY_R = 280

// The ocean — not a filled plane: long wave lines displaced on the GPU, a far
// horizon arc echoing the sun, and contour-ring islands. Always present.
export function Ocean() {
  const center = LANDMARKS.oceanCenter

  // all wave rows as one merged LineSegments geometry (one draw call), with a
  // per-vertex fade attribute (farther rows fainter)
  const waveGeo = useMemo(() => {
    const rows = 46
    const halfW = 380
    const seg = 110
    const positions = []
    const fades = []
    for (let r = 0; r < rows; r++) {
      const z = center[2] - 150 + r * 16
      const rowFade = 0.55 - (r / rows) * 0.3
      for (let i = 0; i < seg; i++) {
        const x0 = center[0] - halfW + (i / seg) * halfW * 2
        const x1 = center[0] - halfW + ((i + 1) / seg) * halfW * 2
        const mx = (x0 + x1) / 2
        // distance from the boundary circle's centre (the scenery centre)
        const dist = Math.hypot(mx - BOUNDARY_CENTER[0], z - BOUNDARY_CENTER[1])
        if (dist < BOUNDARY_R) continue // ocean only OUTSIDE the circle
        const f = rowFade * smoothstep(BOUNDARY_R, BOUNDARY_R + 45, dist)
        positions.push(x0, center[1], z, x1, center[1], z)
        fades.push(f, f)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('aFade', new THREE.Float32BufferAttribute(fades, 1))
    return g
  }, [center])

  const waveMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: waveVertex,
        fragmentShader: waveFragment,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(COLORS.line) },
          uOpacity: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        blending: BLENDING,
      }),
    []
  )

  const islands = useMemo(() => {
    const defs = [
      { c: [center[0] - 75, center[1], center[2] + 30], r: 16, rings: 4, w: 0.5 },
      { c: [center[0] + 60, center[1], center[2] + 80], r: 22, rings: 5, w: 0.3 },
      { c: [center[0] - 56, center[1], center[2] + 165], r: 12, rings: 3, w: 0.7 },
      { c: [center[0] - 20, center[1], center[2] + 120], r: 9, rings: 2, w: 0.6 },
    ]
    return defs.map((d) => ({
      pos: d.c,
      rings: Array.from({ length: d.rings }, (_, i) =>
        ringPoints(d.r * (1 - i / (d.rings + 1)), i * 1.6, 56, d.w, i)
      ),
    }))
  }, [center])

  // the boundary circle itself — prominent, centred on BOUNDARY_CENTER, sitting
  // just above the sea plane
  const horizon = useMemo(() => ringPoints(BOUNDARY_R, center[1] + 2, 180, 0, 0), [center])

  useFrame((_, dt) => {
    if (!prefersReducedMotion) waveMat.uniforms.uTime.value += dt
  })

  return (
    <group>
      <lineSegments geometry={waveGeo} material={waveMat} />
      {islands.map((isl, i) =>
        isl.rings.map((pts, j) => (
          <Line
            key={`${i}-${j}`}
            points={pts.map((p) =>
              p.clone().add(new THREE.Vector3(isl.pos[0], isl.pos[1], isl.pos[2]))
            )}
            color={COLORS.line}
            transparent
            opacity={0.8 - j * 0.12}
            lineWidth={1.2}
          />
        ))
      )}
      {/* boundary ring outline hidden (the ocean still masks to outside it) */}
      <Line
        points={horizon}
        position={[BOUNDARY_CENTER[0], 0, BOUNDARY_CENTER[1]]}
        color={COLORS.line}
        transparent
        opacity={0}
        lineWidth={1.4}
      />
    </group>
  )
}
