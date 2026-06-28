import { useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ANCHORS, STAGE_WINDOWS, OCEAN_BANDS } from '../data/anchors'
import { LANDMARKS } from '../data/journey'
import { ui, initTagBuffer } from '../hooks/uiStore'
import { scrollStore } from '../hooks/scrollStore'
import { offsetRangeForTag } from './Paths'
import { clamp, smoothstep } from '../utils/math'

// fade-in over [a, a+f], fade-out over [b-f, b]
const envelope = (x, [a, b], f) => smoothstep(a, a + f, x) * (1 - smoothstep(b - f, b, x))

// In-canvas: every frame, project each anchor to screen pixels and compute its
// stage opacity, writing [x, y, opacity, scale] into the shared tag buffer. The
// DOM TagLayer reads this buffer. No per-frame React state.
export function TagProjector() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const showcase = useMemo(() => offsetRangeForTag('oceanShowcase'), [])
  const vecs = useMemo(() => {
    initTagBuffer(ANCHORS.length)
    return ANCHORS.map((a) => new THREE.Vector3(...a.world))
  }, [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const sunV = useMemo(() => new THREE.Vector3(...LANDMARKS.sun), [])
  const sunS = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const buf = ui.buffer
    if (!buf) return
    const offset = scrollStore.offset
    const [ss, se] = showcase
    const open = ui.openId

    // project the sun (theoretical light source) to screen for glass reflections
    sunS.copy(sunV).project(camera)
    ui.sun.x = (sunS.x * 0.5 + 0.5) * size.width
    ui.sun.y = (-sunS.y * 0.5 + 0.5) * size.height
    for (let i = 0; i < ANCHORS.length; i++) {
      const a = ANCHORS[i]
      v.copy(vecs[i]).project(camera)
      const behind = v.z > 1
      const sx = (v.x * 0.5 + 0.5) * size.width
      const sy = (-v.y * 0.5 + 0.5) * size.height

      let vis
      if (a.group === 'mountain' || a.group === 'tower') {
        vis = envelope(offset, STAGE_WINDOWS[a.group], 0.045)
      } else {
        const p = clamp((offset - ss) / (se - ss || 1), 0, 1)
        vis = envelope(p, OCEAN_BANDS[a.group], 0.16)
      }
      if (behind || sx < -120 || sx > size.width + 120 || sy < -120 || sy > size.height + 120) vis = 0
      // while a tag is open, hide every tag (the open one is shown by the modal)
      if (open) vis = 0

      const j = i * 4
      buf[j] = sx
      buf[j + 1] = sy
      buf[j + 2] = vis
      buf[j + 3] = 1
    }
  })

  return null
}
