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
              class="transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:max-w-sm sm:p-6 min-w-full h-full"
            >
              <div class="flex pb-2 h-full justify-between items-center">
                <div v-if="selectedGroup != null" class="w-1/2 h-full overflow-y-scroll">
                  <div class="w-full p-1">
                    <MaterialMappingCard :group="selectedGroup" />
                  </div>
                  <div v-for="group in selectedGroup.children" :key="group.id" class="w-5/6 ml-[8%] flex flex-col items-center justify-center">
                    <div class="border-l-2 border-dashed h-6 border-neutral-400 m-1"></div>
                    <MaterialMappingCard :group="group" />  
                  </div>
                </div>
                <div v-else class="w-1/2 h-full">
                  <div class="w-full p-1">
                    <MaterialMappingCard :group="emptyGroup" />
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
                    <!-- Table -->
                    <table class="divide-y divide-gray-200 max-w-full block table-fixed">
                      <thead class="w-full block">
                        <tr class="w-full flex bg-gray-200 text-gray-700 text-left text-xs leading-4 font-medium uppercase tracking-wider whitespace-nowrap">
                          <th class="m-3 w-2/6">
                            Name
                          </th>
                          <th class="m-3 w-2/6">
                            Material Type
                          </th>
                          <th class="m-3 w-1/6">
                            Unit
                          </th>
                          <th class="m-3 w-1/6">
                            Emission
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-gray-100 divide-y divide-gray-300 max-w-full block table-fixed">
                        <tr 
                          v-for="(material, index) in materialStore.materials" 
                          :key="material.id"
                          class="text-xs whitespace-no-wrap w-full flex"
                        >
                          <td class="m-2 w-2/6 line-clamp-3">{{ material.name }}</td>
                          <td class="m-2 w-2/6">{{ material.subType}}</td>
                          <td class="m-2 w-1/6">{{ material.declared_unit }}</td>
                          <td 
                            :class="{'text-red-600' : roundedEmissions[index].isPositive, 'text-green-600' : !roundedEmissions[index].isPositive}"
                            class="m-2 w-1/6"
                          >
                              {{ roundedEmissions[index].value }} 
                            <br>
                              kg/CO<sub>2</sub>
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
import { useMaterialStore } from '@/stores/material'
import MaterialMappingCard from '@/components/MaterialMappingCard.vue'
import type { NestedGroup } from '@/models/filters'

export default defineComponent({
  name: 'MaterialMappingModal',
  components: {
    ProjectDialog: Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    MaterialMappingCard,
  },

  setup() {
    const navStore = useNavigationStore()
    const projectStore = useProjectStore()
    const materialStore = useMaterialStore()
    
    const { selectedGroup } = storeToRefs(projectStore)
    const { mappingModalOpen} = storeToRefs(navStore)

    materialStore.materialsFromJson()
    const searchQuery = ref('')
    // If no data selected or available show this instead, this should never happen so can remove from final version
    const emptyGroup: NestedGroup = {
      id: 'empty',
      name: 'No group selected',
      children: [],
      objects: [],
    }

    const materials = ref(materialStore.materials)  
    const roundedEmissions = computed(() => {
      return materials.value.map(mat => {
        const value = parseFloat(String(mat.gwp?.a1a3 ?? '0'))
        if (!isNaN(value)) {
          const decimals = (value.toString().split('.')[1] || '').length
          return {
            value: decimals > 2 ? value.toFixed(2) : value.toString(),
            isPositive: value > 0
          }
        } else {
          return {
            value: '0',
            isPositive: false
          }
        }
      })
    })
    const closeModal = () => {
      navStore.toggleMappingModal()
    }

    return {
      mappingModalOpen,
      selectedGroup,
      searchQuery,
      emptyGroup,
      materialStore,
      roundedEmissions,
      closeModal,
      
    }
  },
})
</script>@/stores/material