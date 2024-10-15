<template>
	<button
		aria-label="Expand"
		class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
		@click="calculateResults"
	>
		<CalculatorIcon class="h-5 w-5" />
	</button>
</template>

<script lang="ts">
	import { defineComponent } from 'vue'
	import { CalculatorIcon } from '@heroicons/vue/24/solid'

	import type { NestedGroup } from '@/models/filters'

	import { EmissionCalculator } from '@/utils/emissionUtils'

	export default defineComponent({
		name: 'ResultsIconAction',
		components: {
			CalculatorIcon
		},
		props: {
			/**
			 * Array of groups to show in the card, they should all share a top level to show
			 */
			groups: {
				type: Object as () => NestedGroup,
				required: true
			}
		},
		setup(props) {
			const calculateResults = () => {
				const calculator = new EmissionCalculator(props.groups.objects)
				calculator.calculateEmissions()
			}

			return {
				calculateResults
			}
		}
	})
</script>
