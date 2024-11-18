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
				const emission = inGroups.value.objects.reduce(
					(sum, obj) => {
            if (!obj.results) {
              emissionText = 'Not calculated'
              return sum
            }
            const lastResult = obj.results[obj.results.length - 1];
            if (lastResult && lastResult.emission) {
              for (const impactCategory in lastResult.emission) {
                for (const lifeCycleStage in lastResult.emission[impactCategory]) {
                  sum += lastResult.emission[impactCategory][lifeCycleStage]
                }
              }
            }
            return sum / obj.quantity.m2
          },
          0
				)
        if (emission === 0) {
          emissionText = 'Error calculating emissions'
        }
				return parseFloat(emission.toFixed(2))
			})

			return {
				totalEmission,
        emissionText,
				inGroups
			}
		}
	})
</script>
