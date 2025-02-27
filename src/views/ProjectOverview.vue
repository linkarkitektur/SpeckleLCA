<template>
  <Navbar />
  <div class="grid grid-cols-5 grid-rows-4 gap-4 min-h-[calc(100vh-5rem)] overflow-hidden p-4">
    <div class="col-span-4 row-span-1 bg-gray-100 p-4 flex items-center justify-center">
      <div class="absolute flex self-center top-24 z-100 text-2xl font-bold">
        <h1>ProjectName</h1>
      </div>
      <div class="flex w-full mt-10">
        <StackedBarChart 
          :data="barData" 
          :options="barOptions"/>
      </div>
    </div>

    <div class="col-span-2 row-span-2 bg-gray-100 p-4 flex items-center">
      <DivergingStackedBar :data="dummyData" />
    </div>

    <div class="col-span-2 row-span-2 bg-gray-100 p-4 flex items-center">
      <SelectablePieChart :data="dummyFlatData" />
    </div>

    <div class="col-span-4 row-span-1 bg-gray-100 p-4 flex items-center">
      <!-- Optional extra content or leave empty -->
      <p>Additional Content</p>
    </div>

    <div class="col-span-1 col-start-5 row-start-1 row-end-5 bg-gray-100 p-4 flex flex-col">
      <h2 class="text-xl font-bold mb-2">Project Settings</h2>
      <Dropdown
        :items="versionNames"
        name="Model"
        dropdownName="Select a Model"
        class="py-3"
      />

      <Dropdown
        :items="versionNames"
        name="Version"
        dropdownName="Select a version"
        class="py-3"
      />

      <button
        type="button"
        class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-3 my-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"      >
        Load this version
      </button>

      <p>Settings content here...</p>

      <div class="flex items-center my-3">
        <dt class="font-medium text-gray-900">Area</dt>
        <dd class="ml-4 flex-1">
          <input
            type="text"
            placeholder="Unit"
            class="w-full border p-2 rounded-md"
          />
        </dd>
      </div>

      <div class="flex items-center my-3">
        <dt class="font-medium text-gray-900">Include Collections</dt>
        <dd class="ml-4">
          <input
            type="checkbox" 
            class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
        </dd>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { dummyData, dummyFlatData } from '@/models/chartModels'
import type { ChartData, ChartOptions } from '@/models/chartModels'

import Dropdown from '@/components/Misc/Dropdown.vue'
import Navbar from '@/components/Navbar.vue'
import GaugeChart from '@/components/Graphs/GaugeChart.vue'
import StackedBarChart from '@/components/Graphs/StackedBarChart.vue'
import DivergingStackedBar from '@/components/Graphs/DivergingStackedBar.vue'
import SelectablePieChart from '@/components/Graphs/SelectablePieChart.vue'

import type { dropdownItem } from '@/components/Misc/Dropdown.vue'

export default defineComponent({
  name: 'ProjectOverview',
  components: {
    Navbar,
    StackedBarChart,
    DivergingStackedBar,
    SelectablePieChart,
    Dropdown
  },
  setup() {
    const versionNames: dropdownItem[] = [
      { name: 'Version 1'},
      { name: 'Version 2'},
      { name: 'Version 3'},
    ]

    const threshold = 100
    const currentValue = 90
    const remaining = computed(() => {
      return threshold-currentValue
    })

    const barData: ChartData[] = [
      {
        label: "Spent",
        value: currentValue,
      },
      {
        label: "Threshold",
        value: remaining.value
      }
    ]
    
    let barColor = "#A4B07E"
    if (currentValue > threshold)
      barColor = "#C7A685"

    const barOptions: ChartOptions = {
      unit: "kgCo2/m2",
      colors: [currentValue > threshold ? "#D5CD86" : barColor, currentValue > threshold ? barColor : "#D5CD86"]
    }

    return {
      versionNames,
      barData,
      barOptions,
      dummyData,
      dummyFlatData
    }
  }
})
</script>