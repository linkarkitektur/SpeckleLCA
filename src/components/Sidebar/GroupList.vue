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
import { ref, onMounted, watch } from 'vue'
import Draggable from 'vuedraggable'
import { storeToRefs } from 'pinia'
import { 
	PlusCircleIcon
 } from '@heroicons/vue/24/solid'

import GroupCard from '@/components/Sidebar/GroupCard.vue'

import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'

import { useSpeckleStore } from '@/stores/speckle'
import { updateProjectGroups } from '@/utils/projectUtils'

import type { NestedGroup } from '@/models/filters'

const projectStore = useProjectStore()
const navStore = useNavigationStore()
const speckleStore = useSpeckleStore()

const { filterRegistry, projectGroups } = storeToRefs(projectStore)
const refTree = ref<NestedGroup[]>([])

const addGroup = () => {
	navStore.toggleGroupModal()
}

const ensureGroupColors = (groups: NestedGroup[]) => {
  if (!groups?.length) return
  
  try {
    speckleStore.calculateGroupColors(groups)
  } catch (error) {
    console.error('Error calculating group colors:', error)
  }
}

onMounted(() => {
	updateProjectGroups(true)
	refTree.value = projectStore.getGroupTree()?.children || []
	ensureGroupColors(refTree.value)
})

watch(
	() => filterRegistry.value?.filterCallStack,
	() => {
		updateProjectGroups(true)
		refTree.value = projectStore.getGroupTree()?.children || []
		ensureGroupColors(refTree.value)
		speckleStore.hideUnusedObjects(speckleStore.hiddenObjects.map(obj => obj.id))
	}
)

watch(
	projectGroups,
	() => {
		updateProjectGroups(false)
	},
	{ deep: true }
)
</script>
