<template>
  <!-- Navbar -->
  <Navbar class="print:hidden" />
  <div 
    :class="['result-report', isA4Mode ? 'a4-print' : '']"
    class="
      px-20 space-y-6 flex flex-col
      print:p-0 print:flex print:flex-col print:items-center print:justify-center
    "
  >
    <!-- Page Title -->
    <h1 class="text-3xl font-bold text-center">{{ reportTitle }}</h1>

    <!-- 3D Viewer -->
    <div 
      class="
        relative w-full h-[calc(100vh-4rem)] overflow-auto bg-white p-4
        print:max-h-[250mm]
      "
      id="renderParent"
    >
      <Suspense>
        <SpeckleViewer />
      </Suspense>
    </div>

    <!-- Graph Section -->
    <div class="flex justify-center">
      <Dropdown
          :items="graphParameters"
          name="graphParameter"
          :dropdownName="dropdownName"
          @selectedItem="handleResultListSelection"
          class="self-start print:hidden z-50"
      />
    </div>
    <div 
      class="
        graphs-container
        w-full h-[33vh] mx-auto print:max-w-[210mm]
        flex flex-col items-center
      "
    >
      <GraphContainer :resultItem="selectedResultItem" />
    </div>
    <!-- Editable Text Field -->
    <div class="editable-text-container p-4">
      <textarea
        v-model="editableText"
        class="w-full border-gray-300 p-2 text-gray-700"
        placeholder="Add your notes here..."
      ></textarea>
    </div>

    <!-- Dropdown and Result Table -->
    <div class="table-container p-4 space-y-4">
      <Dropdown 
        :items="phaseOptions" 
        @selectedItem="updateSelectedPhase"
        class="print:hidden" 
      />
      <DataTable :resultItem="selectedResultItem" />
    </div>

    <!-- Print Button -->
    <div class="flex justify-center">
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        @click="prepareAndPrint"
      >
        Print Report
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import required components
import Navbar from '@/components/Base/Navbar.vue'
import SpeckleViewer from '@/components/ModelViewer/SpeckleViewer.vue'
import GraphContainer from '@/components/Graphs/GraphContainer.vue'
import DataTable from '@/components/Graphs/DataTable.vue'
import Dropdown from '@/components/Base/Dropdown.vue'

// Import stores
import { useSettingsStore } from '@/stores/settingStore'
import { useResultStore } from '@/stores/resultStore'
import { useProjectStore } from '@/stores/projectStore'

// Import Vue
import { ref, computed } from 'vue'

// Import Types
import type { dropdownItem } from '@/components/Base/DropdownMenuItem.vue'
import type { ResultItem } from '@/models/resultModel'

// Stores
const settingsStore = useSettingsStore()
const resultStore = useResultStore()
const projectStore = useProjectStore()

// Reactive Variables
const reportTitle = ref(projectStore.currProject.name)
const isA4Mode = ref(false) 
const includedPhases = ref(
  settingsStore.calculationSettings.includedStages.relevantStages
  .filter(stage => stage.included)
  .map(stage => stage.stage)
  .join(', ')
)
const editableText = ref(`Area: ${settingsStore.projectSettings.area} m²\nIncluded Phases: ${includedPhases.value}`)
const selectedResultItem = ref(resultStore.resultList[0])
const phaseOptions = computed(() =>
  resultStore.resultList.map((item) => ({
    name: item.displayName,
    data: JSON.stringify(item),
  }))
)

// Dropdown items from resultList
const graphParameters = ref<dropdownItem[]>(
  resultStore.resultList.map((result) => ({
    name: result.displayName,
    data: JSON.stringify(result), // Passing the entire result as JSON for flexibility
  }))
)
const benchmarkParameter = ref<string>('parameters.speckle_type')

const selectedResult = ref<ResultItem | null>(null)
const dropdownName = ref(selectedResult.value ? selectedResult.value.displayName : 'Select a result')

// Methods
function updateSelectedPhase(selectedItem) {
  const data = JSON.parse(selectedItem.data)
  selectedResultItem.value = data
}

// Just to make sure that vue interprets window in the correct setting
function prepareAndPrint() {
  // Enter A4 mode
  isA4Mode.value = true

  // Delay to allow styles to apply before printing
  setTimeout(() => {
    window.print()
    // Exit A4 mode after print
    isA4Mode.value = false
  }, 500)
}

// Handler for selecting a dropdown item
const handleResultListSelection = (selectedItem: dropdownItem) => {
  resultStore.setReloadData(true)
  projectStore.clearSelectedObjects()
  const parsedResult = JSON.parse(selectedItem.data) as ResultItem
  benchmarkParameter.value = parsedResult.parameter
  selectedResultItem.value = parsedResult
}

</script>

<style scoped>
/* Tailwind utility classes handle most styles */
/* A4 Print Styles */
.a4-print {
  width: 210mm; /* A4 width */
  margin: 0 auto;
  box-sizing: border-box;
}

/* Print-specific styles */
@media print {
  /* Adjust 3D Viewer */
  .viewer-container {
    height: auto; /* Maintain aspect ratio */
    overflow: hidden;
  }

  /* Prevent page breaks inside important sections */
  .graphs-container,
  .table-container,
  .editable-text-container {
    page-break-inside: avoid;
  }

  .a4-print {
    display: block;
  }
}
</style>