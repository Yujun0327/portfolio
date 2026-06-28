import { offsetRangeForTag } from '../world/Paths'
import { smoothstep } from './math'
import { LANDMARKS } from '../data/journey'

// 0 → 1 across the appended 'finale' scroll segment (night falls over this range).
const [START, END] = offsetRangeForTag('finale')

export const FINALE_START = START
export const FINALE_END = END
export const finaleProgress = (offset) => smoothstep(START, END, offset)

// ---- the celestial circle ----------------------------------------------------
// Sun and moon ride a single vertical circle in the sky (plane z = sun z), so
// both move in a CIRCULAR arc rather than a straight line. The circle's top sits
// exactly on the sun's parked spot; the sun sets down the +x side as the moon
// rises up the −x side to take its place.
const SUN = LANDMARKS.sun
export const SKY_RADIUS = 130
export const SKY_CENTER = [SUN[0], SUN[1] - SKY_RADIUS, SUN[2]] // top of circle = sun
export const SKY_TOP = Math.PI / 2 // angle (from +x) of the sun's parked spot

const DEG = Math.PI / 180
export const SUN_SET_ANGLE = -28 * DEG // sun ends here (down & to +x, off-frame)
export const MOON_RISE_ANGLE = 183 * DEG // moon starts here (low, −x) and rises to SKY_TOP

// Write the circle point at `angle` (radians) into `out` (THREE.Vector3).
export function skyPoint(angle, out) {
  out.set(SKY_CENTER[0] + Math.cos(angle) * SKY_RADIUS, SKY_CENTER[1] + Math.sin(angle) * SKY_RADIUS, SKY_CENTER[2])
  return out
}
