<template>
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

// Utility imports
import { 
  geometryToMaterialChartData,
  materialResultsToMaterialChartData,
  geometryToMaterialTypeNestedChartData
  } from '@/utils/resultUtils'
import { ChartData, ChartOptions, NestedChartData } from '@/models/chartModels'

const navigationStore = useNavigationStore()
const resultStore = useResultStore()
const projectStore = useProjectStore()

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
      if (!projectStore.selectedObjects.length) 
        data = materialResultsToMaterialChartData(resultStore.materialResults)
      else 
        data = geometryToMaterialChartData(projectStore.selectedObjects)
      graphProps.value.data = data
      graphProps.value.options = {
        aggregate: true,
        unit: 'kgCO2e',
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

updateGraphProps()
</script>