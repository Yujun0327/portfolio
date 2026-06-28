import { useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import * as THREE from 'three'
import { buildEyeCurve, buildLookCurve, offsetToT } from './Paths'
import { clamp, smoothstep } from '../utils/math'
import { ui } from '../hooks/uiStore'
import { ANCHORS } from '../data/anchors'
import { prefersReducedMotion } from '../utils/reducedMotion'

const WORLD_UP = new THREE.Vector3(0, 1, 0)
const PARALLAX = 7 // how far the eye slides toward the cursor
const ZOOM_DIST = 42 // camera distance from an anchor when its tag is open

// Drives the camera from scroll, plus: (1) a subtle parallax lean toward the
// mouse, and (2) a zoom-to-anchor override when a project tag is open (returns to
// the scroll path on close). Damped throughout.
export function CameraRig({ offsetRef }) {
  const camera = useThree((s) => s.camera)

  const eyeCurve = useMemo(() => buildEyeCurve(), [])
  const lookCurve = useMemo(() => buildLookCurve(), [])
  const anchorMap = useMemo(() => {
    const m = new Map()
    ANCHORS.forEach((a) => m.set(a.id, new THREE.Vector3(...a.world)))
    return m
  }, [])

  const s = useMemo(
    () => ({
      eye: new THREE.Vector3(),
      look: new THREE.Vector3(),
      curLook: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      dir: new THREE.Vector3(),
    }),
    []
  )

  useMemo(() => lookCurve.getPoint(0, s.curLook), [lookCurve, s])

  useFrame((_, dt) => {
    const { eye, look, curLook, fwd, right, up, dir } = s
    const o = clamp(offsetRef.current, 0, 1)
    const t = offsetToT(o)
    eyeCurve.getPoint(t, eye)
    lookCurve.getPoint(t, look)

    const openId = ui.openId
    if (openId && anchorMap.has(openId)) {
      // zoom in: keep the current viewing angle but pull close to the anchor
      const aw = anchorMap.get(openId)
      dir.copy(eye).sub(aw)
      if (dir.lengthSq() < 1) dir.set(0, 0.3, 1)
      dir.normalize()
      eye.copy(aw).addScaledVector(dir, ZOOM_DIST)
      eye.y += 6
      look.copy(aw)
    } else if (!prefersReducedMotion) {
      // parallax lean toward the cursor — disabled at the sun stage (offset≈0),
      // eases in once you start scrolling
      const amp = PARALLAX * smoothstep(0.015, 0.075, o)
      fwd.copy(look).sub(eye).normalize()
      right.crossVectors(fwd, WORLD_UP).normalize()
      up.crossVectors(right, fwd).normalize()
      eye.addScaledVector(right, ui.mouse.nx * amp).addScaledVector(up, -ui.mouse.ny * amp)
      look.addScaledVector(right, ui.mouse.nx * amp * 0.5).addScaledVector(up, -ui.mouse.ny * amp * 0.5)
    }

    const posLambda = openId ? 0.4 : 0.2
    const lookLambda = openId ? 0.36 : 0.18
    easing.damp3(camera.position, eye, posLambda, dt)
    easing.damp3(curLook, look, lookLambda, dt)
    camera.lookAt(curLook)
  })

  return null
}
