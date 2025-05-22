<template>
	<!-- Dot pattern overlay -->
	<div
		class="fixed inset-0 w-full h-full pattern-dots pattern-black pattern-bg-transparent pattern-size-4"
		style="--pattern-opacity: 0.1"
	></div>

	<!-- Main content -->
	<div
		class="relative z-10"
		:class="{
			'opacity-0': !contentVisible,
			'opacity-100 transition-opacity duration-50': contentVisible
		}"
	>
		<Navbar v-if="speckleStore.getProjectDetails?.stream" />
		<div
			class="grid grid-cols-5 grid-rows-4 gap-10 h-[calc(100vh-5rem)] overflow-hidden p-4"
		>
			<div
				class="col-span-4 row-span-1 p-4 flex flex-col bg-neutral-100 styled-element hoverable-styling"
			>
				<h2 class="styled-header pb-2">Project Overview</h2>
				<div class="flex-1 min-h-[120px]">
					<StackedBarChart :data="barData" :options="barOptions" />
				</div>
			</div>

			<div
				class="col-span-2 row-span-2 p-4 flex flex-col bg-neutral-100 styled-element hoverable-styling"
			>
				<h2 class="styled-header pb-2">Emissions by material category</h2>
				<div class="flex-1 aspect-square">
					<GraphContainer
						graph="VerticalBarChart"
						:result-item="categoryResults"
					/>
				</div>
			</div>

			<div
				class="col-span-2 row-span-2 p-4 flex flex-col bg-neutral-100 styled-element hoverable-styling"
			>
				<h2 class="styled-header pb-2">Emissions by phase</h2>
				<div class="flex-1 aspect-square">
					<GraphContainer graph="PieChart" :result-item="cycleResults" />
				</div>
			</div>

			<div
				class="col-span-4 row-span-1 p-4 flex flex-col bg-neutral-100 styled-element hoverable-styling"
			>
				<h2 class="styled-header pb-2">Emissions by material</h2>
				<div class="flex-1">
					<GraphContainer
						graph="VerticalBarChart"
						:result-item="hotSpotResults"
					/>
				</div>
			</div>

			<div
				class="col-span-1 col-start-5 row-start-1 row-end-5 p-6 flex flex-col bg-neutral-100 styled-element hoverable-styling"
			>
				<SettingsProjectOverview />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, onMounted } from 'vue'
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
	import { useSpeckleStore } from '@/stores/speckleStore'
	import { useRoute } from 'vue-router'
	import type { ProjectId } from '@/models/speckleModel'

	// stores
	const speckleStore = useSpeckleStore()
	const firebaseStore = useFirebaseStore()
	const projectStore = useProjectStore()
	const settingsStore = useSettingsStore()

	// refs
	const contentVisible = ref(false)
	const backgroundVisible = ref(false)
	const resultLog = ref<ResultsLog>()

	const nameParameter = ref<string>('material.name')
	const materialParameter = ref<string>('material.metaData.materialType')
	const cycleParameter = ref<string>('lifeCycleStages')

	const route = useRoute()

	// Computed
	const hotSpotResults = computed(() =>
		resultLog.value?.resultList.find(
			(res) => res.parameter === nameParameter.value
		)
	)
	const categoryResults = computed(() =>
		resultLog.value?.resultList.find(
			(res) => res.parameter === materialParameter.value
		)
	)
	const cycleResults = computed(() =>
		resultLog.value?.resultList.find(
			(res) => res.parameter === cycleParameter.value
		)
	)

	const remaining = computed(() =>
		roundNumber(
			settingsStore.projectSettings.threshold - emissionSqmName.value,
			2
		)
	)

	// If we do it per year then we divide with lifespan
	const emissionSqmName = computed(() => {
		if (resultLog.value) {
			return resultLogToAdjustedEmission(resultLog.value, nameParameter.value)
		} else {
			return 0
		}
	})

	// Chart data
	const barData = computed<ChartData[]>(() => {
		const spent = emissionSqmName.value || 0
		const rem = remaining.value || 0
		return [
			{
				label: 'Spent',
				value: spent,
				ids: [],
				graphValue: spent
			},
			{
				label: rem > 0 ? 'Remaining' : 'Over Budget',
				value: rem,
				ids: [],
				graphValue: rem
			}
		]
	})

	const barOptions = computed<ChartOptions>(() => {
		if (settingsStore.projectSettings.emissionPerYear)
			return { unit: 'kg CO₂/m²/year' }
		return { unit: 'kg CO₂/m²' }
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

		const projectId = route.params.projectId as string

		await speckleStore.updateProjectVersions(projectId, 100, null)
		const projectData = await firebaseStore.fetchProjectInfo(projectId)
		projectStore.updateProjectInformation(projectData as ProjectId)

		const results = await firebaseStore.fetchResults(projectId)
		resultLog.value = results[0]

		// Lazyload the latest version in the background
		loadProject(false)
	})
</script>
