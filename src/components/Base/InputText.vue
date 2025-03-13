<template>
  <input
    :id="id"
    :name="name"
    :value="modelValue"
    :placeholder="placeholder"
    :type="inputType"
    :step="isNumber ? '1' : undefined"
    :class="[
      widthClass,
      'p-1 styled-element styled-data pressable-focus focus:ring-2 focus:ring-black',
      { '[appearance:textfield]': !isNumber }
    ]"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  name?: string
  modelValue: string | number
  placeholder?: string
  width?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string | number]
}>()

// Computed properties
const name = computed(() => props.name ?? props.id)
const widthClass = computed(() => props.width ?? 'w-full')
const isNumber = computed(() => typeof props.modelValue === 'number')
const inputType = computed(() => isNumber.value ? 'number' : 'text')

// Methods
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = isNumber.value ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

</script>

<style scoped>
/* Custom styling for number input arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
  height: 1.5em;
  cursor: pointer;
}
</style>