import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Journey as WEIGHTED KEYFRAMES.
//
// Each keyframe has an eye position, a look-at target, and `w` — the scroll
// "duration" of the segment leading into it. The smooth spatial path is a
// CatmullRom through the points, but how much SCROLL each segment consumes is
// controlled by its weight. That lets us slow the 180deg turn and dwell on the
// water without moving any geometry.
//
// Beats: against-the-sun -> descend to mountain -> spring -> mountain overview
// -> close glide down the range -> stool 180deg turn -> river + towns -> river
// overview -> more travel -> long low skim -> ocean reveal -> ocean overview ->
// fly out, turn 180deg to see the whole world at once.
// ---------------------------------------------------------------------------

const v = (x, y, z) => new THREE.Vector3(x, y, z)
const clamp01 = (x) => Math.min(1, Math.max(0, x))

// River: mountain foot (front, -Z) -> under the stool -> serpentine to the sea.
const RIVER_POINTS = [
  v(0, 1, -26),
  v(-7, 0, 2),
  v(0, -1, 38), // under the stool
  v(16, -2, 70),
  v(-12, -3, 105),
  v(20, -4, 140),
  v(4, -5, 175),
  v(34, -6, 205),
  v(40, -7, 238),
  v(54, -8, 286),
  v(66, -9, 336), // mouth into the ocean
]

// eye, look, w(eight). First weight is ignored (start point).
const KEYFRAMES = [
  // --- against the sun, then the long descent to earth (#1) ---
  { eye: [0, 152, -22], look: [0, 152, -45], w: 0 }, //  0 zoomed onto the sun XXXXX
  // // { eye: [0, 144, 14], look: [0, 124, -45], w: 5 }, //  1 ease back & down; mountain still below/behind
  // // { eye: [0, 112, 44], look: [0, 70, -45], w: 5 }, //  2 descending; summit rises into view ahead
  // // { eye: [0, 82, 26], look: [0, 56, -45], w: 3 }, //  3 closing on the spring
  // // { eye: [0, 62, -4], look: [0, 55, -45], w: 20 }, //  4 spring, up close (#11)
  { eye: [3, 84, 88], look: [0, 26, -45], w: 15 }, //  5 HOLISTIC mountain (slight x offset) XXXXXx


  { eye: [0, 62, -24], look: [0, 55, -45], w: 5 }, //  4 spring, up close (#11) XXXXX
  { eye: [0, 32, 0], look: [0, 53, -45], w: 3 }, //  4 spring, up close (#11) XXXXX

  // --- mountain overview, then a close glide DOWN the range (#4, #9) ---
  // { eye: [0, 58, 74], look: [0, 32, -42], w: 3 }, //  6 glide: smooth z&y descent, hugging the slope
  // { eye: [0, 38, 60], look: [0, 22, -44], w: 3 }, //  7 glide lower
  // { eye: [-9, 22, 44], look: [-4, 10, 6], w: 3 }, //  8 nearing the river through the foothills (#5)
  // --- the stool 180deg turn, spread WIDE so fast scroll still reads it (#7) ---
  { eye: [0, 13, 42], look: [0, 48, -45], w: 3 }, //  9 stool: look up the mountain front XXXX
  // Looking DOWN the whole time while spinning 180° in place — like standing on
  // the north pole watching the ground rotate beneath you. Eye PINNED; the
  // look-at sweeps a SMALL, steeply-tilted circle (radius 14, dropped to y -14,
  // ≈63° downward) from upstream (-Z) through the right (+X) to downstream (+Z).
  { eye: [0, 13, 41], look: [0, -14, 27], w: 3 }, // 10 az 180° — down, facing upstream
  { eye: [0, 13, 41], look: [9.9, -14, 31.1], w: 3 }, // 11 az 135°
  { eye: [0, 13, 41], look: [14, -14, 41], w: 3 }, // 12 az 90° — down, facing right (+X)
  { eye: [0, 13, 41], look: [9.9, -14, 50.9], w: 3 }, // 13 az 45°
  // { eye: [0, 13, 41], look: [0, -14, 55], w: 20 }, // 14 az 0° — down, settled downstream
  // --- travel + towns, with intermissions between (#5) ---
  // { eye: [-18, 15, 44], look: [-6, -2, 80], w: 5 }, // 15 travel, left bank




  { eye: [38, 15, 74], look: [-6, -2, 100], w: 15 }, // 15 travel, left bank ㅌㅌㅌ below
  { eye: [26, 10, 68], look: [14, -3, 100], w: 3 }, // 16 town 1
  { eye: [-14, 10, 108], look: [-8, -4, 138], w: 3 }, // 17 intermission terrain
  { eye: [30, 9, 142], look: [30, -5, 170], w: 3 }, // 18 town 2
  { eye: [-12, 10, 178], look: [-6, -5, 208], w: 3 }, // 19 town 3
  // --- river overview, angled so the statues don't stack up (#6) ---
  // // { eye: [40, 58, 150], look: [4, -5, 150], w: 4 }, // 20 HOLISTIC river + villages (oblique)
  // // --- river -> ocean: more travel, smaller towns + forests (#5) ---

  // { eye: [40, 58, 150], look: [4, -5, 150], w: 4 }, // 20 HOLISTIC river + villages (oblique)
  { eye: [-12, 0, 198], look: [-6, -5, 208], w: 3 }, // 19 town 3

  // { eye: [-10, 12, 200], look: [8, -6, 232], w: 3 }, // 21 travel
  { eye: [74, 0, 236], look: [74, -5, 244], w: 3 }, // 22 small settlement + forest

  // { eye: [74, 0, 236], look: [44, -7, 264], w: 3 }, // 22 small settlement + forest
  // { eye: [4, 9, 268], look: [40, -8, 298], w: 3 }, // 23 wild
  // --- long, LOW skim — stay down to build drama (#8) ---
  { eye: [40, -3, 296], look: [20, -7, 318], w: 1 }, // 24 skim the water
  // { eye: [52, -4, 318], look: [66, -8, 340], w: 3 }, // 25 still low
  // { eye: [64, -4, 340], look: [20, -8, 362], w: 1 }, // 26 still low, longer
  // --- the reveal: lift up and out, ocean opens ---
  // { eye: [62, 30, 360], look: [80, 0, 412], w: 4 }, // 27 pull up hard
  // { eye: [-200, 50, 312], look: [-46, 4, 408], w: 15 }, // 28 HOLISTIC ocean — high and wide
  // { eye: [-180, 48, 332], look: [-40, 7, 408], w: 1 }, // 28 HOLISTIC ocean — high and wide
  { eye: [-120, 45, 382], look: [-30, 10, 408], w: 15 }, // 28 HOLISTIC ocean — high and wide
  // HOLD: camera parks (tiny drift) here while the ships + whale showcase plays.
  // The segment INTO this tagged keyframe is the showcase scroll-range.
  { eye: [-116, 45.5, 386], look: [-29, 10, 407], w: 40, tag: 'oceanShowcase' }, // hold for the showcase
  { eye: [-50, 40, 512], look: [-10, 30, 400], w: 5 }, // 28 HOLISTIC ocean — high and wide
  // FINALE: hold the end view (look nudged up for sky headroom) while night falls
  // — sun sets, moon rises, contact constellation appears. Segment INTO this is
  // the finale scroll-range (offsetRangeForTag('finale')).
  { eye: [-50, 40, 512], look: [-20, 45, 400], w: 24, tag: 'finale' },


  // --- fly forth, then turn 180deg to capture the whole world (#9) ---
  // { eye: [72, 98, 482], look: [92, 6, 556], w: 3 }, // 29 go forth over the sea
  // { eye: [72, 98, 512], look: [92, 8, 486], w: 3 }, // 29 go forth over the sea
  // { eye: [86, 98, 582], look: [44, 12, 320], w: 5 }, // 30 turn back...
  // { eye: [96, 66, 632], look: [10, 10, 90], w: 4 }, // 31 ...ocean + river + mountain all in view
]

