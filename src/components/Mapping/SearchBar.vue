<template>
  <div class="p-2">
    <InputText
      id="searchBar"
      v-model="searchQuery"
      placeholder="Search..."
    />
  </div>
  
  <div>
    <section aria-labelledby="filter-heading">
      <div class="flex items-top justify-between mb-4">
        <Dropdown
          :items="sortItems"
          dropdownName="Sort"
          @selectedItem="handleSortSelection"
        />
        <PopoverGroup class="flex space-x-4">
          <DropdownMulti
            v-for="param in filterParam"
            :key="param.paramName"
            :filterName="param.paramName"
            :displayName="param.displayName"
            :options="getOptionsForParameter(param.paramName)"
            @update:options="(options) => updateFilterOptions(param.paramName, options)"
          />
        </PopoverGroup>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Imports
import { computed, watch } from 'vue'
import { PopoverGroup } from '@headlessui/vue'
import { useMaterialStore } from '@/stores/materialStore'
import { getSpecificEPD } from '@/utils/EPDUtils'

// Base components
import InputText from '@/components/Base/InputText.vue'
import DropdownMulti from '@/components/Base/DropdownMulti.vue'
import Dropdown from '@/components/Base/Dropdown.vue'

// Types
import type { dropdownItem } from '@/components/Base/Dropdown.vue'
import type { Assembly, Product } from '@/models/materialModel'
import type { DropdownOption } from '@/models/pageModel'

// Composables
import { useSearch } from '@/composables/useSearch'
import { useSort } from '@/composables/useSort'

// Props & Emits
interface Props {
  data: (Product | Assembly)[]
  filterParam: Array<{ paramName: string; displayName: string }>
  sortingParam: Array<{ filterName: string; displayName: string }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:data': [(Product | Assembly)[]]
}>()

// Use composables
const { 
  searchQuery, 
  selectedFilters, 
  filteredData, 
  manualMode, 
  resetSearchMode,
  getOptionsForParameter
} = useSearch(props.data)

const { 
  sorting, 
  sortItems, 
  sortData 
} = useSort(props.sortingParam)

// Computed Properties
const sortedData = computed(() => sortData(filteredData.value))

// Methods
const handleSortSelection = (item: dropdownItem) => {
  if (item.data) {
    sorting.value.direction = 
      sorting.value.parameter === item.data
        ? sorting.value.direction === 'asc' ? 'desc' : 'asc'
        : 'asc'
    sorting.value.parameter = item.data
  }
}

const updateFilterOptions = (filterName: string, options: DropdownOption[]) => {
  selectedFilters.value[filterName] = options
    .filter((option) => option.selected)
    .map((option) => option.value)
}

// Initialize filters
props.filterParam.forEach((param) => {
  selectedFilters.value[param.paramName] = []
})

// Watchers
watch(() => sortedData.value, (newData) => {
  if (!manualMode.value) emit('update:data', newData)
}, { immediate: true })

watch(searchQuery, async (newVal) => {
  const materialStore = useMaterialStore()
  const isUUID = (str: string) => 
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)

  if (!newVal || newVal.length === 0) {
    resetSearchMode()
    return
  }

  if (isUUID(newVal)) {
    try {
      manualMode.value = true
      const newMaterial: Product = await getSpecificEPD({ id: newVal })
      newMaterial.metaData.materialType = 'ManualEntry'
      materialStore.addMaterial(newMaterial)
      emit('update:data', [newMaterial])
    } catch (error) {
      console.error('Error fetching product by UUID:', error)
      resetSearchMode()
    }
  }
}, { immediate: true })
</script>