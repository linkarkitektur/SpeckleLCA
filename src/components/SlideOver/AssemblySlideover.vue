<template>
  <div class="flex pb-2 h-full justify-between items-center">
    <!-- Assembly Table Toggle Buttons -->
    <button
      v-if="!assemblyTableShow"
      @click="toggleAssemblyTable"
      class="absolute top-1/2 pt-10 left-0 transform -translate-y-1/2 z-50 -rotate-90 origin-left   
             active:rotate-90 active:origin-right transition-all duration-200 hover:animate-pulse"
    >
      <BaseChevron :inner-color="navStore.activeColor"/>
    </button>
    <button
      v-if="assemblyTableShow"
      @click="toggleAssemblyTable"
      class="absolute right-0 pt-10 transform -translate-y-1/2 z-50 rotate-90 origin-right
             active:-rotate-90 active:origin-left transition-all duration-200 hover:animate-pulse"
    >
      <BaseChevron :inner-color="navStore.activeColor"/>
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
          <ActionButton
            key="newAssembly"
            text="New Assembly"
            @onClick="newAssembly"
            class="w-full"
          />
          <SearchBar
            :data="assemblies"
            :filterParam="assemblyFilters"
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
          <label for="assemblyName" class="block styled-text">Assembly Name</label>
          <InputText
            id="assemblyName"
            v-model="assemblyName"
            placeholder="Enter assembly name"
          />
        </div>
        <div>
          <label for="assemblyDescription" class="block styled-text">Assembly Description</label>
          <InputText
            id="assemblyDescription"
            v-model="assemblyDescription"
            placeholder="Enter assembly description"
          />
        </div>
        <div>
          <label for="assemblyCode" class="block styled-text">Assembly Code</label>
          <Dropdown
            :items="codes"
            @selectedItem="handleSelectedItem"
            name="codes"
          />
        </div>
        <div>
          <label for="category" class="block styled-text">Category</label>
          <DropdownMulti
            filterName="materialTypes"
            displayName="Material Types"
            :options="categories.materialTypes"
            @update:options="updateFilterOptions('materialTypes', $event)"
          />
        </div>
        <div class="flex flex-col justify-end ml-2">
          <ActionButton
            text="Save Assembly"
            :icon="BookmarkIcon"
            @onClick="saveAssembly"
          />
        </div>

      </div>
      <AssemblyViewer
        :materials="assemblyMaterials"
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
            :data="combinedMaterials"
            :filterParam="filterParameters"
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  BookmarkIcon
} from '@heroicons/vue/24/solid'

// Store imports
import { useNavigationStore } from '@/stores/navigationStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useFirebaseStore } from '@/stores/firebaseStore'
import { useProjectStore } from '@/stores/projectStore'
import { useSettingsStore } from '@/stores/settingStore'

// Component imports
import MaterialTable from '@/components/Mapping/MaterialTable.vue'
import AssemblyTable from '@/components/Mapping/AssemblyTable.vue'
import AssemblyViewer from '@/components/Mapping/AssemblyViewer.vue'
import DropdownMulti from '@/components/Base/DropdownMulti.vue'
import Dropdown from '@/components/Base/Dropdown.vue'
import SearchBar from '@/components/Mapping/SearchBar.vue'
import InputText from '@/components/Base/InputText.vue'
import ActionButton from '@/components/Base/ActionButton.vue'

// Utils and types
import { BSAB96 } from '@/models/buildingCodeModel'
import { ResultCalculator } from '@/utils/resultUtils'
import { EmissionCalculator } from '@/utils/emissionUtils'
import { createGeometryFromProduct } from '@/utils/materialUtils'
import type { dropdownItem } from '@/components/Base/Dropdown.vue'
import type { DropdownOption } from '@/models/pageModel'
import type { Assembly, Product } from '@/models/materialModel'
import type { GeometryObject } from '@/models/geometryModel'
import BaseChevron from '@/components/Base/BaseChevron.vue'