// Cumulative weights -> map scroll offset (0..1) to CatmullRom parameter t.
const WEIGHTS = KEYFRAMES.map((k) => k.w || 0)
const CUM = []
let TOTAL = 0
for (const w of WEIGHTS) {
  TOTAL += w
  CUM.push(TOTAL)
}
const N = KEYFRAMES.length

// offset (0..1) -> t (0..1) honouring per-segment weights.
export function offsetToT(offset) {
  const target = clamp01(offset) * TOTAL
  let i = 1
  while (i < N - 1 && CUM[i] < target) i++
  const segStart = CUM[i - 1]
  const segW = WEIGHTS[i] || 1
  const local = clamp01((target - segStart) / segW)
  return (i - 1 + local) / (N - 1)
}

// Scroll-offset range [start, end] of the segment leading INTO the keyframe with
// the given tag (i.e. the span during which that held viewpoint is active).
export function offsetRangeForTag(tag) {
  const i = KEYFRAMES.findIndex((k) => k.tag === tag)
  if (i <= 0) return [0, 1]
  return [CUM[i - 1] / TOTAL, CUM[i] / TOTAL]
}

export function buildRiverCurve() {
  return new THREE.CatmullRomCurve3(RIVER_POINTS, false, 'catmullrom', 0.5)
}

export function buildEyeCurve() {
  return new THREE.CatmullRomCurve3(
    KEYFRAMES.map((k) => v(...k.eye)),
    false,
    'catmullrom',
    0.5
  )
}

export function buildLookCurve() {
  return new THREE.CatmullRomCurve3(
    KEYFRAMES.map((k) => v(...k.look)),
    false,
    'catmullrom',
    0.5
  )
}
