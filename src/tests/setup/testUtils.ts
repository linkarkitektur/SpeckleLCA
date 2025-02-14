import { createPinia, setActivePinia } from 'pinia'

/**
 * Create a new Pinia instance and set it as the active Pinia instance.
 */
export function createTestPinia() {

  const pinia = createPinia()

  setActivePinia(pinia)

  return pinia

}