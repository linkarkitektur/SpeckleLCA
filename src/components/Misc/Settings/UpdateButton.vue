<template>
  <button 
    type="button" 
    class="font-semibold text-green-600 hover:text-green-500"
    @click="handleClick"
  >
    {{ label }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UpdateButton',
  props: {
    label: {
      type: String,
      default: 'Update',
    },
  },
  emits: ['click'],
  setup(_, { emit }) {
    const handleClick = () => {
      emit('click')
    }
    return { handleClick }
  },
})
</script>