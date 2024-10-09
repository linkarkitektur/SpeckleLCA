<template>
	<p class="text-center">{{ totalArea }} m<sup>2</sup></p>
</template>

<script lang="ts">
	import { defineComponent, watch, ref, computed } from 'vue'
	import type { NestedGroup } from '@/models/filters'

	export default defineComponent({
		name: 'OverviewGroupCard',
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

			const totalArea = computed(() => {
				const area = inGroups.value.objects.reduce(
					(sum, obj) => sum + obj.quantity.m2,
					0
				)
				return parseFloat(area.toFixed(2))
			})

			return {
				totalArea,
				inGroups
			}
		}
	})
</script>
