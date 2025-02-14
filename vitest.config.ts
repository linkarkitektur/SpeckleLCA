/**
 * Merges the Vite configuration with the Vitest configuration.
 *
 * @returns The merged configuration object.
 */
import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig(async () => {
  return mergeConfig(
    await viteConfig,
    {
      test: {
        include: ['src/tests/**/*.{spec,test}.{js,ts,jsx,tsx}'],
        environment: 'happy-dom',
        setupFiles: ['/src/tests/setup/globalSetup.ts'],
        coverage: {
          provider: 'c8',
          reporter: ['text', 'json', 'html'],
          include: ['src/**/*.ts', 'src/**/*.vue'],
          exclude: ['src/tests/**/*', '**/*.d.ts']
        }
      }
    }
  )
})