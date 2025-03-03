<template>
  <div class="p-2">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search..."
      class="w-full border p-1 rounded-md"
    />
  </div>
  
  <div>
    <section aria-labelledby="filter-heading">
      <div class="flex items-top justify-between mb-4">
        <!-- Sort Menu -->
        <Menu as="div" class="relative inline-block text-left">
          <div>
            <MenuButton 
              class="group inline-flex justify-center text-xs styled-element hoverable-xs p-1  mr-4"
              :style="{ backgroundColor: navStore.activeColor }"
            >
              Sort
              <ChevronDownIcon 
                class="-mr-1 ml-1 h-3 w-3 flex-shrink-0" 
                aria-hidden="true" 
              />
            </MenuButton>
          </div>

          <Transition 
            enter-active-class="transition ease-out duration-100" 
            enter-from-class="transform opacity-0 scale-95" 
            enter-to-class="transform opacity-100 scale-100" 
            leave-active-class="transition ease-in duration-75" 
            leave-from-class="transform opacity-100 scale-100" 
            leave-to-class="transform opacity-0 scale-95"
          >
            <MenuItems 
              class="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div class="py-1">
                <MenuItem 
                  v-for="sortingParam in props.sortingParam" 
                  :key="sortingParam.displayName" 
                  v-slot="{ active }"
                >
                  <div 
                    class="group flex justify-between w-full px-4 py-2 text-sm font-medium text-gray-900 cursor-pointer"
                    :class="[active ? 'bg-gray-100' : '', sortingParam.filterName === sorting.parameter ? 'underline' : '']"
                    @click="setSortOption(sortingParam.filterName)"
                  >
                    {{ sortingParam.displayName }}
                    <a v-if="sortingParam.filterName === sorting.parameter">
                      <ChevronUpIcon
                        v-if="sorting.direction === 'asc' && !active"
                        class="-ml-1 mr-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-900"
                        aria-hidden="true"
                      />
                      <ChevronDownIcon
                        v-else-if="sorting.direction === 'desc' && !active"
                        class="-ml-1 mr-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-900"
                        aria-hidden="true"
                      />
                      <ChevronDownIcon
                        v-else-if="sorting.direction === 'asc'"
                        class="-ml-1 mr-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-900"
                        aria-hidden="true"
                      />
                      <ChevronDownIcon
                        v-else
                        class="-ml-1 mr-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-900 transform rotate-180"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>

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
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  PopoverGroup,
} from '@headlessui/vue'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/20/solid'
import DropdownMulti from '@/components/Misc/DropdownMulti.vue'

import type { Assembly, Product } from '@/models/material'
import type { DropdownOption } from '@/models/pageLogic'
import type { Option } from '@/components/Misc/DropdownMulti.vue'
import { APISource } from '@/models/material'
import { useNavigationStore } from '@/stores/navigation'

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

const navStore = useNavigationStore()

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