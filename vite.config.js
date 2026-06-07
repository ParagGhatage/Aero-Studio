import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),

    VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  
  // Tells the plugin to generate the icon files from a source image
  // Place a high-res square source image at public/pwa-source.png (512x512 min)
  manifest: {
    name: 'Aero Studio',
    short_name: 'AeroStudio',
    description: 'Local-first media workspace',
    theme_color: '#0D0D0D',
    background_color: '#0D0D0D',
    display: 'standalone',
    start_url: '/',
    scope: '/',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    screenshots: [
      {
        src: 'screenshot-wide.png',     // 1280×800 or similar, in public/
        sizes: '1280x800',
        type: 'image/png',
        form_factor: 'wide',            // desktop
        label: 'Aero Studio desktop view'
      },
      {
        src: 'screenshot-narrow.png',   // 390×844 or similar, in public/
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',          // mobile
        label: 'Aero Studio mobile view'
      }
    ]
  }
})
  ],
})
