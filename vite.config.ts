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
		//sentryVitePlugin({
		//	org: 'link-io',
		//	project: 'speckle-lca-frontend'
		//})
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
		outDir: 'dist',
		sourcemap: true
	},

	base: '/SpeckleLCA/',

	server: {
    proxy: {
			'/SpeckleLCA/api/revalu': {
				target: 'https://api.revalu.io',
				changeOrigin: true,
				rewrite: (path) => {
					return path.replace(/^\/SpeckleLCA\/api\/revalu/, '')
				},
				secure: true,
			},
      '/SpeckleLCA/api/eco': {
				target: 'https://data.eco-platform.org',
				changeOrigin: true,
				rewrite: (path) => {
					return path.replace(/^\/SpeckleLCA\/api\/eco/, ''); // Removes the entire prefix
				},
				secure: true,
			},
      '/SpeckleLCA/EPD-NORWAY_DIGI': {
				target: 'https://epdnorway.lca-data.com/resource/processes/',
				changeOrigin: true,
				rewrite: (path) => {
					return path.replace(/^\/SpeckleLCA\/EPD-NORWAY_DIGI/, ''); // Removes the entire prefix
				},
				secure: true,
			},
    },
  },
})
