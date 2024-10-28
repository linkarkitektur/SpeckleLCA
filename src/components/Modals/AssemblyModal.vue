<template>
  <TransitionRoot as="template" :show="assemblyModalOpen">
    <ProjectDialog as="div" class="relative z-50" @close="closeModal">
      <!-- Background Overlay Transition -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed justify-center items-center inset-0 z-50 p-10 w-screen h-screen">
        <div
          class="w-9/10 flex flex-col items-end justify-center p-4 text-center sm:items-center sm:p-0 h-full overflow-hidden"
        >
          <!-- Dialog Panel Transition -->
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
                <!-- Assembly Table Toggle Buttons -->
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

                <!-- Assembly Table with Transition -->
                <!-- TODO: These transitions are not working -->
                <Transition
                  :show="assemblyTableShow"
                  enter="transform transition ease-in-out duration-500"
                  enter-from="-translate-x-full"
                  enter-to="translate-x-0"
                  leave="transform transition ease-in-out duration-500"
                  leave-from="translate-x-0"
                  leave-to="-translate-x-full"
                  name="slide-left"
                  mode="out-in"
                >
                  <!-- Search Bar and Table -->
                  <div 
                    v-if="assemblyTableShow"
                    class="relative w-2/5 h-full overflow-y-scroll overflow-x-hidden"
                  > 
                    <div
                      class="relative mt-1 flex-1 px-4 sm:px-6"
                    >
                      <button
                        @click="newAssembly"
                        class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      > NEW ASSEMBLY </button>
                      <SearchBar
                        :data="assemblyData"
                        :filterParam="assemblyFilterParams"
                        :sortingParam="sortingParameters"
                        @update:data="handleFilteredAssemblyData"
                      />
                      <AssemblyTable
                        :data="filteredAssemblies"
                      />
                    </div>
                  </div>
                </Transition>
                <!-- 2D Viewer and Form Inputs -->
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
                      <label for="assemblyCode" class="block text-sm font-medium text-gray-700">Assembly Code</label>
                      <Dropdown
                        :items="codes"
                        @selectedItem="handleSelectedItem"
                        name="codes"
                      />
                    </div>
                    <div>
                      <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                      <DropdownMulti
                        filterName="materialTypes"
                        displayName="Material Types"
                        :options="categories.materialTypes"
                        @update:options="updateFilterOptions('materialTypes', $event)"
                      />
                    </div>
                    <button @click="saveAssembly" class="save-button">
                      <BookmarkIcon class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <AssemblyViewer
                    :materials="materials"
                    @update:materials="updateMaterials"
                  />
                </div>

                <!-- Material Table with Transition -->
                <Transition
                  :show="assemblyTableShow"
                  enter="transform transition ease-in-out duration-500"
                  enter-from="translate-x-full"
                  enter-to="translate-x-0"
                  leave="transform transition ease-in-out duration-500"
                  leave-from="translate-x-0"
                  leave-to="translate-x-full"
                  name="slide-right"
                  mode="out-in"
                >                
                  <div 
                    v-if="!assemblyTableShow"
                    class="relative w-2/5 h-full overflow-y-scroll overflow-x-hidden"
                  >
                    <div class="relative mt-1 flex-1 px-4 sm:px-6">
                      <SearchBar
                        :data="productData"
                        :filterParam="productFilterParams"
                        :sortingParam="sortingParameters"
                        @update:data="handleFilteredData"
                      />
                      <MaterialTable
                        :data="filteredProducts"
                      />
                    </div>
                  </div>
                </Transition>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </ProjectDialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

import {
  ChevronRightIcon,
  ChevronLeftIcon,
  BookmarkIcon
} from '@heroicons/vue/24/solid'

import { useNavigationStore } from '@/stores/navigation'
import { useMaterialStore } from '@/stores/material'
import { useFirebaseStore } from '@/stores/firebase'
import { useProjectStore } from '@/stores/main'

import MaterialTable from '@/components/Mapping/MaterialTable.vue'
import MaterialSearch from '@/components/Misc/SearchBar.vue'
import AssemblyTable from '@/components/Mapping/AssemblyTable.vue'
import AssemblyViewer from '@/components/Mapping/AssemblyViewer.vue'
import DropdownMulti from '@/components/Misc/DropdownMulti.vue'
import Dropdown from '@/components/Misc/Dropdown.vue'
import SearchBar from '@/components/Misc/SearchBar.vue'

import { BSAB96 } from '@/models/material'
import type { dropdownItem } from '@/components/Misc/Dropdown.vue'
import type { DropdownOption } from '@/models/pageLogic'
import type { Assembly, Product } from '@/models/material'
import type { GeometryObject } from '@/models/geometryObject'

import { EmissionAggregator } from '@/utils/resultUtils'
import { EmissionCalculator } from '@/utils/emissionUtils'
import { createGeometryFromProduct } from '@/utils/material'

