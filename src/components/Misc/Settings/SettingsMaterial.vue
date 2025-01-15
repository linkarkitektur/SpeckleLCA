<template>
  <div>
     <h2 class="text-base/7 font-semibold text-gray-900">Material Settings</h2>
     <p class="mt-1 text-sm/6 text-gray-500">Material and assembly settings, sources and filterings.</p>

     <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
      <div class="pt-6 sm:flex">
        <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Data source</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <Dropdown
            :items="materialSources"
            name="codes"
            :dropdownName="Source[selectedSource]"
            @selectedItem="handleSelectedItem"
          />
          <UpdateButton @click="updateMaterial" />
        </dd>
      </div>
      <div class="pt-6 sm:flex">
        <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Include Collections</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <input
            type="checkbox" 
            class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"  
            v-model="settingsStore.materialSettings.includeCollections" 
          />
          <UpdateButton @click="updateMaterial" />
        </dd>
      </div>
      <div class="pt-6 sm:flex">
        <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Filter parameters</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <DropdownMulti
            filterName="Filter parameters"
            displayName="Filter parameters"
            :options="filterOptions"
            @update:options="(options) => updateFilterOptions(options)"
          />
          <UpdateButton @click="updateMaterial" />
        </dd>
      </div>
      <div class="pt-6 sm:flex">
        <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Sorting parameters</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <DropdownMulti
            filterName="Sorting parameters"
            displayName="Sorting parameters"
            :options="sortingOptions"
            @update:options="(options) => updateSortingOptions(options)"
          />
          <UpdateButton @click="updateMaterial" />
        </dd>
      </div>
    </dl>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

import { useSettingsStore } from '@/stores/settings'

import type { dropdownItem } from '@/components/Misc/Dropdown.vue'
import type { DropdownOption } from '@/models/pageLogic'

import { Source } from '@/models/material'
import Dropdown from '../Dropdown.vue'
import UpdateButton from './UpdateButton.vue'
import DropdownMulti from '../DropdownMulti.vue'


export default defineComponent({
  name: 'SettingsMaterial',
  components: {
    Dropdown,
    DropdownMulti,
    UpdateButton
  },
  setup() {
    const settingsStore = useSettingsStore()
    
    const { filterParams, sortingParams } = settingsStore.materialSettings

    // Add sources for dropdown 
    const materialSources: dropdownItem[] = []
    for (const source in Source) {
      if (isNaN(Number(source))) 
        materialSources.push({ name: source })
    }
    
    const selectedSource = ref(settingsStore.materialSettings.Source)
    const selectedFilters = ref(settingsStore.materialSettings.filterParams)
    const selectedSortings = ref(settingsStore.materialSettings.sortingParams)

    const filterOptions = filterParams.map((param) => {
      return {
        value: param.paramName,
        label: param.displayName,
        selected: param.selected
      }
    })

    const sortingOptions = sortingParams.map((param) => {
      return {
        value: param.filterName,
        label: param.displayName,
        selected: param.selected
      }
    })

    const handleSelectedItem = (selectedItem: dropdownItem) => {
      selectedSource.value = Source[selectedItem.name as keyof typeof Source]
    }

    // Update filter options when DropdownMulti emits 'update:options'
    const updateFilterOptions = (options: DropdownOption[]) => {
      selectedFilters.value.map((filter) => {
        return options.map((option) => { 
          if (option.value === filter.paramName)
            filter.selected = option.selected
        })
      })
    }

    const updateSortingOptions = (options: DropdownOption[]) => {
      selectedSortings.value.map((filter) => {
        return options.map((option) => { 
          if (option.value === filter.filterName)
            filter.selected = option.selected
        })
      })
    }

    const updateMaterial = () => {
      settingsStore.updateEPDSource(selectedSource.value)
    }

  return { 
    materialSources,
    selectedSource,
    Source,
    settingsStore,
    filterParams,
    filterOptions,
    sortingOptions,
    sortingParams,
    handleSelectedItem,
    updateMaterial,
    updateFilterOptions,
    updateSortingOptions
    }
  },
})
</script>