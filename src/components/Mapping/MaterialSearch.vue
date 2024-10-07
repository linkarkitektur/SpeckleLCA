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

          <transition 
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
                  <div class="group flex justify-between w-full"
                    :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm font-medium text-gray-900',
                    sortingParam.filterName === sorting.parameter ? 'underline' : '']"
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
          </transition>
        </Menu>
        <button 
          type="button" 
          class="inline-block text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden" 
          @click="open = true"
        >
          Filters
        </button>
        <PopoverGroup class="hidden sm:flex sm:items-baseline sm:space-x-8">
          <Popover 
            as="div" 
            v-for="(param, paramId) in filterParameters" 
            :key="param.filterName" 
            :id="`desktop-menu-${paramId}`" 
            class="relative inline-block text-left"
          >
            <div>
              <PopoverButton 
                class="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <span>{{ param.displayName }}</span>
                <span 
                  class="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gray-700"
                >
                  {{ paramFilters[param.paramName].filter((option) => option.selected).length == 0 ? 
                  'All' : paramFilters[param.paramName].filter((option) => option.selected).length }}
                </span>
                <ChevronDownIcon 
                  class="-mr-1 m</PopoverButton>l-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" 
                  aria-hidden="true" 
                />
              </PopoverButton>
            </div>

            <transition 
              enter-active-class="transition ease-out duration-100" 
              enter-from-class="transform opacity-0 scale-95" 
              enter-to-class="transform opacity-100 scale-100" 
              leave-active-class="transition ease-in duration-75" 
              leave-from-class="transform opacity-100 scale-100" 
              leave-to-class="transform opacity-0 scale-95"
            >
              <PopoverPanel 
                class="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <form class="space-y-4">
                  <div 
                    v-for="(option, optionIdx) in paramFilters[param.paramName]" 
                    :key="option" 
                    class="flex items-center"
                  >
                    <input
                      :id="`filter-${param.paramName}-${optionIdx}`"
                      :name="`${param.paramName}[]`"
                      :value="option.name"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      :checked="option.selected"
                      @change="toggleSelection(param.paramName, optionIdx)"
                    />
                    <label class="pl-2">
                      {{ option.name }}
                    </label>
                  </div>
                </form>
              </PopoverPanel>
            </transition>
          </Popover>
        </PopoverGroup>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useMaterialStore } from '@/stores/material'
import { getSpecificEPD } from '@/utils/EPDUtils'

import { storeToRefs } from 'pinia'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/vue'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/20/solid'

export default defineComponent({
  name: 'MaterialSearch',
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Popover,
    PopoverButton,
    PopoverGroup,
    PopoverPanel,
    ChevronDownIcon,
    ChevronUpIcon,
  },
  setup() {
    const materialStore = useMaterialStore()
    const { sortingParameters, sorting, paramFilters } = storeToRefs(materialStore)
    const matRef = storeToRefs(materialStore)
    const searchQuery = ref('')
    const open = ref(false)
    
    // Watch the search query and filter the materials
    watch(searchQuery, async (newVal) => {
      const isUUID = (str) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)

      // If the input is a UUID, fetch the specific product
      if (isUUID(newVal)) {
        try {
          const newMaterial: Product = await getSpecificEPD({ id: newVal })
          materialStore.addMaterial(newMaterial)
          materialStore.setFilteredMaterials([newMaterial])
        } catch (error) {
          console.error("Error fetching product by UUID:", error)
        }
        return
      }

      // Handle the search query filtering logic
      const materials = materialStore.materials || []
      if (materials.length > 0 || newVal.length > 0) {
        const filteredMaterials = materials.filter((material) =>
          material.name.toLowerCase().includes(newVal.toLowerCase())
        )
        materialStore.setFilteredMaterials(filteredMaterials)
      } else {
        materialStore.EPDList = materials
      }
    })

    
    const filterParameters = computed(() => {
      return sortingParameters.value.filter(param => param.paramName !== null)
    })
    
    //Set sorting in material store
    const setSortOption = (parameterName: string) => {
      let dir = "asc"
      // If same material is pressed toggle dir
      if (materialStore.sorting.parameter == parameterName) {
        dir = materialStore.sorting.direction === 'asc' ? 'desc' : 'asc'
      }
      materialStore.setSorting(parameterName, dir)
    }

    watch(() => materialStore.paramFilters,
      () => {
        materialStore.triggerParamSort()
      },
      { deep: true }
    )

    const toggleSelection = (sectionId, idx) => {
      materialStore.paramFilters[sectionId][idx].selected = !materialStore.paramFilters[sectionId][idx].selected
    }

    return {
      searchQuery,
      open,
      sortingParameters,
      filterParameters,
      sorting,
      paramFilters,
      matRef,
      toggleSelection,
      setSortOption,
    }
  },
})
</script>