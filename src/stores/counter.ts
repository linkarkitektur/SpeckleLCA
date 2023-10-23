import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/**
 * Counter store that keeps track of a count and provides a method to increment it.
 */
export const useCounterStore = defineStore('counter', () => {
  /**
   * The current count.
   */
  const count = ref(0)

  /**
   * The double of the current count.
   */
  const doubleCount = computed(() => count.value * 2)

  /**
   * Increments the count by 1.
   */
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
