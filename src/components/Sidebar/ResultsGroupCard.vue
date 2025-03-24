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

<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import type { NestedGroup } from '@/models/filterModel'
import { emissionToNumber, sumEmissions } from '@/utils/resultUtils';
import { roundNumber } from '@/utils/mathUtils';

const props = defineProps<{ groups: NestedGroup }>()

const inGroups = ref(props.groups)
watch(() => props.groups, (newVal) => {
  inGroups.value = newVal
})
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
		acc.totalArea += obj.quantity.m2? obj.quantity.m2 : 0
		return acc
	}, { emissions: [], totalArea: 0 })


	const aggregatedEmission = sumEmissions(emissions)
	const totalEmissionNumber = emissionToNumber(aggregatedEmission, false)
	const emissionPerSQM = totalArea > 0 ? totalEmissionNumber / totalArea : 0

	if (emissionPerSQM === 0) 
		emissionText = 'Error calculating emissions'
	
	return roundNumber(emissionPerSQM, 2)
})
</script>
