import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

// GitHub Actions sets VITE_BASE to /<repository>/; local development uses /.
const base = process.env.VITE_BASE || '/'
export default defineConfig({
  base,
  plugins: [react(), {
    name: 'emit-word-list',
    generateBundle() { this.emitFile({ type: 'asset', fileName: 'cet6_words.json', source: readFileSync(new URL('./src/data/cet6_words.json', import.meta.url)) }) }
  }, VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
    manifest: {
      name: 'CET-6 六级刷词宝典', short_name: 'CET6', description: '离线可用的六级词汇练习',
      theme_color: '#2563eb', background_color: '#f5f7fb', display: 'standalone', lang: 'zh-CN',
      start_url: base, scope: base,
      icons: [
        { src: `${base}icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        { src: `${base}icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
      ]
    },
    workbox: { globPatterns: ['**/*.{js,css,html,json,svg,png,ico}'], navigateFallback: 'index.html' }
  })]
})
