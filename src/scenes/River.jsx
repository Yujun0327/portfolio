import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { COLORS } from '../data/journey'
import { getRiverFrame, sampleRiver } from '../utils/curveSampler'
import { prefersReducedMotion, isLowPower } from '../utils/reducedMotion'
import { smoothstep } from '../utils/math'

// per-point colours that dissolve the river into the paper near the mouth
const LINE_C = new THREE.Color(COLORS.line)
const BG_C = new THREE.Color(COLORS.bg)

const PARTICLE_COUNT = isLowPower ? 220 : 520

// The river spine: a faint centre line, two widening boundary lines, a couple of
// inner flow lines, and a field of particles genuinely advecting downstream
// (slower as the river widens toward the sea). ALWAYS present — it runs from the
// mountain foot under the stool to the sea, never popping in.
export function River() {
  const frame = useMemo(() => getRiverFrame(320), [])
  const pointsRef = useRef()

  // static line geometry derived from the shared river frame
  const { center, left, right, inA, inB, colors } = useMemo(() => {
    const center = []
    const left = []
    const right = []
    const inA = []
    const inB = []
    const colors = []
    const p = new THREE.Vector3()
    const n = new THREE.Vector3()
    const c = new THREE.Color()
    const N = 320
    for (let i = 0; i <= N; i++) {
      const u = i / N
      const w = sampleRiver(frame, u, p, n)
      center.push(p.clone())
      left.push(p.clone().addScaledVector(n, w))
      right.push(p.clone().addScaledVector(n, -w))
      inA.push(p.clone().addScaledVector(n, w * 0.45))
      inB.push(p.clone().addScaledVector(n, -w * 0.45))
      // fade to background over the last stretch so the mouth dissolves
      const k = 1 - smoothstep(0.85, 1, u)
      c.copy(BG_C).lerp(LINE_C, k)
      colors.push([c.r, c.g, c.b])
    }
    return { center, left, right, inA, inB, colors }
  }, [frame])

  // particle state (deterministic init)
  const particles = useMemo(() => {
    let s = 7
    const rand = () => ((s = (s * 16807) % 2147483647), s / 2147483647)
    const u = new Float32Array(PARTICLE_COUNT)
    const lat = new Float32Array(PARTICLE_COUNT) // -1..1 across the channel
    const spd = new Float32Array(PARTICLE_COUNT)
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      u[i] = rand() * 0.88 // stay out of the dissolving mouth
      lat[i] = rand() * 2 - 1
      spd[i] = 0.012 + rand() * 0.01
    }
    return { u, lat, spd, positions }
  }, [])

  const scratch = useMemo(() => ({ p: new THREE.Vector3(), n: new THREE.Vector3() }), [])

  useFrame((_, dt) => {
    const { u, lat, spd, positions } = particles
    const { p, n } = scratch
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (!prefersReducedMotion) {
        // flow slows as the channel widens (conservation-of-feel, not physics)
        u[i] += spd[i] * dt * (1 - u[i] * 0.5)
        if (u[i] > 0.9) u[i] -= 0.9
      }
      const w = sampleRiver(frame, u[i], p, n)
      positions[i * 3] = p.x + n.x * lat[i] * w * 0.85
      positions[i * 3 + 1] = p.y + 0.05
      positions[i * 3 + 2] = p.z + n.z * lat[i] * w * 0.85
    }
    // the attribute shares `positions` by reference — just flag for upload
    const geom = pointsRef.current
    if (geom) geom.attributes.position.needsUpdate = true
  })

  return (
    <group>
      <Line points={left} vertexColors={colors} transparent opacity={0.95} lineWidth={1.5} />
      <Line points={right} vertexColors={colors} transparent opacity={0.95} lineWidth={1.5} />
      <Line points={center} vertexColors={colors} transparent opacity={0.22} lineWidth={1} />
      <Line points={inA} vertexColors={colors} transparent opacity={0.35} lineWidth={1} />
      <Line points={inB} vertexColors={colors} transparent opacity={0.35} lineWidth={1} />
      <points>
        <bufferGeometry ref={pointsRef}>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color={COLORS.line} size={0.7} sizeAttenuation transparent opacity={0.8} />
      </points>
    </group>
  )
}
