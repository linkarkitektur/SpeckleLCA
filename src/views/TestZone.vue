<template>
	<!--DivergingStackedBar / -->
	<div class="w-screen h-96">
		<GaugeChart />
	</div>
</template>

<script>
	import GaugeChart from '@/components/Graphs/GaugeChart.vue'
	import { BSAB96 } from '@/models/buildingCodeModel'

	export default {
		components: {
			GaugeChart
		},
		data() {
			return {
				items: BSAB96
			}
		}
	}
</script>
