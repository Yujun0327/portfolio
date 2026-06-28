import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import * as THREE from 'three'
import { World } from '../world/World'
import { Effects } from './Effects'
import { COLORS, SCROLL_PAGES } from '../data/journey'
import { isLowPower } from '../utils/reducedMotion'
import { useOpenId } from '../hooks/uiStore'

// The black void. No lights — every material is an unlit white line. Exponential
// black fog fades distant lines for free (cheap depth cueing).
export function CanvasRoot() {
  const open = useOpenId() // lock scroll while a project tag is open
  return (
    <Canvas
      dpr={[1, isLowPower ? 1.5 : 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 62, 98], fov: 55, near: 0.1, far: 2400 }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.FogExp2(COLORS.fog, 0.0014)
      }}
    >
      <color attach="background" args={[COLORS.bg]} />
      <ScrollControls pages={SCROLL_PAGES} damping={0.28} enabled={!open}>
        <World />
      </ScrollControls>
      <Effects />
    </Canvas>
  )
}
