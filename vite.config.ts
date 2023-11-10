import { sentryVitePlugin } from "@sentry/vite-plugin";
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), sentryVitePlugin({
    org: "link-io",
    project: "speckle-lca-frontend"
  })],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  test: {
    // enable jest-like global test APIs
    globals: true,
    // simulate DOM with happy-dom
    // (requires installing happy-dom as a peer dependency)
    environment: 'happy-dom',
    setupFiles: [
      '/src/tests/setup/globalSetup.ts'
    ],
  },

  build: {
    sourcemap: true
  }
})