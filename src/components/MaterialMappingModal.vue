<template>
  <TransitionRoot as="template" :show="mappingModalOpen">
    <ProjectDialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed justify-center items-center inset-0 left-[12.5%] z-50 p-10 w-screen h-screen">
        <div
          class="w-3/4 flex flex-col items-end justify-center p-4 text-center sm:items-center sm:p-0 h-full"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all min-w-full h-full sm:my-8 sm:max-w-sm sm:p-6"
            >
              <div class="flex pb-2 h-full justify-between items-center">
                <div 
                  v-if="selectedGroup != null" 
                  class="w-1/2 h-full overflow-y-scroll"
                >
                  <div class="w-full p-1">
                    <MappingCard :group="selectedGroup" />
                  </div>
                  <div 
                    v-for="group in selectedGroup.children" 
                    :key="group.id" 
                    class="w-5/6 ml-[8%] flex flex-col items-center justify-center"
                  >
                    <div class="border-l-2 border-dashed h-6 border-neutral-400 m-1"></div>
                    <MappingCard :group="group" />  
                  </div>
                </div>
                <div v-else class="w-1/2 h-full">
                  <div class="w-full p-1">
                    <MappingCard :group="emptyGroup" />
                  </div>
                </div>
                <div class="w-1/2 h-full overflow-y-scroll overflow-x-hidden">
                  <!-- Search Bar and Table -->
                  <div class="relative mt-1 flex-1 px-4 sm:px-6">
                    <!-- Search Bar -->
                    <div class="p-4">
                      <input
                        type="text"
                        v-model="searchQuery"
                        placeholder="Search..."
                        class="w-full border p-2 rounded-md"
                      />
                    </div>
                    <MaterialTable />
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </ProjectDialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

import { useNavigationStore, useProjectStore } from '@/stores/main'
import MappingCard from '@/components/MaterialMappingCard.vue'
import MaterialTable from '@/components/MaterialTable.vue'

import type { NestedGroup } from '@/models/filters'

export default defineComponent({
  name: 'MaterialMappingModal',
  components: {
    ProjectDialog: Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    MappingCard,
    MaterialTable
  },
  setup() {
    const navStore = useNavigationStore()
    const projectStore = useProjectStore()

    const { selectedGroup } = storeToRefs(projectStore)
    const { mappingModalOpen} = storeToRefs(navStore)

    const searchQuery = ref('')
    // If no data selected or available show this instead, this should never happen so can remove from final version
    const emptyGroup: NestedGroup = {
      id: 'empty',
      name: 'No group selected',
      children: [],
      objects: [],
    }
 
    const closeModal = () => {
      navStore.toggleMappingModal()
    }

    return {
      mappingModalOpen,
      selectedGroup,
      searchQuery,
      emptyGroup,
      closeModal,
    }
  }
})
</script>