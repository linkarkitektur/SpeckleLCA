<template>
	<div
		id="DetailBar"
		class="absolute flex bottom-0 left-[35%] z-10 w-2/5 h-28 mb-8 px-2 styled-element bg-neutral-100 hoverable-styling"
	>
		<div class="flex w-full h-full items-center justify-center">
			<component :is="currDetailbar" v-bind="componentProps" />
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, watch, ref } from 'vue'
	import { useProjectStore } from '@/stores/projectStore'
	import { useNavigationStore } from '@/stores/navigationStore'

	import OverviewBar from '@/components/DetailBar/OverviewBar.vue'
	import MaterialBar from '@/components/DetailBar/MaterialBar.vue'
	import StackedBarChart from '@/components/Graphs/StackedBarChart.vue'

	import { geometryToChartData } from '@/utils/resultUtils'

	import type { ChartData } from '@/models/chartModel'

	const navStore = useNavigationStore()
	const projectStore = useProjectStore()

	// Total value to be shown for each group
	const currDetailbar = computed(() => {
		if (navStore.activePage === 'Filtering') return OverviewBar
		else if (navStore.activePage === 'Mapping') return MaterialBar
		else if (navStore.activePage === 'Results') return StackedBarChart
		else if (navStore.activePage === 'Benchmark') return null
		else return null
	})

	const componentProps = ref({})

	// Pass props to the current detail bar component
	const updateComponentProps = () => {
		if (currDetailbar.value === StackedBarChart) {
			let data: ChartData[] = []
			if (projectStore.selectedObjects.length > 0) {
				data = geometryToChartData(
					projectStore.selectedObjects,
					'material.name',
					true
				)
			} else {
				data = geometryToChartData(
					projectStore.currProject.geometry,
					'material.name',
					true
				)
			}

			componentProps.value = {
				data,
				options: {
					aggregate: true,
					unit: 'kg CO2e'
				}
			}
		} else {
			componentProps.value = {}
		}
	}

	watch(
		() => projectStore.selectedObjects,
		() => {
			updateComponentProps()
		}
	)

	updateComponentProps()
</script>
