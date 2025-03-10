<template>
  <input
    :id="id"
    :name="name"
    :value="modelValue"
    :placeholder="placeholder"
    type="text"
    class="w-full p-1 styled-element styled-data pressable-focus focus:ring-2 focus:ring-black"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  name?: string
  modelValue: string | number
  placeholder?: string
}>()

// Name defaults to id if not set
const name = computed(() => props.name ?? props.id)

defineEmits<{
  'update:modelValue': [string | number]
}>()
</script>