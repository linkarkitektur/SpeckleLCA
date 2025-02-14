<template>
  <div class="p-4">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search..."
      class="w-full border p-2 rounded-md"
    />
  </div>
  
  <div>
    <section aria-labelledby="filter-heading" class="border-t border-gray-200 py-6">
      <div class="flex items-center justify-between">
        <!-- Sort Menu -->
        <Menu as="div" class="relative inline-block text-left">
          <div>
            <MenuButton 
              class="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sort
              <ChevronDownIcon 
                class="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" 
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
                  v-for="sortingParam in sortingParameters" 
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
                        class="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-900"
                        aria-hidden="true"
                      />
                      <ChevronDownIcon
                        v-else-if="sorting.direction === 'desc' && !active"
                        class="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-900"
                        aria-hidden="true"
                      />
                      <ChevronDownIcon
                        v-else-if="sorting.direction === 'asc'"
                        class="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-900"
                        aria-hidden="true"
                      />
                      <ChevronDownIcon
                        v-else
                        class="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-900 transform rotate-180"
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
        <PopoverGroup class="hidden sm:flex sm:items-baseline sm:space-x-8">
          <DropdownMulti
            v-for="(param) in filterParameters"
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
<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useMaterialStore } from '@/stores/material'
import { getSpecificEPD } from '@/utils/EPDUtils'
import { getNestedPropertyValue } from '@/utils/material'

import { APISource } from '@/models/material'
import { getEnumEntries } from '@/utils/dataUtils'
import { isAssembly } from '@/utils/EPDUtils'

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

export default defineComponent({
  name: 'SearchBar',
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    PopoverGroup,
    DropdownMulti,
    ChevronDownIcon,
    ChevronUpIcon,
  },
  props: {
    data:
 {
      //This is set as Product Assembly, can be both
      type: Array as () => (Product | Assembly)[],
      required: true,
    },
    filterParam: {
      type: Array as () => Array<{ paramName: string; displayName: string }>,
      required: true,
    },
    sortingParam: {
      type: Array as () => Array<{ filterName: string; displayName: string }>,
      required: true,
    },
  },
  emits: ['update:data'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const selectedFilters = ref<Record<string, any[]>>({})
    const sorting = ref<{ parameter: string; direction: 'asc' | 'desc' }>({
      parameter: '',
      direction: 'asc',
    })

    let manualMode = false

    props.filterParam.forEach((param) => {
      selectedFilters.value[param.paramName] = []
    })

    const getOptionsForParameter = (paramName: string): Option[] => {
      const optionsSet = new Set()

      // Manual check for source enum so we set name instead
      if (paramName === 'source') {
        return getEnumEntries(APISource).map((entry) => ({
          label: entry.label,
          value: entry.value,
          selected: selectedFilters.value[paramName]?.includes(entry.value),
        }))
      }

      // Check for Assembly filtering then we make custom entries
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
    
    const filteredData = computed(() => {
      return props.data.filter((item) => {
        // Search logic
        const matchesSearch = item.name
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())

        // General parameter matching excluding the assembly filter
        const matchesFilters = Object.entries(selectedFilters.value).every(
          ([key, selectedOptions]) => {
            if (key === 'isAssembly') return true // handle separately
            if (selectedOptions.length === 0) return true

            const value = getNestedPropertyValue(item, key)
            return selectedOptions.includes(value)
          }
        )
        
        // Custom Assembly filtering
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

    // Set sorting in material store
    const setSortOption = (parameterName: string) => {
      if (sorting.value.parameter === parameterName) {
        sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
      } else {
        sorting.value.parameter = parameterName
        sorting.value.direction = 'asc'
      }
    }

    // Update filter options when DropdownMulti emits 'update:options'
    const updateFilterOptions = (filterName: string, options: DropdownOption[]) => {
      selectedFilters.value[filterName] = options
        .filter((option) => option.selected)
        .map((option) => option.value)
    }
    
    watch(
      () => sortedData.value,
      (newData) => {
        if (!manualMode) emit('update:data', newData)
      },
      { immediate: true }
    )

    // Watch the search query and filter the materials
    watch(searchQuery, async (newVal) => {
      const materialStore = useMaterialStore()
      const isUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)

      // If the input is a UUID, fetch the specific product
      if (isUUID(newVal)) {
        try {
          manualMode = true
          const newMaterial: Product = await getSpecificEPD({ id: newVal })
          newMaterial.metaData.materialType = 'ManualEntry'
          materialStore.addMaterial(newMaterial)
          // If we add a material from ID then we just put that in the list
          emit('update:data', [newMaterial])
        } catch (error) {
          console.error('Error fetching product by UUID:', error)
        }
        return
      } else {
        // If the input is not a UUID, reset the manual mode and get whole list of Materials
        manualMode = false
      }
    })

    return {
      searchQuery,
      sortingParameters: props.sortingParam,
      filterParameters: props.filterParam,
      sorting,
      getOptionsForParameter,
      setSortOption,
      updateFilterOptions,
    }
  },
})
</script>