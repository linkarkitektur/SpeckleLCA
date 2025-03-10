<template>
  <!-- Base colored background -->
  <div 
    class="fixed inset-0 w-full h-full bg-opacity-20"
  ></div>

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
        <div class="absolute flex self-center top-24 z-100 text-2xl font-bold">
          <h1>ProjectName</h1>
        </div>
        <div class="flex w-full mt-10">
          <StackedBarChart 
            :data="barData" 
            :options="barOptions"/>
        </div>
      </div>

      <div class="col-span-2 row-span-2 p-4 flex items-center bg-neutral-100 styled-element hoverable-styling">
        <DivergingStackedBar :data="dummyData" />
      </div>

      <div class="col-span-2 row-span-2 p-4 flex items-center bg-neutral-100 styled-element hoverable-styling">
        <div class="flex items-center justify-center w-full h-full">
          <div class="aspect-square h-full">
            <SelectablePieChart :data="dummyFlatData" />
          </div>
        </div>
      </div>

      <div class="col-span-4 row-span-1 p-4 flex items-center bg-neutral-100 styled-element hoverable-styling">
        <!-- Optional extra content or leave empty -->
        <p>Additional Content</p>
      </div>

      <div class="col-span-1 col-start-5 row-start-1 row-end-5 p-6 flex flex-col bg-neutral-100 styled-element hoverable-styling">
        <h2 class="text-xl font-bold mb-2">Project Settings</h2>
        <Dropdown
          :items="versionNames"
          @selectedItem="handleSelectedItem"
          name="Model"
          dropdownName="Select version"
          class="py-3"
        />

        <ActionButton
          text="Load this version"
          @onClick="selectProject"
          class="mb-6"
        />
        
        <p>Settings content here...</p>

        <div class="flex items-center my-3">
          <dt class="font-medium text-gray-900">Area</dt>
          <dd class="ml-4 flex-1">
            <InputText
              id="Area"
              v-model="settingsStore.appSettings.area"
              placeholder="Unit"
            />
          </dd>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { dummyData, dummyFlatData } from '@/models/chartModels'
import type { ChartData, ChartOptions } from '@/models/chartModels'

// Component imports
import Dropdown from '@/components/Misc/Dropdown.vue'
import ActionButton from '@/components/Base/ActionButton.vue'
import Navbar from '@/components/Misc/Navbar.vue'
import StackedBarChart from '@/components/Graphs/StackedBarChart.vue'
import DivergingStackedBar from '@/components/Graphs/DivergingStackedBar.vue'
import SelectablePieChart from '@/components/Graphs/SelectablePieChart.vue'

import { useNavigationStore } from '@/stores/navigation'
import { useSpeckleStore } from '@/stores/speckle'
import { useSettingsStore } from '@/stores/settings'

import { loadProject } from '@/utils/speckleUtils'
import router from '@/router'

import type { dropdownItem } from '@/components/Misc/Dropdown.vue'
import InputText from '@/components/Base/InputText.vue'

const navStore = useNavigationStore()
const speckleStore = useSpeckleStore()
const settingsStore = useSettingsStore()

const contentVisible = ref(false)
const backgroundVisible = ref(false)
//This is to check if we actually changed version and should load it again or just use the one loaded
const changedVersion = ref(false)

// Start background flash
onMounted(() => {
  // Start with black overlay
  setTimeout(() => {
    // Fade out black overlay to reveal colored background
    backgroundVisible.value = true
    // Show content
    setTimeout(() => {
      contentVisible.value = true
    }, 150)
  }, 150)

  // Lazyload the latest version in the background
  loadProject(false)
})

/**
 *  Return the extracted names from all available versions of the project to be used in dropdown
 */
const versionNames = computed(() => {
  let versions: dropdownItem[] = []

  speckleStore.getAllVersions?.forEach((el) => {
    if (typeof el.message === 'string') {
      const item: dropdownItem = {
        name: el.message,
        data: el.id
      }

      versions.push(item)
    }
  })
  return versions
})

/**
 * Sets the selected version from dropdown selected
 * @param selectedItem
 */
const handleSelectedItem = (selectedItem: dropdownItem) => {
  const version = speckleStore.getAllVersions?.find(
    (obj) => obj.id === selectedItem.data
  )

  // Set that we changed to another version manually so we have to load it
  changedVersion.value = true
  if (version) speckleStore.setSelectedVersion(version)
}

/**
 * Loads project when button pressed either its lazyloaded already or we load it from scratch
 */
const selectProject = () => {
  // If version changed we load it otherwise just route it
  if (changedVersion.value) {
    loadProject(true)
  } else {
    navStore.setActivePage('Filtering') 
    router.push({ 
      name: 'Dashboard'
    })
  }


}

const threshold = 100
const currentValue = ref(90)
const remaining = computed(() => threshold - currentValue.value)

// Chart data
const barData = computed<ChartData[]>(() => [
  {
    label: "Spent",
    value: currentValue.value,
  },
  {
    label: "Threshold",
    value: remaining.value
  }
])

// Chart options
const barColor = computed(() => currentValue.value > threshold ? "#C7A685" : "#A4B07E")

const barOptions = computed<ChartOptions>(() => ({
  unit: "kgCo2/m2",
  colors: [
    currentValue.value > threshold ? "#D5CD86" : barColor.value, 
    currentValue.value > threshold ? barColor.value : "#D5CD86"
  ]
}))
</script>