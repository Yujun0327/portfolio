import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, MODE } from '../data/journey'
import { prefersReducedMotion, isLowPower } from '../utils/reducedMotion'

const COUNT = isLowPower ? 5 : 9
const BLENDING = MODE === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending

// A few flapping line-"V" birds drifting across the sky. Tiny (each = 2 line
// segments), GPU-cheap, but adds a lot of life to the empty upper space.
export function Birds() {
  const geomRef = useRef()
  const t = useRef(0)

  const birds = useMemo(() => {
    let s = 53
    const rand = () => ((s = (s * 16807) % 2147483647), s / 2147483647)
    const arr = []
    for (let i = 0; i < COUNT; i++) {
      arr.push({
        x: (rand() * 2 - 1) * 160,
        y: 64 + rand() * 46,
        z: -80 + rand() * 360,
        sp: 5 + rand() * 6,
        ph: rand() * Math.PI * 2,
        span: 1.6 + rand() * 1.8,
        dir: rand() > 0.5 ? 1 : -1,
      })
    }
    return { arr, positions: new Float32Array(COUNT * 4 * 3) } // 2 segs = 4 verts
  }, [])

  useFrame((_, dt) => {
    t.current += dt
    const { arr, positions } = birds
    for (let i = 0; i < COUNT; i++) {
      const b = arr[i]
      if (!prefersReducedMotion) {
        b.x += b.sp * b.dir * dt
        if (b.x > 200) b.x = -200
        if (b.x < -200) b.x = 200
      }
      const flap = Math.sin(t.current * 5 + b.ph) * 1.1
      const o = i * 12
      // center
      const cx = b.x, cy = b.y, cz = b.z
      // left tip / right tip (swept slightly back in z, flapping in y)
      positions[o] = cx; positions[o + 1] = cy; positions[o + 2] = cz
      positions[o + 3] = cx - b.span * b.dir; positions[o + 4] = cy + flap; positions[o + 5] = cz + b.span
      positions[o + 6] = cx; positions[o + 7] = cy; positions[o + 8] = cz
      positions[o + 9] = cx + b.span * b.dir; positions[o + 10] = cy + flap; positions[o + 11] = cz + b.span
    }
    if (geomRef.current) geomRef.current.attributes.position.needsUpdate = true
  })

  return (
    <lineSegments>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" count={COUNT * 4} array={birds.positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color={COLORS.line} transparent opacity={0.55} depthWrite={false} blending={BLENDING} />
    </lineSegments>
  )
}
