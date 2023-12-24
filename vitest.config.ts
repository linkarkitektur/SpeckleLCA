/**
 * Merges the Vite configuration with the Vitest configuration.
 *
 * @returns The merged configuration object.
 */
import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import * as config from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  config.defineConfig(() => ({
    test: {
      environment: 'jsdom',
      exclude: [...config.configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    }
  })) as config.UserConfig
)
