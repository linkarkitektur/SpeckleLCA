<template>
  <!-- Base colored background -->
  <div 
    class="fixed inset-0 w-full h-full bg-opacity-20"
  ></div>

  <!-- Dot pattern overlay -->
  <div 
    class="fixed inset-0 w-full h-full pattern-dots pattern-black pattern-bg-transparent pattern-size-4"
    :style="{backgroundColor: navStore.activeColor}"
    style="--pattern-opacity: 0.5;"
  ></div>
  
  <!-- Main content -->
  <div 
    class="relative z-10"
    :class="{ 'opacity-0': !contentVisible, 'opacity-100 transition-opacity duration-50': contentVisible }"
  >

    <Navbar />
    <div class="grid grid-cols-5 grid-rows-4 gap-10 min-h-[calc(100vh-5rem)] overflow-hidden p-4">
      <div class="col-span-4 row-span-1 p-4 flex items-center justify-center bg-neutral-100 styled-element">
        <div class="absolute flex self-center top-24 z-100 text-2xl font-bold">
          <h1>ProjectName</h1>
        </div>
        <div class="flex w-full mt-10">
          <StackedBarChart 
            :data="barData" 
            :options="barOptions"/>
        </div>
      </div>

      <div class="col-span-2 row-span-2 p-4 flex items-center bg-neutral-100 styled-element">
        <DivergingStackedBar :data="dummyData" />
      </div>

      <div class="col-span-2 row-span-2 p-4 flex items-center bg-neutral-100 styled-element">
        <SelectablePieChart :data="dummyFlatData" />
      </div>

      <div class="col-span-4 row-span-1 p-4 flex items-center bg-neutral-100 styled-element">
        <!-- Optional extra content or leave empty -->
        <p>Additional Content</p>
      </div>

      <div class="col-span-1 col-start-5 row-start-1 row-end-5 p-4 flex flex-col bg-neutral-100 styled-element">
        <h2 class="text-xl font-bold mb-2">Project Settings</h2>
        <Dropdown
          :items="versionNames"
          @selectedItem="handleSelectedItem"
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
          class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-3 my-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          @click="loadProject"
        >
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { dummyData, dummyFlatData } from '@/models/chartModels'
import type { ChartData, ChartOptions } from '@/models/chartModels'

// Component imports
import Dropdown from '@/components/Misc/Dropdown.vue'
import Navbar from '@/components/Misc/Navbar.vue'
import StackedBarChart from '@/components/Graphs/StackedBarChart.vue'
import DivergingStackedBar from '@/components/Graphs/DivergingStackedBar.vue'
import SelectablePieChart from '@/components/Graphs/SelectablePieChart.vue'

import { useNavigationStore } from '@/stores/navigation'
import { useSpeckleStore } from '@/stores/speckle'

import type { dropdownItem } from '@/components/Misc/Dropdown.vue'
import type { Version, ResponseObjectStream } from '@/models/speckle'

const navStore = useNavigationStore()
const speckleStore = useSpeckleStore()
const contentVisible = ref(false)
const backgroundVisible = ref(false)

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

  if (version) speckleStore.setSelectedVersion(version)
}

/**
 * Load version into the project store and navigating to a project view
 * TODO: This should definately be its own utils residing in SpeckleUtils
 */
const loadProject = async () => {
  let version: Version

  if (speckleStore.getProjectDetails) {
    // Try to find the project version in the store.
    const versionFound =
      speckleStore.getProjectDetails.stream.commits.items.find(
        (obj) => obj.id === speckleStore.getSelectedVersion?.id
      )

    // If the version was found, set the version and update the store.
    if (versionFound) {
      version = versionFound
      speckleStore.setSelectedVersion(version)
    } else {
      const latestVersion = speckleStore.getProjectDetails.stream.commits.items[0]
      speckleStore.setSelectedVersion(latestVersion)
    }
  } else {
    console.error('Project store object is undefined.')
  }

  navStore.toggleLoading()

  const objects: ResponseObjectStream = await speckleStore.getObjects() // Attempt to get project objects from Speckle.
  const project: Project | null = convertObjects(objects) // Convert objects to a project class, can be null.

  // If project is not null, create it in the project store.
  if (project) {
    projectStore.createNewProject(project)
  } else {
    console.error('Could not create project from Speckle.')
  }

  navigationStore.setActivePage('Overview')
  navigationStore.toggleLoading()
  router.push('/dashboard')
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