import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, MODE } from '../data/journey'
import { SEA_Y, BREACH, shipRoutes } from '../data/ocean'
import { offsetRangeForTag } from '../world/Paths'
import { scrollStore } from '../hooks/scrollStore'
import { shipGeometry } from '../utils/ships'
import { balloonGeometry } from '../utils/balloon'
import { clamp, smoothstep, lerp } from '../utils/math'
import { prefersReducedMotion } from '../utils/reducedMotion'

const BLENDING = MODE === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending

// --- tunables ---
const SHIP_END = 0.54 // p at which ships are docked
const SHIP_SCALE = 1.3

// hot-air balloon: drifts in from high-x / low-z, parks above the breach point at
// roughly the whale's old jump altitude, then stays.
const BALLOON_ALT = 8 // group y (basket level); envelope floats above (top ≈ +42)
const BALLOON_DEST = [BREACH[0], BALLOON_ALT, BREACH[1]]
const BALLOON_ENTRY = [BREACH[0] + 150, BALLOON_ALT + 7, BREACH[1] - 120]
const BALLOON_ENTER = 0.5 // p when it starts drifting in
const BALLOON_ARRIVE = 0.76 // p when it has parked
const BALLOON_SCALE = 1

const easeInOut = (x) => x * x * (3 - 2 * x)

export function OceanShowcase() {
  const [s, e] = useMemo(() => offsetRangeForTag('oceanShowcase'), [])
  const t = useRef(0)
  const shipRefs = useRef([])
  const balloonRef = useRef()

  const ships = useMemo(
    () => shipRoutes().map((r, k) => ({ ...r, entryTime: k * 0.16, dockTime: k * 0.16 + 0.22 })),
    []
  )

  useFrame((_, dt) => {
    t.current += dt
    const reduced = prefersReducedMotion
    const offset = scrollStore.offset
    const p = reduced ? 1 : clamp((offset - s) / (e - s || 1), 0, 1)

    // ---- ships: sail in and dock ----
    ships.forEach((sh, k) => {
      const o = shipRefs.current[k]
      if (!o) return
      const sp = reduced ? 1 : clamp((p - sh.entryTime) / (sh.dockTime - sh.entryTime), 0, 1)
      const op = smoothstep(0, 0.12, sp)
      o.visible = op > 0.01
      if (!o.visible) return
      const k1 = smoothstep(0, 1, sp)
      o.position.set(lerp(sh.entry[0], sh.dock[0], k1), SEA_Y + Math.sin(t.current * 1.4 + k * 2) * 0.3, lerp(sh.entry[1], sh.dock[1], k1))
      o.rotation.set(0, sh.heading, Math.sin(t.current * 1.1 + k) * 0.04)
      o.material.opacity = op
    })

    // ---- hot-air balloon: drift in, park, stay ----
    const b = balloonRef.current
    if (b) {
      if (reduced) {
        b.visible = true
        b.position.set(BALLOON_DEST[0], BALLOON_DEST[1], BALLOON_DEST[2])
        b.material.opacity = 1
      } else {
        const bp = clamp((p - BALLOON_ENTER) / (BALLOON_ARRIVE - BALLOON_ENTER), 0, 1)
        const op = smoothstep(0, 0.12, bp)
        b.visible = op > 0.01
        if (b.visible) {
          const k = easeInOut(bp)
          const park = smoothstep(0.8, 1, bp) // gentle sway eases in once parked
          b.position.set(
            lerp(BALLOON_ENTRY[0], BALLOON_DEST[0], k) + Math.sin(t.current * 0.4) * 1.5 * park,
            lerp(BALLOON_ENTRY[1], BALLOON_DEST[1], k) + Math.sin(t.current * 0.6 + 1) * 0.6,
            lerp(BALLOON_ENTRY[2], BALLOON_DEST[2], k) + Math.cos(t.current * 0.32) * 1.2 * park
          )
          b.rotation.z = Math.sin(t.current * 0.5) * 0.03 * (0.4 + park)
          b.material.opacity = op
        }
      }
    }
  })

  return (
    <group>
      {ships.map((sh, k) => (
        <lineSegments key={k} ref={(el) => (shipRefs.current[k] = el)} geometry={shipGeometry(sh.design)} scale={SHIP_SCALE} visible={false}>
          <lineBasicMaterial color={COLORS.line} transparent opacity={0} depthWrite={false} blending={BLENDING} />
        </lineSegments>
      ))}

      <lineSegments ref={balloonRef} geometry={balloonGeometry()} scale={BALLOON_SCALE} visible={false}>
        <lineBasicMaterial color={COLORS.line} transparent opacity={0} depthWrite={false} blending={BLENDING} />
      </lineSegments>
    </group>
  )
}
