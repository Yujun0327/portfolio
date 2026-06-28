# Fonts

The site uses **PP Editorial New** (Pangram Pangram). It's a licensed font, so the
files aren't committed here — drop them in **this folder** with these exact names:

- `PPEditorialNew-Ultralight.woff2`  → used for body / regular text (font-weight 300)
- `PPEditorialNew-Ultrabold.woff2`   → used for titles like the name (font-weight 700)

`woff2` is preferred. If you only have `.otf`/`.ttf`, either convert them to woff2
(e.g. https://cloudconvert.com/otf-to-woff2) or update the `@font-face` `src` URLs
and `format()` in `src/styles.css` to match.

Until the files are present, the site falls back to a serif (Times/Georgia), so
the layout still works — it just won't be the Editorial New look.
