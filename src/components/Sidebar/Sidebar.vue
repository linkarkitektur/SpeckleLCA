<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div 
    class="relative mt-16 z-40 flex h-[calc(100vh-4rem)] w-1/3 flex-col"
  >
    <div 
      class="flex grow h-full flex-col gap-y-5 overflow-y-auto border-gray-200 px-6 pt-4"
    >
      <GroupList />
    </div>
  </div>
</template>

<script setup lang="ts">
import GroupList from '@/components/Sidebar/GroupList.vue'
</script>

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>