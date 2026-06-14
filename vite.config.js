import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  build: {
    sourcemap: false, 
    chunkSizeWarningLimit: 1000, 
  },
  
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    Sitemap({
      hostname: 'https://aerostudio.xyz',
      dynamicRoutes: [
        '/',
        '/features',
        '/about',
        '/privacy',
        '/docs',
        '/app',
        '/images',
        '/images/gallery/albums',
        '/images/crop',
        '/images/compress'
      ] 
    }),
    VitePWA({
      registerType: 'autoUpdate',
      
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // ADD THIS: Runtime caching for external Google Fonts
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, // Cache for 1 year
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
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
            src: "/square-image_192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/square-image_512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
})