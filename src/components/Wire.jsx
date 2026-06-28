import { useMemo } from 'react'
import * as THREE from 'three'
import { MODE, COLORS } from '../data/journey'

const BLENDING = MODE === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending

// Renders a geometry as crisp edge-lines in the active palette. In dark mode the
// lines glow (additive on black); in light mode they're clean ink on paper.
export function Wire({
  geometry,
  threshold = 1,
  color = COLORS.line,
  opacity = 1,
  ...props
}) {
  const edges = useMemo(
    () => new THREE.EdgesGeometry(geometry, threshold),
    [geometry, threshold]
  )
  return (
    <lineSegments {...props}>
      <primitive object={edges} attach="geometry" />
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={BLENDING}
      />
    </lineSegments>
  )
}
