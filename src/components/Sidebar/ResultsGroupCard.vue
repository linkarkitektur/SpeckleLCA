<template>
	<p
    v-if="totalEmission !== 0" 
    class="text-center"
  >
    {{ totalEmission }} CO<sup>2</sup>/m<sup>2</sup>
  </p>
  <p
    v-else
    class="text-center"
  >
  {{ emissionText }}
  </p>
</template>

<script lang="ts">
	import { defineComponent, watch, ref, computed } from 'vue'
	import type { NestedGroup } from '@/models/filters'
import { addEmissions, emissionToNumber, sumEmissions } from '@/utils/resultUtils';

	export default defineComponent({
		name: 'ResultsGroupCard',
		components: {},
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
			const inGroups = ref(props.groups)

			watch(
				() => props.groups,
				(newValue) => {
					inGroups.value = newValue
				}
			)
      let emissionText = 'Not calculated'

			const totalEmission = computed(() => {
				// Only include objects with valid results and a valid m2 quantity
				const validObjects = inGroups.value.objects.filter(obj =>
					obj.results && obj.results.length && obj.quantity?.m2
				)

				if (validObjects.length === 0) {
					emissionText = 'Not calculated'
					return 0
				}

				// Reduce to sum up emissions and area together
				const { emissions, totalArea } = validObjects.reduce((acc, obj) => {
					const lastResult = obj.results[obj.results.length - 1]
					if (lastResult?.emission) {
						acc.emissions.push(lastResult.emission)
					}
					acc.totalArea += obj.quantity.m2? obj.quantity.m2 : 1
					return acc
				}, { emissions: [], totalArea: 0 })


				const aggregatedEmission = sumEmissions(emissions)
				const totalEmissionNumber = emissionToNumber(aggregatedEmission)
				const emissionPerSQM = totalArea > 0 ? totalEmissionNumber / totalArea : 0

        if (emissionPerSQM === 0) 
          emissionText = 'Error calculating emissions'
        
				return parseFloat(emissionPerSQM.toFixed(2))
			})

			return {
				totalEmission,
        emissionText,
				inGroups
			}
		}
	})
</script>
