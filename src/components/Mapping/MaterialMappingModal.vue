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
                  <div class="w-full p-2">
                    <MappingCard class="bg-gray-400 focus:ring-gray-600" :group="selectedGroup" />
                  </div>
                  <div 
                    v-for="(group, index) in selectedGroup.children" 
                    :key="group.id" 
                    class="flex pb-2 pr-2"
                  >
                    <div 
                      v-if="index != selectedGroup.children.length - 1" 
                      class="border-l-2 border-dashed border-neutral-400 flex-shrink-0 ml-2"
                    ></div>
                    <div 
                      v-else 
                      class="border-l-2 border-dashed border-neutral-400 flex-shrink-0 ml-2 max-h-8"
                    ></div>
                    <div class="border-t-2 border-dashed border-neutral-400 flex-grow pr-10 max-h-2 place-self-center"></div>
                    <MappingCard class="ml-1 p-2 flex-grow w-5/6 bg-gray-200" :group="group" />  
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
                    <SearchBar
                      :data="combinedMaterials"
                      :filterParam="filterParameters"
                      :sortingParam="sortingParameters"
                      @update:data="handleFilteredData"
                    />
                    <MaterialTable
                      :data="filteredMaterial"
                    />
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

import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'
import { useMaterialStore } from '@/stores/material'
import { useSettingsStore } from '@/stores/settings'

import MappingCard from '@/components/Mapping/MaterialMappingCard.vue'
import MaterialTable from '@/components/Mapping/MaterialTable.vue'
import SearchBar from '@/components/Misc/SearchBar.vue'

import type { NestedGroup } from '@/models/filters'
import type { Product, Assembly } from '@/models/material'

export default defineComponent({
  name: 'MaterialMappingModal',
  components: {
    ProjectDialog: Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    MappingCard,
    MaterialTable,
    SearchBar
  },
  setup() {
    const navStore = useNavigationStore()
    const projectStore = useProjectStore()
    const materialStore = useMaterialStore()
    const settingsStore = useSettingsStore()

    const materials = storeToRefs(materialStore).materials
    const assemblies = storeToRefs(materialStore).assemblies

    const filteredMaterial = ref<(Product | Assembly)[]>([])

    const { selectedGroup } = storeToRefs(projectStore)
    const { mappingModalOpen} = storeToRefs(navStore)
    
    const filterParameters = settingsStore.materialSettings.filterParams
    const sortingParameters = settingsStore.materialSettings.sortingParams

    const searchQuery = ref('')
    // If no data selected or available show this instead, mostly for debug
    const emptyGroup: NestedGroup = {
      id: 'empty',
      name: 'No group selected',
      children: [],
      objects: [],
    }

    const combinedMaterials = computed(() => [
      ...materials.value,
      ...assemblies.value,
    ])
    
    const handleFilteredData = (newData: (Product | Assembly)[]) => {
      filteredMaterial.value = newData
    }

    const closeModal = () => {
      navStore.toggleMappingModal()
    }

    return {
      mappingModalOpen,
      selectedGroup,
      searchQuery,
      emptyGroup,
      materials,
      combinedMaterials,
      filteredMaterial,
      filterParameters,
      sortingParameters,
      handleFilteredData,
      closeModal,
    }
  }
})
</script>