<template>
  <div>
     <h2 class="text-base/7 font-semibold text-gray-900">Material Settings</h2>
     <p class="mt-1 text-sm/6 text-gray-500">Material and assembly settings, sources and filterings.</p>

     <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
      <div class="pt-6 sm:flex">
        <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Data source</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <DropdownMulti
            filterName="Data Sources"
            displayName="Data Sources"
            :options="sourceOptions"
            @update:options="(options) => updateSourceOptions(options)"
          />
        </dd>
      </div>
      <div class="pt-6 sm:flex">
        <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Include Collections</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <CheckBox
            id="includeCollections"
            name="includeCollections"
            :checked="settingsStore.materialSettings.includeCollections"
            @update:checked="(newVal) => settingsStore.materialSettings.includeCollections = newVal"
          />
        </dd>
      </div>
      <div class="pt-6 sm:flex">
        <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Fetch global assemblies</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <CheckBox
            id="globalAssemblies"
            name="globalAssemblies"
            :checked="settingsStore.materialSettings.globalAssemblies"
            @update:checked="(newVal) => settingsStore.materialSettings.globalAssemblies = newVal"
          />
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
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useSettingsStore } from '@/stores/settings'

import type { dropdownItem } from '@/components/Misc/Dropdown.vue'
import type { DropdownOption } from '@/models/pageLogic'

import { APISource } from '@/models/material'
import CheckBox from '@/components/Base/CheckBox.vue'
import Dropdown from '../Dropdown.vue'
import UpdateButton from './UpdateButton.vue'
import DropdownMulti from '../DropdownMulti.vue'

interface Option {
  label: string
  value: string
  selected: boolean
}

const settingsStore = useSettingsStore()

const { filterParams, sortingParams } = settingsStore.materialSettings

// Add sources for dropdown 
const materialSources: dropdownItem[] = []
for (const source in APISource) {
  if (isNaN(Number(source))) 
    materialSources.push({ name: source })
}

const selectedSources = ref(settingsStore.materialSettings.APISource)
const selectedFilters = ref(settingsStore.materialSettings.filterParams)
const selectedSortings = ref(settingsStore.materialSettings.sortingParams)

const sourceOptions = Object.entries(APISource)
  .filter(([key]) => isNaN(Number(key)))
  .map(([key, value]): Option => {
    return {
      value: key, // Use enum key as value
      label: key, // Use enum key as label
      selected: selectedSources.value[value] // Use enum value to check selection
    }
  })

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

const updateSourceOptions = (options: Option[]) => {
  const updatedSources = { ...selectedSources.value }
  options.forEach(option => {
    updatedSources[APISource[option.value as keyof typeof APISource]] = option.selected
  })
  selectedSources.value = updatedSources
  settingsStore.materialSettings.APISource = updatedSources
}
</script>