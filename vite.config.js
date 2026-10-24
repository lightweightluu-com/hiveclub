import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

// App-Name und Farben hier anpassen – sie landen im Web-App-Manifest.
const APP_NAME = 'Hive Club Zürich';
const APP_SHORT_NAME = 'Hive';
const THEME_COLOR = '#0b0a09';
const BACKGROUND_COLOR = '#0b0a09';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: APP_NAME,
        short_name: APP_SHORT_NAME,
        description: 'Hive Club Zürich – Techno, House und Morphing Clubbing an der Geroldstrasse 5.',
        lang: 'de-CH',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        // API und Bilder laufen über den Worker, nie über die Offline-Shell.
        navigateFallbackDenylist: [/^\/api\//, /^\/img\//],
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}']
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: { motion: ['framer-motion'], react: ['react', 'react-dom'] }
      }
    }
  }
});
