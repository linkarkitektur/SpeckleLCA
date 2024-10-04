<template>
	<div
		id="DetailBar"
		class="absolute flex bottom-0 z-10 left-1/2 -translate-x-1/2 w-5/6 h-24 mb-8 rounded-2xl bg-gray-500 bg-opacity-10 border border-gray-400 border-opacity-50"
	>
		<div class="flex w-full items-center justify-center">
			<component :is="currDetailbar" v-bind="componentProps" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, computed, watch, ref } from 'vue'
import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'

import OverviewBar from '@/components/DetailBar/OverviewBar.vue'
import MaterialBar from '@/components/DetailBar/MaterialBar.vue'
import ResultsBar from '@/components/DetailBar/ResultsBar.vue'
import StackedBarChart from '@/components/Graphs/StackedBarChart.vue'

import { geometryToLCSChartData } from '@/utils/resultUtils'

export default defineComponent({
  name: 'DetailBar',
  components: {
    OverviewBar,
    MaterialBar,
    ResultsBar,
    StackedBarChart
  },
  setup() {
    const navStore = useNavigationStore()
    const projStore = useProjectStore()
    // Total value to be shown for each group
    const currDetailbar = computed(() => {
      if (navStore.activePage === 'Overview') return OverviewBar
      else if (navStore.activePage === 'Mapping') return MaterialBar
      else if (navStore.activePage === 'Results') return StackedBarChart
      else if (navStore.activePage === 'Benchmark') return null
      else return null
    })

		const componentProps = ref({})

    // Pass props to the current detail bar component
    const updateComponentProps = () => {
      if (currDetailbar.value === StackedBarChart) {
        componentProps.value = {
          data: geometryToLCSChartData(projStore.selectedObjects),
        }
      }
			else {
				componentProps.value = {}
			}
		}

		watch(() => projStore.selectedObjects, () => {
			updateComponentProps()
		})

		updateComponentProps()

    return {
      currDetailbar,
      componentProps
    }
  }
})
</script>

