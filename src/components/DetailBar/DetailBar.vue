<template>
  <div id="DetailBar" class="absolute flex bottom-0 z-10 left-1/2 -translate-x-1/2 w-5/6 h-24 mb-8 rounded-2xl bg-gray-500 bg-opacity-50">
    <div class="flex w-full items-center justify-center">
      <label class="text-center">Detail bar info <br> Additional dynamic info goes here </label> 
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DetailBar',
  components: {},
  setup() {
    return {}
  },
})
</script>