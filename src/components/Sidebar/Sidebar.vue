<template>
  <div class="relative inset-y-16 z-40 flex h-[calc(100vh-4rem)] w-1/4 flex-col">
    <div 
      class="flex grow h-[calc(100vh-12rem)] flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pt-4"
    >
      <!-- This should be in its own component and switch dynamically -->
      <component :is="currentList" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import Draggable from 'vuedraggable'

import FilterList from '@/components/Sidebar/FilterList.vue'

import { useNavigationStore } from '@/stores/main'

export default defineComponent({
  name: 'SideBar',
  components: {
    Draggable,
    FilterList,
  },
  setup() {
    const navStore = useNavigationStore()

    const currentList = computed(() => {
      if (navStore.activePage === "Overview")
        return FilterList;
      else if (navStore.activePage === "Mapping")
        return null;
      else if (navStore.activePage === "Results")
        return null;
      else if (navStore.activePage === "Benchmark")
        return null;
      else
        return null;
    })
    return {
      currentList
    }
  }
  
})
</script>

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>
