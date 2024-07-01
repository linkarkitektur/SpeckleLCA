/**
 * Configuration file for Vite.
 * @see {@link https://vitejs.dev/config/}
 */

import { sentryVitePlugin } from '@sentry/vite-plugin'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	/**
	 * Plugins used by Vite.
	 */
	plugins: [
		vue(),
		sentryVitePlugin({
			org: 'link-io',
			project: 'speckle-lca-frontend'
		})
	],

	/**
	 * Resolve configuration for Vite.
	 */
	resolve: {
		/**
		 * Aliases for module resolution.
		 */
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},

	/**
	 * Test configuration for Vite.
	 */
	test: {
		/**
		 * Enable jest-like global test APIs.
		 */
		globals: true,
		/**
		 * Simulate DOM with happy-dom.
		 * (requires installing happy-dom as a peer dependency)
		 */
		environment: 'happy-dom',
		/**
		 * Setup files for tests.
		 */
		setupFiles: ['/src/tests/setup/globalSetup.ts']
	},

	/**
	 * Build configuration for Vite.
	 */
	build: {
		/**
		 * Generate sourcemaps for debugging.
		 */
		sourcemap: true
	}
})
