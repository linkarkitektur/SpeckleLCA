<template>
  <!-- Dot pattern overlay -->
  <div 
    class="fixed inset-0 w-full h-full pattern-dots pattern-black pattern-bg-transparent pattern-size-4"
    style="--pattern-opacity: 0.1;"
  ></div>
  
  <!-- Main content -->
  <div 
    class="relative z-10"
    :class="{ 'opacity-0': !contentVisible, 'opacity-100 transition-opacity duration-50': contentVisible }"
  >

    <Navbar />
    <div class="grid grid-cols-5 grid-rows-4 gap-10 h-[calc(100vh-5rem)] overflow-hidden p-4">
      <div class="col-span-4 row-span-1 p-4 flex items-center justify-center bg-neutral-100 styled-element hoverable-styling">
        <div class="flex w-full pt-2 h-5/6">
          <StackedBarChart 
            :data="barData" 
            :options="barOptions"/>
        </div>
      </div>

      <div class="col-span-2 row-span-2 p-4 flex flex-col items-center bg-neutral-100 styled-element hoverable-styling">
        <h class="styled-header pb-2"> Emissions by element type</h>
        <GraphContainer
          graph="VerticalBarChart"
          :result-item="categoryResults"
          minW="calc(40vh)"
          maxW="calc(40vh)"
        />
      </div>

      <div class="col-span-2 row-span-2 p-4 flex flex-col items-center bg-neutral-100 styled-element hoverable-styling">
        <h class="styled-header pb-2"> Emissions by material category</h>
        <div class="flex items-center justify-center w-full h-full">
          <div class="aspect-square h-full">
            <GraphContainer
              graph="PieChart"
              :result-item="materialTypeResults"
            />
          </div>
        </div>
      </div>

      <div class="col-span-4 row-span-1 p-4 flex flex-col items-center bg-neutral-100 styled-element hoverable-styling">
        <h class="styled-header pb-2"> Emissions by material</h>
        <GraphContainer
          graph="VerticalBarChart"
          :result-item="hotSpotResults"
          maxH="calc(15vh)"
          minH="calc(15vh)"
          minW="calc(100vh)"
          maxW="calc(100vh)"
        />
      </div>

      <div class="col-span-1 col-start-5 row-start-1 row-end-5 p-6 flex flex-col bg-neutral-100 styled-element hoverable-styling">
        <SettingsProjectOverview />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { dummyData, dummyFlatData } from '@/config/chartDataConfig'
import type { ChartData, ChartOptions } from '@/models/chartModel'

// Component imports
import Navbar from '@/components/Base/Navbar.vue'
import StackedBarChart from '@/components/Graphs/StackedBarChart.vue'
import SettingsProjectOverview from '@/components/Settings/SettingsProjectOverview.vue'

import { loadProject } from '@/utils/speckleUtils'
import { useFirebaseStore } from '@/stores/firebaseStore'
import { useProjectStore } from '@/stores/projectStore'
import type { ResultsLog } from '@/models/firebaseModel'
import { useSettingsStore } from '@/stores/settingStore'
import { resultLogToAdjustedEmission } from '@/utils/resultUtils'

import GraphContainer from '@/components/Graphs/GraphContainer.vue'
import { roundNumber } from '@/utils/mathUtils'

// stores
const firebaseStore = useFirebaseStore()
const projectStore = useProjectStore()
const settingsStore = useSettingsStore()

// refs
const contentVisible = ref(false)
const backgroundVisible = ref(false)
const resultLog = ref<ResultsLog>()

const nameParameter = ref<string>('material.name')
const speckleParameter = ref<string>('parameters.speckle_type')
const materialTypeParameter = ref<string>('material.metaData.materialType')

// Computed 
const hotSpotResults = computed(() => resultLog.value?.resultList.find(res => res.parameter === nameParameter.value))
const categoryResults = computed(() => resultLog.value?.resultList.find(res => res.parameter === speckleParameter.value))
const materialTypeResults = computed(() => resultLog.value?.resultList.find(res => res.parameter === materialTypeParameter.value))

const remaining = computed(() => roundNumber(settingsStore.projectSettings.threshold - emissionSqmName.value, 2))

// If we do it per year then we divide with lifespan
const emissionSqmName = computed(() => {
  if (resultLog.value) {
    return resultLogToAdjustedEmission(resultLog.value, nameParameter.value)
  } else {
    return 0 
  }
})

// Chart data
const barData = computed<ChartData[]>(() => [
  {
    label: " Spent",
    value: emissionSqmName.value,
  },
  {
    label: "Remaining",
    value: remaining.value
  }
])

const barOptions = computed<ChartOptions>(() => {
  if (settingsStore.projectSettings.emissionPerYear)
    return { unit: "kg CO2/m2/year" }
  return { unit: "kg CO2/m2" }
})

// Start background flash and fetch results
onMounted(async () => {
  // Start with black overlay
  setTimeout(() => {
    // Fade out black overlay to reveal colored background
    backgroundVisible.value = true
    // Show content
    setTimeout(() => {
      contentVisible.value = true
    }, 150)
  }, 150)

  const results = await firebaseStore.fetchResults(projectStore.currProject.id)
  resultLog.value = results[0]
  
  // Lazyload the latest version in the background
  loadProject(false)
})
</script>