<template>
  <TransitionRoot as="template" :show="assemblyModalOpen">
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

      <div class="fixed justify-center items-center inset-0 z-50 p-10 w-screen h-screen">
        <div
          class="w-9/10 flex flex-col items-end justify-center p-4 text-center sm:items-center sm:p-0 h-full"
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
                <!-- Assembly Table -->
                <button
                  v-if="!assemblyTableShow"
                  @click="toggleAssemblyTable" 
                  class="absolute top-1/2 pt-16 left-2 transform -translate-y-1/2 mr-2 z-50"
                >
                  <ChevronRightIcon class="w-6 h-6 opacity-50" />
                </button>
                <button
                    v-if="assemblyTableShow"
                    @click="toggleAssemblyTable" 
                    class="absolute top-1/2 -right-2 transform -translate-y-1/2 mr-2 opacity-50 z-50"
                  >
                    <ChevronLeftIcon class="w-6 h-6" />
                </button>
                <TransitionRoot as="template" :show="assemblyTableShow">
                  <div class="relative w-2/5 h-full overflow-y-scroll overflow-x-hidden">
                    <!-- Search Bar and Table -->
                    <div class="relative mt-1 flex-1 px-4 sm:px-6">
                      <MaterialSearch />
                      <MaterialTable />
                    </div>
                    
                  </div>
                </TransitionRoot>

                <!-- 2d Viewer -->
                <div class="w-3/5 h-full">
                  <div class="flex flex-row justify-between">
                    <div>
                      <label for="assemblyName" class="block text-sm font-medium text-gray-700">Assembly Name</label>
                      <input
                        type="text"
                        id="assemblyName"
                        v-model="assemblyName"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter assembly name"
                      />
                    </div>
                    <div>
                      <label for="assemblyDescription" class="block text-sm font-medium text-gray-700">Assembly Description</label>
                      <input
                        type="text"
                        id="assemblyDescription"
                        v-model="assemblyDescription"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter assembly description"
                      />
                    </div>
                    <div>
                      <DropdownMulti
                        filterName="categories"
                        displayName="Categories"
                        :options="filterParameters.categories"
                        @update:options="updateFilterOptions('categories', $event)"
                      />
                    </div>
                    <div>
                      <DropdownMulti
                        filterName="materialTypes"
                        displayName="Material Types"
                        :options="filterParameters.materialTypes"
                        @update:options="updateFilterOptions('materialTypes', $event)"
                      />
                    </div>
                  </div>
                  <AssemlyViewer />
                </div>

                <!-- Material table -->
                <TransitionRoot as="template" :show="!assemblyTableShow">
                  <div class="w-2/5 h-full overflow-y-scroll overflow-x-hidden">
                    <!-- Search Bar and Table -->
                    <div class="relative mt-1 flex-1 px-4 sm:px-6">
                      <MaterialSearch />
                      <MaterialTable />
                    </div>
                  </div>
                </TransitionRoot>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </ProjectDialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

import { 
  ChevronRightIcon, 
  ChevronLeftIcon 
} from '@heroicons/vue/24/solid'

import { useNavigationStore } from '@/stores/navigation'
import MaterialTable from '@/components/Mapping/MaterialTable.vue'
import MaterialSearch from '@/components/Mapping/MaterialSearch.vue'
import AssemlyViewer from '@/components/Mapping/AssemblyViewer.vue'
import DropdownMulti from '@/components/Misc/DropdownMulti.vue'

import type { DropdownOption } from '@/models/pageLogic'

export default defineComponent({
  name: 'AssemblyModal',
  components: {
    ProjectDialog: Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    MaterialTable,
    MaterialSearch,
    AssemlyViewer,
    DropdownMulti,
    ChevronRightIcon, 
    ChevronLeftIcon
  },
  setup() {
    const navStore = useNavigationStore()

    const { assemblyModalOpen, assemblyTableShow } = storeToRefs(navStore)

    const assemblyName = ref('')
    const assemblyDescription = ref('')

    const filterParameters = ref({
      categories: [
        { label: 'Residential', value: 'residential', selected: false },
        { label: 'Commercial', value: 'commercial', selected: false },
        { label: 'Industrial', value: 'industrial', selected: false },
        { label: 'Agricultural', value: 'agricultural', selected: false },
      ],
      materialTypes: [
        { label: 'Wood', value: 'wood', selected: false },
        { label: 'Steel', value: 'steel', selected: false },
        { label: 'Concrete', value: 'concrete', selected: false },
        { label: 'Glass', value: 'glass', selected: false },
        { label: 'Plastic', value: 'plastic', selected: false },
      ],
    })

    const updateFilterOptions = (filterName: string, updatedOptions: DropdownOption[]) => {
      filterParameters.value[filterName] = updatedOptions
    }

    const closeModal = () => {
      navStore.toggleAssemblyModal()
    }

    const toggleAssemblyTable = () => {
      navStore.toggleAssemblyTable()
    }

    return {
      assemblyModalOpen,
      assemblyTableShow,
      assemblyName,
      assemblyDescription,
      filterParameters,
      closeModal,
      toggleAssemblyTable,
      updateFilterOptions,
    }
  }
})
</script>