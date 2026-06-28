import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Wire } from '../components/Wire'
import { LANDMARKS, COLORS } from '../data/journey'
import { scrollStore } from '../hooks/scrollStore'
import { finaleProgress, skyPoint, SKY_TOP, SUN_SET_ANGLE } from '../utils/finale'
import { lerp, smoothstep } from '../utils/math'

// The sun — the "source symbol" (formerly the circle). A big outlined disc with
// radial rays, parked high above the summit. It's ALWAYS in the world: at the
// start the camera is zoomed onto it (only its left/right edges show); as you
// scroll the camera tilts down to the mountain and the sun simply rises out of
// frame — it never fades.
export function Sun() {
  const outer = useRef()
  const group = useRef()
  const scratch = useMemo(() => new THREE.Vector3(), [])
  const base = LANDMARKS.sun
  const R = LANDMARKS.sunRadius

  const disc = useMemo(() => new THREE.TorusGeometry(R, 0.16, 12, 200), [])
  const inner = useMemo(() => new THREE.TorusGeometry(R * 0.62, 0.1, 12, 160), [])

  // short radial rays around the rim
  const rays = useMemo(() => {
    const pts = []
    const n = 48
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const c = Math.cos(a)
      const s = Math.sin(a)
      const r0 = R + 2.2
      const r1 = R + (i % 2 === 0 ? 7 : 4)
      pts.push(new THREE.Vector3(c * r0, s * r0, 0))
      pts.push(new THREE.Vector3(c * r1, s * r1, 0))
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts)
    return g
  }, [])

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.z += dt * 0.03
    const fp = finaleProgress(scrollStore.offset)
    if (outer.current) {
      // ride the celestial circle from its parked spot (top) down the +x side
      skyPoint(lerp(SKY_TOP, SUN_SET_ANGLE, fp), scratch)
      outer.current.position.copy(scratch)
      // ...and fade out over the second half so it disappears completely
      const op = 1 - smoothstep(0.5, 0.94, fp)
      group.current.traverse((o) => {
        if (!o.material) return
        if (o.material.userData.base === undefined) o.material.userData.base = o.material.opacity
        o.material.opacity = o.material.userData.base * op
      })
      group.current.visible = op > 0.001
    }
  })

  return (
    <group ref={outer} position={base}>
      <group ref={group}>
        <Wire geometry={disc} />
        <Wire geometry={inner} opacity={0.5} />
        <lineSegments>
          <primitive object={rays} attach="geometry" />
          <lineBasicMaterial color={COLORS.line} transparent opacity={0.7} depthWrite={false} />
        </lineSegments>
      </group>
    </group>
  )
}
