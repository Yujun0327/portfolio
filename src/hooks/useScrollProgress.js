import { useScroll } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { scrollStore } from './scrollStore'

// Single source of truth for the scroll offset (0..1).
//
// Backed by drei <ScrollControls> for Milestone 1. The rest of the app only
// ever reads `offsetRef.current` inside useFrame — never in React render — so
// scrolling never triggers a re-render. If we later swap to Lenis, only this
// hook changes; consumers are untouched.
export function useScrollProgress() {
  const scroll = useScroll()
  const offsetRef = useRef(0)

  useFrame(() => {
    offsetRef.current = scroll.offset
    scrollStore.offset = scroll.offset // expose to DOM (intro overlay)
    scrollStore.el = scroll.el // the scroll container, so the overlay can jump to the hero
  })

  return offsetRef
}
