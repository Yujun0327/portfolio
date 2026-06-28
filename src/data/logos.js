// Project logos, keyed by anchor id (see data/anchors.js). Drop a file named
// <anchorId>.png into src/assets/logos/ (e.g. mtn-0.png) and it attaches to that
// project's tag + intro automatically. vite-imagetools optimizes each to WebP at
// build/dev time. Missing logos (currently Student Union twr-0, OASIS twr-2)
// fall back to the placeholder mark on the tag and are skipped in the intro.
const logoModules = import.meta.glob('../assets/logos/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp}', {
  eager: true,
  query: { format: 'webp', w: '512', quality: '82' },
  import: 'default',
})

const LOGOS = {}
for (const [path, url] of Object.entries(logoModules)) {
  const m = path.match(/\/logos\/(.+)\.[^.]+$/)
  if (m) LOGOS[m[1]] = url
}

export function logoFor(anchorId) {
  return LOGOS[anchorId] || null
}
