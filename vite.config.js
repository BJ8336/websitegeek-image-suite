import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Subfolder deployment on shared cPanel hosting (InterServer):
// https://websitegeek.net/image-suite/
export default defineConfig({
  base: '/image-suite/',
  plugins: [react(), tailwindcss()],
})
