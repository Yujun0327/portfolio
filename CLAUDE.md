# CLAUDE.md — "Source → Sea" portfolio

A scroll-driven 3D **wireframe** portfolio: one continuous white-on-paper line-art world
(sun → mountain/spring → river + towns → ocean) that a single camera travels by scroll.
Liquid-glass project "tags" float on key objects; an ambient soundtrack + synthesized SFX play.

## Run
- `npm run dev` → http://localhost:5173 (dev). `npm run build` (prod, also the best check that all
  imports/JSX compile). `npm run preview` → http://localhost:4173.
- **Run the dev server in a normal terminal**, not a backgrounded/ephemeral process — it gets killed
  otherwise. `cd ~/projects/portfolio && npm run dev`.
- It's a **Vite + React app** — opening `index.html` directly does NOT work (needs Vite to compile JSX).

## Stack
Vite · React · **@react-three/fiber** + **@react-three/drei** + **@react-three/postprocessing** · three ·
simplex-noise · lenis/gsap (easing) · Web Audio API (SFX). JavaScript (no TS).

## Aesthetic (do not break)
Everything is **white/black lines on a paper background** — no fills, no textures, no lights. Palette &
mode live in `src/data/journey.js` (`MODE='light'`, `COLORS`). Lines use `lineBasicMaterial`
(`transparent`, `depthWrite:false`, blending per `MODE`) — see `src/components/Wire.jsx`. Build geometry
as merged line segments for cheap draw calls (`src/utils/mergeWire.js`: `mergeRingsToSegments`,
`instanceEdges`, `mergeWire`; `src/utils/geometry.js`: `contourRings`, `ringPoints`, `edgesOf`).

## ⚠️ Critical constraints
- **`src/world/Paths.js` is the HAND-TUNED camera** (weighted `KEYFRAMES` + `offsetToT`). Treat it as
  **read-only** unless the user explicitly asks to change camera motion. Do not re-pace/refactor it.
  `KEYFRAMES` items are `{eye:[x,y,z], look:[x,y,z], w}` where `w` = that segment's scroll-duration
  weight. Some have a `tag` (e.g. `'oceanShowcase'`) used by `offsetRangeForTag(tag)`.
- **Content is placeholder by design.** Real project titles/blurbs/images go in `src/data/projects.js`;
  tag positions in `src/data/anchors.js`. Don't invent real content.
- **The world is one persistent scene graph** (`src/world/World.jsx`): every scene is always mounted; the
  camera reveals each beat. Nothing pops in / hard-fades — fades are driven by scroll, not unmounting.

## How it fits together
- **Scroll → camera.** drei `<ScrollControls>` (in `src/components/CanvasRoot.jsx`) → `useScrollProgress`
  writes a single offset 0..1 into `src/hooks/scrollStore.js` (`scrollStore.offset`). Read it in
  `useFrame`/rAF — **never in React render**. `CameraRig.jsx` samples the keyframe curves by offset,
  adds a mouse-parallax lean (ramps in after the sun stage) and a zoom-to-anchor override when a tag is
  open.
- **Scenes** (`src/scenes/`): `Sun, Mountain, Spring, River, Towns, WildTerrain, Scenery, Ocean,
  OceanShowcase, Birds`. Shared ocean constants in `src/data/ocean.js`; statue placement in
  `src/utils/places.js` (`getStatues`, `nearStatue`). `OceanShowcase` = the held-camera set-piece
  (3 ships dock + a humpback whale breaches; geometry in `src/utils/ships.js`, `src/utils/whale.js`).
- **Project tags** (liquid glass): `src/world/TagProjector.jsx` (in-canvas) projects each anchor to
  screen + computes stage opacity → writes a Float32Array in `src/hooks/uiStore.js`. The DOM layer
  `src/components/TagLayer.jsx` positions/tilts the glass tags from that buffer (imperative, no
  re-render). Click opens `src/components/ProjectModal.jsx` (camera zooms, scroll locks via `uiStore`).
  Anchors + stage windows: `src/data/anchors.js` (`ANCHORS`, `STAGE_WINDOWS`, `OCEAN_BANDS`).
- **Audio** (`src/components/Audio.jsx` + `src/audio/synth.js`): BGM (`/public/audio/bgm.mp3`) loops,
  starts on first **click** (scroll isn't a valid autoplay gesture); bottom-left vertical volume slider.
  SFX are **synthesized** (Web Audio) — `ambientCue` chimes at each holistic scene, `finale` scale at the
  end, `hoverTone` singing-bowl on tag hover. **Set the musical key via `KEY` at the top of
  `synth.js`.** SFX level follows the slider.

## Key tunables (where to look)
- Camera pacing: `w` weights in `Paths.js`. Mouse parallax / zoom: consts in `CameraRig.jsx`.
- Tag timing: `STAGE_WINDOWS` / `OCEAN_BANDS` in `data/anchors.js` (+ envelope `f` in `TagProjector.jsx`).
- Tag look: `src/styles.css` (`.tag*`). Statue offsets: `TOWN_STATUES` in `places.js`.
- Showcase: consts at top of `OceanShowcase.jsx` (`SHIP_ISLANDS`, `BREACH`, `WHALE_YAW`, …).
- Audio: `KEY`, `ambientCue`, `finale`, reverb in `synth.js`; cue offsets in `Audio.jsx`.
- Ocean boundary circle: `BOUNDARY_CENTER`/`BOUNDARY_R` in `Ocean.jsx`.

## Conventions
- No per-frame allocation in `useFrame`/rAF — pre-allocate scratch vectors (`useMemo`).
- Respect `src/utils/reducedMotion.js` (`prefersReducedMotion`, `isLowPower`) for animation/particle gating.
- Fonts: **PP Editorial New** (intro/overlay), **Clash Display** (tags) — `@font-face` in `styles.css`,
  files in `public/fonts/`. Buttons need `font-family: inherit` (they don't inherit by default).

## Gotchas
- Headless `node --input-type=module` can't resolve the project's extensionless imports — rely on
  `npm run build` to validate imports; geometry NaN-checks must inline-replicate or run from a script the
  bundler sees.
- Dead/unused (safe to delete; `rm` may be permission-blocked): `src/scenes/CircleSource.jsx`,
  `_verify-camera.mjs`, `public/fonts/PPEditorialNew-Free for personal use/`,
  `public/fonts/Clash Display Font/`, stray `.DS_Store`.

## Status
Map + camera + ocean set-piece + liquid-glass tags + audio (BGM + synth SFX) are built. Remaining:
real project content (`data/projects.js`), final tuning of tag stage-timing, and the soundtrack key.
