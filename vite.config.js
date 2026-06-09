import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // 1. Force Vite to drop source maps in production
  build: {
    sourcemap: false, 
    chunkSizeWarningLimit: 1000, 
  },
  
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      
      // 2. Control exactly what the Service Worker caches
      workbox: {
        // Define the file types you actually need for offline functionality
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'], 
        
        // Explicitly block heavy files from the offline pre-cache cache
        globIgnores: [
          '**/*.map',               // Block any stray source maps
          'screenshot-*.png',       // PWA screenshots are for the install prompt, not offline use
          'test-media/**/*',        // Example: Block a folder containing dummy testing files
        ],
        
        
        
      },

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
            src: 'screenshot-wide.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Aero Studio desktop view'
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Aero Studio mobile view'
          }
        ]
      }
    })
  ],
})