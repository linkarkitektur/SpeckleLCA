<template>
  <!-- TODO Change this to use a wrapper component so we dont use v-if but instead the leftModule logic -->
  <Dropdown
    v-if="navigationStore.activePage === 'Results'"
    :items="graphParameters"
    name="graphParameter"
    :dropdownName="dropdownName"
    @selectedItem="handleResultListSelection"
  />
  <component :is="leftModule" v-bind="graphProps"/>
</template>

<script setup lang="ts">
// External imports
import { 
  watch, 
  ref,
  computed
} from 'vue'

// Store imports
import { useNavigationStore } from '@/stores/navigation'
import { useResultStore } from '@/stores/result'
import { useProjectStore } from '@/stores/main'

// Components imports
import ViewerControls from '@/components/ModelViewer/ViewerControls.vue'
import SelectablePieChart from '@/components/Graphs/SelectablePieChart.vue'
import DivergingStackedBar from '@/components/Graphs/DivergingStackedBar.vue'
import Dropdown from '@/components/Misc/Dropdown.vue'

// Utility imports
import { 
  geometryToMaterialChartData,
  materialResultsToMaterialChartData,
  ResultItemToChartData,
  geometryToMaterialTypeNestedChartData
  } from '@/utils/resultUtils'

// Type imports
import type { dropdownItem } from '@/components/Misc/DropdownMenuItem.vue'
import type { ChartData, ChartOptions, NestedChartData } from '@/models/chartModels'
import type { ResultItem } from '@/models/result'

const navigationStore = useNavigationStore()
const resultStore = useResultStore()
const projectStore = useProjectStore()

// Dropdown items from resultList
const graphParameters = ref<dropdownItem[]>(
  resultStore.resultList.map((result) => ({
    name: result.displayName,
    data: JSON.stringify(result), // Passing the entire result as JSON for flexibility
  }))
)

// Update the dropdown items when the result list changes
const updateGraphDropdown = () => {
  graphParameters.value = resultStore.resultList.map((result) => ({
    name: result.displayName,
    data: JSON.stringify(result),
  }))
}

// Selected result
const selectedResult = ref<ResultItem | null>(null)
const dropdownName = ref(selectedResult.value ? selectedResult.value.displayName : 'Select a result')

// Handler for selecting a dropdown item
const handleResultListSelection = (selectedItem: dropdownItem) => {
  const parsedResult = JSON.parse(selectedItem.data) as ResultItem
  selectedResult.value = parsedResult

  // Update graphProps with the new data
  updateGraphProps("SelectablePieChart")
}

// Computed property for dynamic component
const leftModule = computed(() => {
  switch (navigationStore.activePage) {
    case 'Overview':
    case 'Mapping':
      return ViewerControls
    case 'Results':
      if (navigationStore.sideBarShow) {
        updateGraphProps("SelectablePieChart")
        return SelectablePieChart
      }
      else {
        updateGraphProps("DivergingStackedBar")
        return DivergingStackedBar
      }
    case 'Benchmark':
    default:
      return null
  }
})

// We remap these so we can get the name of the component
const componentNames = new Map([
  [ViewerControls, 'ViewerControls'],
  [SelectablePieChart, 'SelectablePieChart'],
  [DivergingStackedBar, 'DivergingStackedBar']
])

const componentName = computed(() => {
  return componentNames.get(leftModule.value) || 'UnknownComponent'
})

const graphProps = ref<{ data: ChartData[] | NestedChartData[], options: ChartOptions }>({
  data: [],
  options: {} as ChartOptions,
})

// Pass props to the current detail bar component
const updateGraphProps = (chart: string = "") => {
  if (chart === "") chart = componentName.value
  switch (chart) {
    case "SelectablePieChart": {
      let data: ChartData[]
      if (!projectStore.selectedObjects.length) {
        data = ResultItemToChartData(selectedResult.value)
        graphProps.value.data = data
        graphProps.value.options = {
          aggregate: true,
          unit: "kgCO2e",
        }
      }
      else {
        data = geometryToMaterialChartData(projectStore.selectedObjects)
        graphProps.value.data = data
        graphProps.value.options = {
          aggregate: true,
          unit: 'kgCO2e',
        } 
      }
      break
    }
    case "DivergingStackedBar": {
      let data: NestedChartData[]
      
      data = geometryToMaterialTypeNestedChartData(projectStore.currProject.geometry)
      graphProps.value.data = data
      graphProps.value.options = {
        aggregate: false,
        unit: 'kgCO2e',
      }
      break
    }
    default:
      graphProps.value.data = []
  }
  
}

watch(() => projectStore.selectedObjects, () => {
  updateGraphProps()
})

watch(() => resultStore.resultList, () => {
  updateGraphDropdown()
})

watch(selectedResult, (newValue) => {
  if (newValue) {
    dropdownName.value = newValue.displayName
    updateGraphProps()
  } else {
    dropdownName.value = 'Select a result'
  }
})

watch(graphParameters, (newGraphParameters) => {
  if (newGraphParameters.length > 0) {
    // If selectedResult is null or no longer matches an item in graphParameters, update it
    if (
      !selectedResult.value ||
      !newGraphParameters.some(
        (item) => item.name === selectedResult.value?.displayName
      )
    ) {
      const parsedResult = JSON.parse(newGraphParameters[0].data) as ResultItem
      selectedResult.value = parsedResult
      // Update the dropdownName to reflect the new selection
      dropdownName.value = parsedResult.displayName
    }
  } else {
    // If graphParameters is empty, reset selectedResult and dropdownName
    selectedResult.value = null
    dropdownName.value = 'Select a result'
  }
})

updateGraphProps()
</script>