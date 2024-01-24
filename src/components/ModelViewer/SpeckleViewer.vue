<template>
  <div class="relative inset-y-16 p-6 w-2/3 h-[calc(100vh-4rem)] bg-gray-100 overflow-hidden">
    <h1 class="text-2xl font-bold mb-4">Model View</h1>
    <!-- Your content for the ModelView -->
    <div class="bg-gradient-to-b from-cyan-100 to-blue-100 p-4 mb-12 shadow-md h-full rounded-md">
      <!-- Example content -->
      <p>Your model content goes here...</p>
    </div>
    <DetailBar />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DetailBar from '@/components/DetailBar/DetailBar.vue';

export default defineComponent({
  name: 'SpeckleViewer',
  components: {
    DetailBar
  },
  setup() {},
  // Component logic
})
</script>
