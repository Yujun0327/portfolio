import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Wire } from '../components/Wire'
import { SCENE_RANGES, LANDMARKS } from '../data/journey'
import { scenePhase, sceneFade, clamp } from '../utils/math'
import { setGroupOpacity } from '../utils/geometry'

// Scene 1 — the source circle. A thin 3D ring facing the camera that, as you
// begin scrolling, drifts up and back in 3D to reveal the mountain beneath it.
export function CircleSource({ offsetRef }) {
  const group = useRef()
  const base = LANDMARKS.circle

  const ringA = useMemo(() => new THREE.TorusGeometry(8, 0.16, 10, 160), [])
  const ringB = useMemo(() => new THREE.TorusGeometry(5.2, 0.1, 10, 160), [])

  useFrame((_, dt) => {
    const g = group.current
    const { raw } = scenePhase(offsetRef.current, SCENE_RANGES.circle, 0.05)
    setGroupOpacity(g, sceneFade(raw, 0.22))
    if (!g.visible) return
    const t = clamp(raw, 0, 1.3)
    // rise on Y, recede on Z — a 3D move, not a flat slide
    g.position.set(base[0], base[1] + t * 10, base[2] - t * 20)
    g.rotation.z += dt * 0.06
    g.rotation.x = 0.18 * Math.sin(t * 1.6)
  })

  return (
    <group ref={group} position={base}>
      <Wire geometry={ringA} />
      <Wire geometry={ringB} opacity={0.55} />
    </group>
  )
}
