import { useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CONTACTS } from '../data/contacts'
import { ui, initContactBuffer } from '../hooks/uiStore'
import { scrollStore } from '../hooks/scrollStore'
import { finaleProgress } from '../utils/finale'

// Projects the 5 contact sky-points to screen each frame; opacity follows the
// finale progress so the stars twinkle in as night falls. (Mirrors TagProjector.)
export function ContactProjector() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const vecs = useMemo(() => {
    initContactBuffer(CONTACTS.length)
    return CONTACTS.map((c) => new THREE.Vector3(...c.world))
  }, [])
  const v = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const buf = ui.contactBuffer
    if (!buf) return
    const fp = finaleProgress(scrollStore.offset)
    for (let i = 0; i < CONTACTS.length; i++) {
      v.copy(vecs[i]).project(camera)
      const j = i * 4
      buf[j] = (v.x * 0.5 + 0.5) * size.width
      buf[j + 1] = (-v.y * 0.5 + 0.5) * size.height
      buf[j + 2] = v.z > 1 ? 0 : fp
      buf[j + 3] = 1
    }
  })

  return null
}
