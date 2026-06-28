import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  plugins: [
    react(),
    // case-insensitive include so uppercase extensions (IMG_xxxx.JPG) are
    // transformed too (default include is lowercase-only)
    imagetools({ include: /^[^?]+\.(heif|heic|avif|jpe?g|png|tiff|webp|gif)(\?.*)?$/i }),
  ],
  server: { host: true },
})
