<template>
  <div class="fixed inset-y-0 z-40 flex w-96 flex-col">
    <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pt-20">
      <nav class="flex flex-1 flex-col pt-4">
        <Draggable
          v-if="refTree"
          :list="refTree"
          :group="refTree"
          item-key="id"
          ghost-class="ghost"
          :animation="200"
        >
          <template #item="{ element }">
            <div class="pt-4 pb-4">
              <GroupCard class="hover:cursor-move" :groups="element" />
            </div>
          </template>
        </Draggable>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import Draggable from 'vuedraggable'

import FilterList from '@/components/Sidebar/FilterList.vue'

import { useNavigationStore, useProjectStore } from '@/stores/main'

export default defineComponent({
  name: 'Sidebar',
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
