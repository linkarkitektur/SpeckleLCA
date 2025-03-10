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
        <!-- Sort Menu -->
        <Dropdown
          :items="sortItems"
          dropdownName="Sort"
          @selectedItem="handleSortSelection"
        />

        <!-- Filter Dropdowns -->
        <PopoverGroup class="flex space-x-4">
          <DropdownMulti
            v-for="(param) in props.filterParam"
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
import { ref, computed, watch } from 'vue'
import { useMaterialStore } from '@/stores/material'
import { getSpecificEPD, isAssembly } from '@/utils/EPDUtils'
import { getNestedPropertyValue } from '@/utils/material'
import { getEnumEntries } from '@/utils/dataUtils'

import {
  PopoverGroup,
} from '@headlessui/vue'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/20/solid'
import DropdownMulti from '@/components/Base/DropdownMulti.vue'
import Dropdown from '@/components/Base/Dropdown.vue'

import type { dropdownItem } from '@/components/Base/Dropdown.vue'
import type { Assembly, Product } from '@/models/material'
import type { DropdownOption } from '@/models/pageLogic'
import type { Option } from '@/components/Base/DropdownMulti.vue'
import { APISource } from '@/models/material'
import { useNavigationStore } from '@/stores/navigation'
import InputText from '@/components/Base/InputText.vue'

// Props
interface Props {
  data: (Product | Assembly)[]
  filterParam: Array<{ paramName: string; displayName: string }>
  sortingParam: Array<{ filterName: string; displayName: string }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:data': [(Product | Assembly)[]]
}>()

// Reactive state
const searchQuery = ref('')
const selectedFilters = ref<Record<string, any[]>>({})
const sorting = ref<{ parameter: string; direction: 'asc' | 'desc' }>({
  parameter: '',
  direction: 'asc',
})

let manualMode = false

// Initialize filters
props.filterParam.forEach((param) => {
  selectedFilters.value[param.paramName] = []
})

// Methods
const getOptionsForParameter = (paramName: string): Option[] => {
  const optionsSet = new Set()

  if (paramName === 'source') {
    return getEnumEntries(APISource).map((entry) => ({
      label: entry.label,
      value: entry.value,
      selected: selectedFilters.value[paramName]?.includes(entry.value),
    }))
  }

  if (paramName === 'isAssembly') {
    return [
      {
        label: 'Assembly',
        value: 'assembly',
        selected: selectedFilters.value[paramName]?.includes('assembly'),
      },
      {
        label: 'Product',
        value: 'product',
        selected: selectedFilters.value[paramName]?.includes('product'),
      },
    ]
  }

  props.data.forEach((item) => {
    const value = getNestedPropertyValue(item, paramName)
    if (value !== undefined) {
      optionsSet.add(value)
    }
  })
  
  return Array.from(optionsSet).map((option) => ({
    label: option as string,
    value: option as string,
    selected: selectedFilters.value[paramName]?.includes(option),
  }))
}

// Computed
const sortItems = computed(() => 
  props.sortingParam.map(param => ({
    name: param.displayName,
    data: param.filterName,
    icon: sorting.value.parameter === param.filterName 
      ? sorting.value.direction === 'asc' 
        ? ChevronUpIcon 
        : ChevronDownIcon
      : undefined
  }))
)

const filteredData = computed(() => {
  return props.data.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())

    const matchesFilters = Object.entries(selectedFilters.value).every(
      ([key, selectedOptions]) => {
        if (key === 'isAssembly') return true
        if (selectedOptions.length === 0) return true

        const value = getNestedPropertyValue(item, key)
        return selectedOptions.includes(value)
      }
    )
    
    const assemblyFilter = selectedFilters.value['isAssembly'] || []
    const itemType = isAssembly(item) ? 'assembly' : 'product'
    const isAssemblyMatch =
      assemblyFilter.length === 0 || assemblyFilter.includes(itemType)
    
    return matchesSearch && matchesFilters && isAssemblyMatch
  })
})

const sortedData = computed(() => {
  const dataToSort = [...filteredData.value]
  if (sorting.value.parameter) {
    dataToSort.sort((a, b) => {
      const dir = sorting.value.direction === 'asc' ? 1 : -1
      if (a[sorting.value.parameter] < b[sorting.value.parameter]) return -1 * dir
      if (a[sorting.value.parameter] > b[sorting.value.parameter]) return 1 * dir
      return 0
    })
  }
  return dataToSort
})

// Methods
const handleSortSelection = (item: dropdownItem) => {
  if (item.data) {
    setSortOption(item.data)
  }
}

const setSortOption = (parameterName: string) => {
  if (sorting.value.parameter === parameterName) {
    sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sorting.value.parameter = parameterName
    sorting.value.direction = 'asc'
  }
}

const updateFilterOptions = (filterName: string, options: DropdownOption[]) => {
  selectedFilters.value[filterName] = options
    .filter((option) => option.selected)
    .map((option) => option.value)
}

// Watchers
watch(
  () => sortedData.value,
  (newData) => {
    if (!manualMode) emit('update:data', newData)
  },
  { immediate: true }
)

watch(searchQuery, async (newVal) => {
  const materialStore = useMaterialStore()
  const isUUID = (str: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)

  if (isUUID(newVal)) {
    try {
      manualMode = true
      const newMaterial: Product = await getSpecificEPD({ id: newVal })
      newMaterial.metaData.materialType = 'ManualEntry'
      materialStore.addMaterial(newMaterial)
      emit('update:data', [newMaterial])
    } catch (error) {
      console.error('Error fetching product by UUID:', error)
    }
    return
  } else {
    manualMode = false
  }
})
</script>