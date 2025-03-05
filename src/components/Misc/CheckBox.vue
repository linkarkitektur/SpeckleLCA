<template>
  <input
    :id="id"
    :name="name"
    :value="value"
    type="checkbox"
    class="h-4 w-4 styled-element rounded-none text-black focus:ring-0 focus:outline-none"
    :checked="checked"
    @change="$emit('update:checked', ($event.target as HTMLInputElement).checked)"
  />
</template>

<script setup lang="ts">
defineProps<{
  id: string
  name: string
  value: string
  checked: boolean
}>()

defineEmits<{
  'update:checked': [boolean]
}>()
</script>