// Store initialization
const navStore = useNavigationStore()
const materialStore = useMaterialStore()
const firebaseStore = useFirebaseStore()
const projectStore = useProjectStore()
const settingsStore = useSettingsStore()

// Store refs
const { assemblyTableShow } = storeToRefs(navStore)
const { currentAssemby, materials, assemblies } = storeToRefs(materialStore)

// Computed
const combinedMaterials = computed(() => [
  ...materials.value,
  ...assemblies.value,
])

// Reactive state
const assemblyName = ref('')
const assemblyDescription = ref('')
const category = ref('')
const materialType = ref('')
const assemblyId = ref(crypto.randomUUID().toString())
const filteredProducts = ref<Product[]>([])
const filteredAssemblies = ref<Assembly[]>([])
const assemblyMaterials = ref<Product[]>([])

// Constants
const codes = BSAB96
const filterParameters = settingsStore.materialSettings.filterParams
const sortingParameters = settingsStore.materialSettings.sortingParams
const assemblyFilters = [{
  paramName: 'metaData.materialType',
  displayName: 'Material Type',
  selected: true
}]

const categories = ref({
  materialTypes: [
    { label: 'Wood', value: 'wood', selected: false },
    { label: 'Steel', value: 'steel', selected: false },
    { label: 'Concrete', value: 'concrete', selected: false },
    { label: 'Glass', value: 'glass', selected: false },
    { label: 'Plastic', value: 'plastic', selected: false },
  ],
})

// Methods
const handleFilteredData = (newData: Product[]) => {
  filteredProducts.value = newData
}

const handleFilteredAssemblyData = (newData: Assembly[]) => {
  filteredAssemblies.value = newData
}

const updateFilterOptions = (filterName: string, updatedOptions: DropdownOption[]) => {
  categories.value[filterName] = updatedOptions
}

const toggleAssemblyTable = () => {
  navStore.toggleAssemblyTable()
}

const handleSelectedItem = (selectedItem: dropdownItem) => {
  category.value = selectedItem.name
}

const updateMaterials = (newMaterials: Product[]) => {
  assemblyMaterials.value = newMaterials
}

const newAssembly = () => {
  assemblyId.value = crypto.randomUUID()
  assemblyName.value = ''
  assemblyDescription.value = ''
  category.value = ''
  materialType.value = ''
  assemblyMaterials.value = []
  navStore.toggleAssemblyTable()
}

const saveAssembly = () => {
  const products: Record<string, Product> = assemblyMaterials.value.reduce((acc, product) => {
    acc[product.metaData.appId] = product
    return acc
  }, {})

  const tempGeos: GeometryObject[] = assemblyMaterials.value.map(product =>
    createGeometryFromProduct(product)
  )

  const calculator = new EmissionCalculator(tempGeos)
  calculator.calculateEmissions()

  const resCalc = new ResultCalculator(tempGeos)
  resCalc.aggregate(false)

  materialType.value = categories.value.materialTypes.find(type => type.selected)?.value || ''

  const assembly: Assembly = {
    id: assemblyId.value,
    name: assemblyName.value,
    description: assemblyDescription.value,
    products: products,
    emission: resCalc.totalEmission,
    comment: '',
    quantity: 1,
    unit: 'm2',
    category: category.value,
    classification: null,
    results: [],
    metaData: { materialType: materialType.value },
  }

  materialStore.addAssembly(assembly)
  firebaseStore.addAssemblyList(
    projectStore.currProject ? projectStore.currProject.id : "test", 
    materialStore.assemblies
  )

  navStore.toggleAssemblyTable()
}

const handleLoadAssembly = (assembly: Assembly) => {
  assemblyId.value = assembly.id
  assemblyName.value = assembly.name
  assemblyDescription.value = assembly.description
  category.value = assembly.category
  materialType.value = assembly.metaData.materialType
  assemblyMaterials.value = Object.values(assembly.products)
  navStore.toggleAssemblyTable()
}

// Watchers
watch(currentAssemby, (newVal: Assembly | null) => {
  if (newVal) {
    handleLoadAssembly(newVal)
  }
})
</script>