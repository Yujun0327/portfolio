// The journey timeline + world constants.
//
// Beats (driven by the camera path, not by hard scene cuts):
//   Sun intro -> spring close-up -> HOLISTIC mountain -> stool rotation
//   -> river towns -> HOLISTIC river+villages -> wild river -> close water
//   -> HOLISTIC ocean. The three "holistic" overviews are where project
//   outlines will be shown all at once (later milestone).

export const SCENE_RANGES = {
  sun: [0.0, 0.13],
  mountain: [0.13, 0.26],
  rotation: [0.26, 0.4],
  towns: [0.4, 0.62],
  wild: [0.62, 0.86],
  ocean: [0.86, 1.0],
}

// Scrollable height in viewport-heights. Higher = slower, more inspectable.
export const SCROLL_PAGES = 20

// ---- Palette ----------------------------------------------------------------
// 'light' = paper-white void + black ink lines (current direction).
// 'dark'  = black void + glowing white lines (original).
export const MODE = 'light'

const PALETTES = {
  light: { bg: '#f3f1ea', line: '#0a0a0a', fog: 0xf3f1ea, bloom: false, blend: 'normal' },
  dark: { bg: '#000000', line: '#ffffff', fog: 0x000000, bloom: true, blend: 'additive' },
}

export const COLORS = PALETTES[MODE]

// ---- World landmarks --------------------------------------------------------
// Units are arbitrary "world meters". The mountain sits in FRONT of the start
// (negative Z); the river is born at its foot and flows toward +Z, passing
// UNDER the "stool" (the fixed point the camera rotates on) and onward to sea.
export const LANDMARKS = {
  sun: [0, 152, -45], // the source symbol, high in "space" above the summit
  sunRadius: 13, // small relative to the mountain (believable scale)
  summit: [0, 56, -45], // spring sits just below this
  mountainBase: [0, 0, -45],
  stool: [0, 13, 41], // camera pivot for the in-place rotation
  riverMouth: [40, -7, 235],
  oceanCenter: [66, -9, 332],
}
