// Accessibility / perf flags, read once at load.
const mq =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null

export const prefersReducedMotion = !!(mq && mq.matches)

// Coarse "low power" heuristic — small viewport or reduced-motion. Used to trim
// particle counts and DPR on phones.
export const isLowPower =
  prefersReducedMotion ||
  (typeof window !== 'undefined' &&
    Math.min(window.innerWidth, window.innerHeight) < 700)
