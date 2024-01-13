import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  appType: 'mpa',
  assetsInclude: ['**/*.html'],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
})
