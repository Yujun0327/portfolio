// A rough drawing-paper (도화지) tooth: fractal-noise grain, MULTIPLY blended over
// the world (above the canvas, below the UI so text stays crisp). Toggleable —
// the choice is remembered in localStorage so you can A/B whether you like it.
// The noise is brightened to [0.45, 1] and made opaque, so multiply darkens only
// the fibers (≈ −55% at darkest) instead of washing the whole frame.
const KEY = 'paper-texture'
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='0.55' intercept='0.45'/%3E%3CfeFuncG type='linear' slope='0.55' intercept='0.45'/%3E%3CfeFuncB type='linear' slope='0.55' intercept='0.45'/%3E%3CfeFuncA type='linear' slope='0' intercept='1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")"

// Texture is kept always-on (the toggle is hidden). Flip `localStorage['paper-texture']`
// to '0' in the console if you ever want to disable it without a rebuild.
export function PaperTexture() {
  const on = (() => {
    try {
      return localStorage.getItem(KEY) !== '0'
    } catch {
      return true
    }
  })()

  return <div className={`paper ${on ? 'is-on' : ''}`} style={{ backgroundImage: GRAIN }} aria-hidden />
}