export default defineComponent({
  name: 'AssemblyModal',
  components: {
    ProjectDialog: Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    MaterialTable,
    SearchBar,
    AssemblyTable,
    AssemblyViewer,
    DropdownMulti,
    Dropdown,
    ChevronRightIcon,
    ChevronLeftIcon,
    BookmarkIcon,
  },
  setup() {
    const navStore = useNavigationStore()
    const materialStore = useMaterialStore()
    const firebaseStore = useFirebaseStore()
    const projectStore = useProjectStore()
    const { assemblyModalOpen, assemblyTableShow } = storeToRefs(navStore)
    const { currentAssemby } = storeToRefs(materialStore)

    const assemblyName = ref('')
    const assemblyDescription = ref('')
    const category = ref('')
    const materialType = ref('')
    const assemblyId = ref(crypto.randomUUID().toString())
    const codes = BSAB96

    //const filteredProducts = ref<Product[] | Assembly[]>([])
    
    const productFilterParams = [
      {
        paramName: 'metaData.materialType',
        displayName: 'Material Type',
      },
      {
        paramName: 'unit',
        displayName: 'Unit',
      },
    ]
    const assemblyFilterParams = [
      {
        paramName: 'category',
        displayName: 'Category',
      },
      {
        paramName: 'metaData.materialType',
        displayName: 'Material Type',
      },
    ]

    const sortingParameters = [
      {
        filterName: 'name',
        displayName: 'Name',
      },
      {
        filterName: 'unit',
        displayName: 'Unit',
      },
      {
        filterName: 'emission.gwp.a1a3.amount',
        displayName: 'Emission',
      },
    ]

    const filteredProducts = ref<Product[]>([])
    const filteredAssemblies = ref<Assembly[]>([])
    const productData = materialStore.materials
    const { assemblies: assemblyData } = storeToRefs(materialStore)

    // This is the assembly we are constructing
    const materials = ref<Product[]>([])

    const categories = ref({
      materialTypes: [
        { label: 'Wood', value: 'wood', selected: false },
        { label: 'Steel', value: 'steel', selected: false },
        { label: 'Concrete', value: 'concrete', selected: false },
        { label: 'Glass', value: 'glass', selected: false },
        { label: 'Plastic', value: 'plastic', selected: false },
      ],
    })

    //const handleFilteredData = (newData: Product[] | Assembly[]) => {
    const handleFilteredData = (newData: Product[]) => {
      filteredProducts.value = newData
    }

    const handleFilteredAssemblyData = (newData: Assembly[]) => {
      filteredAssemblies.value = newData
    }

    const updateFilterOptions = (filterName: string, updatedOptions: DropdownOption[]) => {
      categories.value[filterName] = updatedOptions
    }

    const closeModal = () => {
      navStore.toggleAssemblyModal()
    }

    const toggleAssemblyTable = () => {
      navStore.toggleAssemblyTable()
    }

    const handleSelectedItem = (selectedItem: dropdownItem) => {
      category.value = selectedItem.name
    }

    const updateMaterials = (newMaterials: Product[]) => {
      materials.value = newMaterials
    }

    const newAssembly = () => {
      assemblyId.value = crypto.randomUUID()
      assemblyName.value = ''
      assemblyDescription.value = ''
      category.value = ''
      materialType.value = ''
      materials.value = []

      navStore.toggleAssemblyTable()
    }

    const saveAssembly = () => {
      const products: Record<string, Product> = materials.value.reduce((acc, product) => {
        acc[product.metaData.appId] = product
        return acc
      }, {})

      const tempGeos: GeometryObject[] = materials.value.map(product =>
        createGeometryFromProduct(product)
      )

      const calculator = new EmissionCalculator(tempGeos)
      calculator.calculateEmissions()

      const aggregator = new EmissionAggregator(tempGeos)
      aggregator.aggregate(false)

      const name = assemblyName.value
      const description = assemblyDescription.value
      materialType.value = categories.value.materialTypes.find(type => type.selected)?.value || ''

      const assembly: Assembly = {
        id: assemblyId.value,
        name: name,
        description: description,
        products: products,
        emission: aggregator.totalEmission,
        comment: '',
        quantity: 1,
        unit: 'm2',
        category: category.value,
        classification: null, // We should add this here instead of category to use properly so we can have it mapped to multiple systems
        results: [],
        metaData: { materialType: materialType.value },
      }

      materialStore.addAssembly(assembly)
      firebaseStore.addAssemblyList(projectStore.currProject ? projectStore.currProject.id : "test", materialStore.assemblies)

      navStore.toggleAssemblyTable()

    }

    const handleLoadAssembly = (assembly: Assembly) => {
      assemblyId.value = assembly.id
      assemblyName.value = assembly.name
      assemblyDescription.value = assembly.description
      category.value = assembly.category
      materialType.value = assembly.metaData.materialType

      materials.value = Object.values(assembly.products)
      
      navStore.toggleAssemblyTable()
    }

    watch(currentAssemby, (newVal: Assembly | null) => {
      if (newVal) {
        handleLoadAssembly(newVal)
      }
    },
    { deep: true })

    return {
      assemblyModalOpen,
      assemblyTableShow,
      assemblyName,
      assemblyDescription,
      productFilterParams,
      assemblyFilterParams,
      sortingParameters,
      filteredProducts,
      filteredAssemblies,
      categories,
      codes,
      materials,
      productData,
      assemblyData,
      closeModal,
      toggleAssemblyTable,
      updateFilterOptions,
      updateMaterials,
      saveAssembly,
      handleSelectedItem,
      handleFilteredData,
      handleFilteredAssemblyData,
      newAssembly,
    }
  },
})
</script>