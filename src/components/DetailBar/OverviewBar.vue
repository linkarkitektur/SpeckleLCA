<template>
	<label class="text-center"
		>Selected: {{ amountSelected }} objects <br />
		Total of {{ groupArea }}m<sup>2</sup>
	</label>
</template>

<script lang="ts">
	import { defineComponent, computed } from 'vue'
	import { useProjectStore } from '@/stores/projectStore'

	export default defineComponent({
		name: 'OverviewBar',
		components: {},
		setup() {
			const projectStore = useProjectStore()

			const amountSelected = computed(() => {
				if (projectStore.selectedObjects.length === 0) {
					return 0
				} else {
					return projectStore.selectedObjects.length
				}
			})

			const groupArea = computed(() => {
				if (projectStore.selectedObjects.length === 0) {
					return 0
				} else {
					const area = projectStore.selectedObjects.reduce(
						(sum, obj) => sum + obj.quantity.m2,
						0
					)
					return parseFloat(area.toFixed(2))
				}
			})

			return {
				amountSelected,
				projectStore,
				groupArea
			}
		}
	})
</script>
