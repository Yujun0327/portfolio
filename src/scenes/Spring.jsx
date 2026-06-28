import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { Wire } from '../components/Wire'
import { LANDMARKS, COLORS } from '../data/journey'
import { prefersReducedMotion, isLowPower } from '../utils/reducedMotion'
import { lerp } from '../utils/math'

const STREAM_PARTICLES = isLowPower ? 70 : 160

// The spring: a pulsing pool at the summit, and the river's own headwaters
// CLIMBING the mountain — the same twin-bank channel as the river, tapering to a
// point at the spring (width matched to the river's source so it reads as one
// continuous waterway, not a separate stream). Particles flow down it.
export function Spring() {
  const pool = useRef()
  const pointsRef = useRef()
  const t = useRef(0)
  const summit = LANDMARKS.summit

  const rings = useMemo(
    () => [0.9, 1.7, 2.6].map((r) => new THREE.TorusGeometry(r, 0.05, 8, 96)),
    []
  )

  // stream path from just below the pool down to the river source (world coords)
  const stream = useMemo(() => {
    const s = LANDMARKS.summit
    // descends steeply off the summit, then LEVELS OFF and curves toward the
    // river's own heading (+Z, slight -X) so the join is a smooth bend, not a
    // sharp corner.
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(s[0], s[1] - 1, s[2] + 0.5), // spring (top, narrow)
        new THREE.Vector3(s[0], s[1] - 13, s[2] + 3),
        new THREE.Vector3(s[0] + 0.5, s[1] - 25, s[2] + 7),
        new THREE.Vector3(s[0] + 0.7, s[1] - 36, s[2] + 12),
        new THREE.Vector3(s[0] + 0.6, s[1] - 45, s[2] + 15.5), // (0.6, 11, -29.5)
        new THREE.Vector3(0.4, 5, -28.5), // leveling off
        new THREE.Vector3(0.2, 2.2, -27.4),
        new THREE.Vector3(0.05, 1.25, -26.6), // nearly flat, aligned to the river
        new THREE.Vector3(0, 1, -26), // river source
      ],
      false,
      'catmullrom',
      0.5
    )
  }, [])

  // twin tapering banks + faint centre, matched to the river's source width
  const { left, right, center } = useMemo(() => {
    const N = 70
    const pts = stream.getSpacedPoints(N)
    const left = []
    const right = []
    for (let i = 0; i <= N; i++) {
      const k = i / N // 0 = spring (narrow) → 1 = river source (wide)
      const w = lerp(0.12, 1.3, k * k) // taper, matching river half-width ≈1.2
      left.push(new THREE.Vector3(pts[i].x + w, pts[i].y, pts[i].z))
      right.push(new THREE.Vector3(pts[i].x - w, pts[i].y, pts[i].z))
    }
    return { left, right, center: pts }
  }, [stream])

  const particles = useMemo(() => {
    let r = 5
    const rand = () => ((r = (r * 16807) % 2147483647), r / 2147483647)
    const u = new Float32Array(STREAM_PARTICLES)
    const spd = new Float32Array(STREAM_PARTICLES)
    for (let i = 0; i < STREAM_PARTICLES; i++) {
      u[i] = rand()
      spd[i] = 0.06 + rand() * 0.05
    }
    return { u, spd, positions: new Float32Array(STREAM_PARTICLES * 3) }
  }, [])

  const scratch = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    t.current += dt
    if (pool.current) {
      pool.current.children.forEach((c, i) => {
        c.scale.setScalar(1 + 0.14 * Math.sin(t.current * 2 - i * 0.8))
      })
    }
    const { u, spd, positions } = particles
    for (let i = 0; i < STREAM_PARTICLES; i++) {
      if (!prefersReducedMotion) {
        u[i] += spd[i] * dt
        if (u[i] > 1) u[i] -= 1
      }
      stream.getPointAt(u[i], scratch)
      positions[i * 3] = scratch.x
      positions[i * 3 + 1] = scratch.y
      positions[i * 3 + 2] = scratch.z
    }
    if (pointsRef.current) pointsRef.current.attributes.position.needsUpdate = true
  })

  return (
    <group>
      {/* pulsing pool, laid flat at the summit */}
      <group ref={pool} position={[summit[0], summit[1] - 2, summit[2]]} rotation={[Math.PI / 2, 0, 0]}>
        {rings.map((g, i) => (
          <Wire key={i} geometry={g} opacity={0.9 - i * 0.18} />
        ))}
      </group>

      {/* the river climbing the hill: twin banks + faint centre + flow particles */}
      <Line points={left} color={COLORS.line} transparent opacity={0.9} lineWidth={1.4} />
      <Line points={right} color={COLORS.line} transparent opacity={0.9} lineWidth={1.4} />
      <Line points={center} color={COLORS.line} transparent opacity={0.3} lineWidth={1} />
      <points>
        <bufferGeometry ref={pointsRef}>
          <bufferAttribute
            attach="attributes-position"
            count={STREAM_PARTICLES}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color={COLORS.line} size={0.6} sizeAttenuation transparent opacity={0.85} />
      </points>
    </group>
  )
}
