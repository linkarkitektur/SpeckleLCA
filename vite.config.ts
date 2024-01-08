/**
 * Configuration file for Vite.
 * @see {@link https://vitejs.dev/config/}
 */

import { sentryVitePlugin } from "@sentry/vite-plugin";
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// Load env file based on `mode` in the current working directory.
// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
const env = loadEnv('string', process.cwd(), '')

export default defineConfig({

  plugins: [vue(), sentryVitePlugin({
    org: "link-io",
    project: "speckle-lca-frontend",
    telemetry: false,
    authToken: env.VITE_SENTRY_AUTH_TOKEN,
  })],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) // Aliases for module resolution.
    }
  },

  test: {
    globals: true, // Enable jest-like global test APIs.
    environment: 'happy-dom', // Simulate DOM with happy-dom.
    setupFiles: [
      '/src/tests/setup/globalSetup.ts'
    ],
  },

  build: {
    sourcemap: false,
  }
})