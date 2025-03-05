<template>
  <button
    :aria-label="ariaLabel"
    class="relative flex items-center justify-center whitespace-nowrap p-2 h-8 text-sm styled-element hoverable-sm pressable"
    @click="$emit('onClick')"
    :style="{ backgroundColor: navStore.activeColor }"
  >
    <span class="flex items-center gap-2">
      <p>{{ text }}</p>
      <component :is="icon" class="h-5 w-5" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { useNavigationStore } from '@/stores/navigation'

const navStore = useNavigationStore()

defineProps<{
  text: string
  icon?: any
  ariaLabel?: string
}>()

defineEmits<{
  onClick: []
}>()
</script>