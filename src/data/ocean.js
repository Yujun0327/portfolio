import { LANDMARKS } from './journey'

// Single source of truth for ocean placement, shared by OceanShowcase (geometry)
// and anchors.js (tag positions) so they never drift apart.
const OCEAN = LANDMARKS.oceanCenter
export const SEA_Y = OCEAN[1]

export const ISLANDS = [
  { p: [OCEAN[0] - 75, OCEAN[2] + 30], r: 16 },
  { p: [OCEAN[0] + 60, OCEAN[2] + 80], r: 22 },
  { p: [OCEAN[0] - 56, OCEAN[2] + 165], r: 12 },
  { p: [OCEAN[0] - 20, OCEAN[2] + 120], r: 9 },
]

export const ENTRY = [-40, 472] // ships' low-x / high-z entry corner
export const SHIP_ISLANDS = [1, 0, 2] // which island each of the 3 ships docks at
export const BREACH = [43, 431] // whale breach point (island centroid)

// Per-ship route: entry point, dock just off its island, and heading. (Timing
// lives in OceanShowcase.)
export function shipRoutes() {
  return SHIP_ISLANDS.map((islIdx, k) => {
    const isl = ISLANDS[islIdx]
    const entry = [ENTRY[0] + (k - 1) * 24, ENTRY[1] + (k - 1) * -12]
    const dx = isl.p[0] - entry[0]
    const dz = isl.p[1] - entry[1]
    const len = Math.hypot(dx, dz) || 1
    const ux = dx / len
    const uz = dz / len
    const dock = [isl.p[0] - ux * (isl.r + 6), isl.p[1] - uz * (isl.r + 6)]
    const heading = Math.atan2(-uz, ux)
    return { design: k, entry, dock, heading }
  })
}
