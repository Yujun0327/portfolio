import { LANDMARKS } from './journey'
import { getStatues } from '../utils/places'
import { ISLANDS, BREACH, SEA_Y, shipRoutes } from './ocean'

// The 16 world objects that carry project tags. Each anchor: a stable id, a
// `group` (drives the stage-fade), the world position the tag floats at, and a
// placeholder title (real content lives in data/projects.js).
const MB = LANDMARKS.mountainBase

// 2 big peaks left, 2 big peaks right (positions relative to the mountain group,
// y = peak height). Must match the chosen background peaks in Mountain.jsx.
const MOUNTAIN_PEAKS = [
  [-72, 36, -40],
  [-44, 28, -110],
  [74, 40, -48],
  [50, 30, -120],
]

function mountains() {
  return MOUNTAIN_PEAKS.map((p, i) => ({
    id: `mtn-${i}`,
    group: 'mountain',
    world: [p[0] + MB[0], p[1] + MB[1], p[2] + MB[2]],
    title: `Project ${i + 1}`,
  }))
}
function towers() {
  return getStatues().map((s, i) => ({
    id: `twr-${i}`,
    group: 'tower',
    world: [s.pos[0], s.pos[1] + 11 * s.scale, s.pos[2]],
    title: `Project ${i + 5}`,
  }))
}
function islands() {
  return ISLANDS.map((isl, i) => ({
    id: `isl-${i}`,
    group: 'island',
    world: [isl.p[0], SEA_Y + 9, isl.p[1]],
    title: `Project ${i + 9}`,
  }))
}
function ships() {
  return shipRoutes().map((r, i) => ({
    id: `shp-${i}`,
    group: 'ship',
    world: [r.dock[0], SEA_Y + 12, r.dock[1]],
    title: `Activity ${i + 1}`,
  }))
}
function whale() {
  // hangs BENEATH the parked hot-air balloon (anchor at the basket; `below`
  // makes the tag dangle downward instead of floating up)
  return [{ id: 'whale', group: 'whale', world: [BREACH[0], 9, BREACH[1]], title: 'Awards', below: true }]
}

export const ANCHORS = [...mountains(), ...towers(), ...islands(), ...ships(), ...whale()]

// Stage visibility. Mountains/towers fade over a scroll-offset window; ocean
// groups crossfade over the showcase's local progress p (islands → ships →
// whale). All tunable.
export const STAGE_WINDOWS = {
  mountain: [0.0, 0.24],
  // the river statues are on-screen during the town TRAVEL (offset ≈ 0.27–0.46);
  // the old [0.36,0.65] peaked at the ocean approach, where they're culled.
  tower: [0.27, 0.46],
}
// slight overlaps so adjacent sets CROSSFADE gently (each partial) instead of
// one popping out as the next pops in
export const OCEAN_BANDS = {
  island: [0.0, 0.44],
  ship: [0.3, 0.74],
  whale: [0.7, 1.0], // balloon parks ≈ p0.76, so its tag appears as it settles
}
