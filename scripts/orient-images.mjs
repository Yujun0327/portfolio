// Bake EXIF orientation into project image pixels.
//
// Why: vite-imagetools (sharp) drops EXIF metadata when it generates the WebP
// derivatives and does NOT auto-rotate, so iPhone photos that relied on an EXIF
// "rotate me" flag render sideways. This normalizes each source image once —
// applies its orientation to the pixels and resets the flag to 1 — so the
// downstream WebP comes out upright. Idempotent: images already at orientation
// 1 (or formats without EXIF, e.g. PNG) are skipped, so it's safe to re-run.
//
// Runs automatically via the `predev` / `prebuild` npm scripts; or `npm run
// images:orient` by hand.
import sharp from 'sharp'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = 'src/assets/projects'
const ROTATABLE = /\.(jpe?g|webp|tiff?)$/i // formats that can carry EXIF orientation

let fixed = 0
for (const folder of await readdir(ROOT)) {
  const dir = join(ROOT, folder)
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    continue // not a directory
  }
  for (const e of entries) {
    if (!e.isFile() || !ROTATABLE.test(e.name)) continue
    const file = join(dir, e.name)
    const orientation = (await sharp(file).metadata()).orientation
    if (!orientation || orientation === 1) continue
    // .rotate() with no angle = apply EXIF orientation, then reset flag to 1
    const out = await sharp(await readFile(file)).rotate().toBuffer()
    await writeFile(file, out)
    console.log(`  oriented (was ${orientation}): ${file}`)
    fixed++
  }
}
console.log(fixed ? `Oriented ${fixed} image(s).` : 'Nothing to orient.')
