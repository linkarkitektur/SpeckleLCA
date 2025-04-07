<template>
  <nav class="flex flex-col h-full overflow-hidden">
    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
      <Draggable
        v-if="refTree && refTree.length"
        :list="refTree"
        :group="refTree"
        item-key="id"
        ghost-class="ghost"
        :animation="200"
      >
        <template #item="{ element }">
          <div class="px-2 py-4">
            <GroupCard class="hover:cursor-move" :groups="element" />
          </div>
        </template>
      </Draggable>

      <!-- Add group button -->
      <div class="p-10 grid place-items-center">
        <button @click="addGroup">
          <PlusCircleIcon class="h-10 w-10 text-green-600 hover:text-green-500" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import Draggable from 'vuedraggable'
import { storeToRefs } from 'pinia'
import { 
	PlusCircleIcon
 } from '@heroicons/vue/24/solid'

import GroupCard from '@/components/Sidebar/GroupCard.vue'

import { useProjectStore } from '@/stores/projectStore'
import { useNavigationStore } from '@/stores/navigationStore'

import { useSpeckleStore } from '@/stores/speckleStore'
import { updateProjectGroups } from '@/utils/projectUtils'

const projectStore = useProjectStore()
const navStore = useNavigationStore()
const speckleStore = useSpeckleStore()

const { projectGroups } = storeToRefs(projectStore)

const refTree = computed(() => {
  const tree = projectStore.getGroupTree()
  return tree?.children || []
})

const addGroup = () => {
	navStore.toggleGroupModal()
}

// Watch group colors on change of refTree
watch(refTree, (newTree) => {
  if (newTree?.length) {
    try {
      speckleStore.calculateGroupColors(newTree)
    } catch (error) {
      console.error('Error calculating group colors:', error)
    }
  }
}, { immediate: true })
</script>
