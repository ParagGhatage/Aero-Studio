import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    // This removes the ~75MB chunk of code completely from production
    sourcemap: false, 
    chunkSizeWarningLimit: 1000, 
  },
  
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),

    VitePWA({
      registerType: 'autoUpdate',
      // Standard boilerplate configuration
      manifest: {
        name: 'Aero Studio',
        short_name: 'AeroStudio',
        description: 'Local-first media workspace',
        theme_color: '#0D0D0D',
        background_color: '#0D0D0D',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        "icons": [
  {
    "src": "/square-image_192.png",
    "sizes": "192x192",
    "type": "image/png"
  },
  {
    "src": "/square-image_512.png",
    "sizes": "512x512",
    "type": "image/png"
  }
]
      }
    })
  ],
})