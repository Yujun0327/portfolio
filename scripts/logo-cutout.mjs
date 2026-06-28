// Make logo backgrounds transparent.
//
// The source logos are flat RGB on a near-white background. This removes the
// background by FLOOD-FILLING inward from the image border: only near-white
// pixels CONNECTED to the edge are made transparent, so white that lives inside
// the logo (counters, highlights) is preserved. Idempotent: a logo that already
// has meaningful transparency is skipped, so it's safe to re-run after adding
// new logos. Overwrites src/assets/logos/*.png (originals remain in ./logos).
import sharp from 'sharp'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DIR = 'src/assets/logos'
const T = 234 // a channel >= T (and low saturation) counts as background-white
const SAT = 16 // max(rgb) - min(rgb) below this = unsaturated (greyish/white)

function isWhite(d, i) {
  const r = d[i],
    g = d[i + 1],
    b = d[i + 2]
  if (r < T || g < T || b < T) return false
  return Math.max(r, g, b) - Math.min(r, g, b) <= SAT
}

let done = 0
for (const f of (await readdir(DIR)).filter((x) => /\.png$/i.test(x)).sort()) {
  const file = join(DIR, f)
  const { data, info } = await sharp(await readFile(file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const ch = 4

  // skip if already transparent enough
  let transp = 0
  for (let i = 3; i < data.length; i += ch) if (data[i] < 16) transp++
  if (transp / (w * h) > 0.05) {
    console.log(`  skip (already transparent): ${f}`)
    continue
  }

  // flood fill from the border over connected white
  const seen = new Uint8Array(w * h)
  const stack = []
  const pushIf = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const p = y * w + x
    if (seen[p]) return
    if (!isWhite(data, p * ch)) return
    seen[p] = 1
    stack.push(p)
  }
  for (let x = 0; x < w; x++) {
    pushIf(x, 0)
    pushIf(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    pushIf(0, y)
    pushIf(w - 1, y)
  }
  while (stack.length) {
    const p = stack.pop()
    data[p * ch + 3] = 0 // transparent
    const x = p % w,
      y = (p / w) | 0
    pushIf(x - 1, y)
    pushIf(x + 1, y)
    pushIf(x, y - 1)
    pushIf(x, y + 1)
  }

  const out = await sharp(data, { raw: { width: w, height: h, channels: ch } }).png().toBuffer()
  await writeFile(file, out)
  console.log(`  cut out: ${f}`)
  done++
}
console.log(done ? `Made ${done} logo(s) transparent.` : 'Nothing to do.')
