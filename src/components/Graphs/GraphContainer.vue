<template>
  <div class="h-full w-full flex flex-col">
    <!-- TODO Change this to use a wrapper component so we dont use v-if but instead the leftModule logic -->
    <div 
      class="items-end mb-10"
      v-if="navigationStore.activePage === 'Results'"  
    >
      <Dropdown
        class="w-full"
        :items="graphParameters"
        name="graphParameter"
        :dropdownName="dropdownName"
        @selectedItem="handleResultListSelection"
      />
    </div>
    <div 
      v-if="leftModule" 
      class="w-full h-full"
      :style="{
        minWidth: minW, 
        maxWidth: maxW, 
        maxHeight: maxH,
        minHeight: minH
      }"
    >
      <component :is="leftModule" v-bind="graphProps" class="mt-0"/>
    </div>
  </div>
</template>

<script setup lang="ts">
// External imports
import { 
  watch, 
  ref,
  computed,
  defineProps,
  defineComponent
} from 'vue'

// Store imports
import { useNavigationStore } from '@/stores/navigationStore'
import { useResultStore } from '@/stores/resultStore'
import { useProjectStore } from '@/stores/projectStore'

// Components imports
import SelectablePieChart from '@/components/Graphs/SelectablePieChart.vue'
import DivergingStackedBar from '@/components/Graphs/DivergingStackedBar.vue'
import Dropdown from '@/components/Base/Dropdown.vue'

// Utility imports
import { 
  geometryToChartData,
  geometryToNestedChartData,
  resultItemToChartData,
  resultItemToNestedChartData,
  } from '@/utils/resultUtils'

// Type imports
import type { dropdownItem } from '@/components/Base/DropdownMenuItem.vue'
import type { ChartData, ChartOptions, NestedChartData } from '@/models/chartModel'
import type { ResultItem } from '@/models/resultModel'
import VerticalBarChart from '@/components/Graphs/VerticalBarChart.vue'
import StackedBarChart from '@/components/Graphs/StackedBarChart.vue'

// Props
const props = withDefaults(defineProps<{
  resultItem?: ResultItem
  graph?: string
  minW?: string
  maxW?: string
  maxH?: string
  minH?: string
}>(), {
  minW: 'calc(35vh)',
  minH: 'calc(35vh)',
  maxW: 'calc(35vh)',
  maxH: 'calc(35vh)',
})

// Stores
const navigationStore = useNavigationStore()
const resultStore = useResultStore()
const projectStore = useProjectStore()

// Fallback
const EmptyComponent = defineComponent({
  template: "<div></div>", // Renders nothing if leftModule is empty
})

// Dropdown items from resultList
const graphParameters = ref<dropdownItem[]>(
  resultStore.resultList.map((result) => ({
    name: result.displayName,
    data: JSON.stringify(result), // Passing the entire result as JSON for flexibility
  }))
)

// Update graphdropdown with new results, this is called when a new result is added
// Needed because this is done after the ui has been loaded, so we need to update the dropdown
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
  resultStore.setReloadData(true)
  const parsedResult = JSON.parse(selectedItem.data) as ResultItem
  selectedResult.value = parsedResult

  resultStore.setActiveParameter(parsedResult.parameter)
  // Update graphProps with the new data
  updateGraphProps("SelectablePieChart")
}

// Computed property for dynamic component
const leftModule = computed(() => {
  if (props.graph) {
    switch (props.graph) {
      case 'VerticalBarChart':
        updateGraphProps("VerticalBarChart")
        return VerticalBarChart
      case 'PieChart':
        updateGraphProps("SelectablePieChart")
        return SelectablePieChart
      case 'DivergingStackedBar':
        updateGraphProps("DivergingStackedBar")
        return DivergingStackedBar
      case 'StackedBarChart':
        updateGraphProps("StackedBarChart")
        return StackedBarChart
    }
  }
  switch (navigationStore.activePage) {
    case 'Filtering':
    case 'Mapping':
      return EmptyComponent
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
      updateGraphProps("SelectablePieChart")
      return SelectablePieChart
    case 'Report':
      updateGraphProps("SelectablePieChart")
      return SelectablePieChart
    default:
      return EmptyComponent
  }
})

// We remap these so we can get the name of the component
const componentNames = new Map([
  [EmptyComponent, 'EmptyComponent'],
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
    case "SelectablePieChart":
    case "StackedBarChart": {
      let data: ChartData[] = []
      let options: ChartOptions = {
        aggregate: true,
        unit: "kg CO2e",
      }
      if (!projectStore.selectedObjects.length) {
        if (selectedResult.value) {
          data = resultItemToChartData(selectedResult.value)
        } else {
          data = resultItemToChartData(props.resultItem)
        }
        graphProps.value = {
          data,
          options,
        }
      } else {
        if (!selectedResult.value) return
        data = geometryToChartData(projectStore.selectedObjects, selectedResult.value.parameter, false, true)
        graphProps.value = {
          data,
          options,
        }
      }
      break
    }
    case "DivergingStackedBar":
    case "VerticalBarChart": {
      let data: NestedChartData[]
      let options: ChartOptions = {
        aggregate: true,
        unit: "kg CO2e",
      }
      if (selectedResult.value) {
        data = geometryToNestedChartData(projectStore.currProject.geometry, selectedResult.value.parameter)
      } else {
        data = resultItemToNestedChartData(props.resultItem)
      }
      graphProps.value = {
        data,
        options,
      }
      break
    }
    default:
      graphProps.value.data = []
  }
  
}

// Watchers
// Update grahp for selected objects
watch(() => projectStore.selectedObjects, () => {
  updateGraphProps()
})

// Update graph when new results get calculated
watch(() => resultStore.resultList, () => {
  updateGraphDropdown()
})

// Update graph when selecting a new result in dropdown
watch(selectedResult, (newValue) => {
  if (newValue) {
    dropdownName.value = newValue.displayName
    updateGraphProps()
  } else {
    dropdownName.value = 'Select a result'
  }
})

// Update graph when new result is passed as prop
// This might not be needed, but it's here for now
watch(() => props, () => {
  updateGraphProps()
}), { deep : true }

updateGraphProps()
</script>