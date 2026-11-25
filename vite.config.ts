import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  const enablePaidPwa = process.env.VITE_ENABLE_PAID_PWA === 'true';

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(enablePaidPwa
        ? [
            VitePWA({
              registerType: 'autoUpdate',
              includeAssets: ['icon.svg', 'apple-touch-icon.png'],
              manifest: {
                id: '/',
                name: 'ReliefApp — Relief Paysage Terrain & Propriétaire',
                short_name: 'ReliefApp',
                description:
                  'Application mobile terrain et espace propriétaire Relief Paysage (Grasse 06) : tournées, taille d’oliviers, conformité OLD, devis express et suivi domaine.',
                theme_color: '#0E281B',
                background_color: '#FAF8F3',
                display: 'standalone',
                orientation: 'portrait-primary',
                scope: '/',
                start_url: '/app',
                lang: 'fr',
                icons: [
                  {
                    src: 'pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: 'pwa-maskable-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                ],
              },
              workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
                navigateFallback: '/index.html',
                runtimeCaching: [
                  {
                    urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'google-fonts-cache',
                      expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 365,
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                ],
              },
              devOptions: {
                enabled: false,
                type: 'module',
              },
            }),
          ]
        : []),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
