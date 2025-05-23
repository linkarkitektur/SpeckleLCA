<template>
	<Bar class="max-h-full" :data="chartData" />
	<!--<label class="text-center"
		>Emissions: {{ amountSelected }} objects <br />
		Total of {{ groupEmissions }}CO<sup>2</sup>
	</label>-->
</template>

<script lang="ts">
	import { defineComponent, computed } from 'vue'
	import { useProjectStore } from '@/stores/projectStore'

	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		BarElement
	} from 'chart.js'
	import { Bar } from 'vue-chartjs'
	import ChartDataLabels from 'chartjs-plugin-datalabels'
	import type { Emission } from '@/models/materialModel'
	import type { GeometryObject } from '@/models/geometryModel'

	ChartJS.register(Title, Tooltip, Legend, BarElement, ChartDataLabels)

	export default defineComponent({
		name: 'ResultsBar',
		components: {
			Bar
		},
		setup() {
			const projectStore = useProjectStore()

			const amountSelected = computed(() => {
				if (projectStore.selectedObjects.length === 0) {
					return projectStore.currProject.geometry.length
				} else {
					return projectStore.selectedObjects.length
				}
			})

			// Chart data grouped for selected objects
			const chartData = computed(() => {
				const groupedData: Emission = {}
				let geos: GeometryObject[]
				if (projectStore.selectedObjects.length === 0) {
					geos = projectStore.currProject.geometry
				} else {
					geos = projectStore.selectedObjects
				}
				//Go through each selected object and get aggregated labels and emission data
				geos.forEach((obj) => {
					if (!obj.results) return
					const lastResult = obj.results[obj.results.length - 1]
					if (lastResult && lastResult.emission) {
						for (const impactCategory in lastResult.emission) {
							for (const lifeCycleStage in lastResult.emission[
								impactCategory
							]) {
								if (
									!Object.prototype.hasOwnProperty.call(
										groupedData,
										impactCategory
									)
								) {
									groupedData[impactCategory] = {}
								}

								if (
									!Object.prototype.hasOwnProperty.call(
										groupedData[impactCategory],
										lifeCycleStage
									)
								) {
									groupedData[impactCategory][lifeCycleStage] = 0
								}
								groupedData[impactCategory][lifeCycleStage] +=
									lastResult.emission[impactCategory][lifeCycleStage]
							}
						}
					}
				})

				const data = {
					//Get keys for first layer of groupedData
					labels: Object.keys(groupedData),
					datasets: []
				}

				Object.keys(groupedData).forEach((impactCategory) => {
					Object.keys(groupedData[impactCategory]).forEach((lifeCycleStage) => {
						const dataset = {
							label: lifeCycleStage,
							data: [groupedData[impactCategory][lifeCycleStage]],
							backgroundColor: 'rgba(255, 99, 132, 0.2)'
						}
						data.datasets.push(dataset)
					})
				})
				return data
			})

			const chartOptions = {
				plugins: {
					datalabels: {
						color: 'white',
						display: function (context) {
							return context.dataset.data[context.dataIndex] > 15
						},
						font: {
							weight: 'bold'
						},
						formatter: Math.round
					},
					title: {
						display: false
					},
					legend: {
						display: false
					}
				},
				responsive: true,
				indexAxis: 'y',
				scales: {
					x: {
						stacked: true,
						display: false
					},
					y: {
						stacked: true,
						display: false
					}
				}
			}

			// Emissions aggregated for all phases and categories
			const groupEmissions = computed(() => {
				const emission = projectStore.selectedObjects.reduce((sum, obj) => {
					if (!obj.results) return sum
					const lastResult = obj.results[obj.results.length - 1]
					if (lastResult && lastResult.emission) {
						for (const impactCategory in lastResult.emission) {
							for (const lifeCycleStage in lastResult.emission[
								impactCategory
							]) {
								sum += lastResult.emission[impactCategory][lifeCycleStage]
							}
						}
					}
					return sum
				}, 0)
				return parseFloat(emission.toFixed(2))
			})

			return {
				amountSelected,
				projectStore,
				groupEmissions,
				chartData,
				chartOptions
			}
		}
	})
</script>
