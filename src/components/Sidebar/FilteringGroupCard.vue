<template>
	<div class="grid grid-cols-3 gap-4 w-full divide-x divide-black">
		<div class="text-center normal-case">
			<span>{{ totals.m }} m</span>
		</div>
		<div class="text-center normal-case">
			<span>{{ totals.m2 }} m<sup>2</sup></span>
		</div>
		<div class="text-center normal-case">
			<span>{{ totals.m3 }} m<sup>3</sup></span>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue'
	import type { NestedGroup } from '@/models/filterModel'

	const props = defineProps({
		groups: Object as () => NestedGroup
	})

	const inGroups = ref(props.groups)

	const totals = computed(() => {
		const processedParents = new Set<string>()
		let totalM = 0,
			totalM2 = 0,
			totalM3 = 0

		inGroups.value.objects.forEach((obj) => {
			// Determine the key to group by:
			const key = obj.id

			if (!processedParents.has(key)) {
				totalM += obj.quantity.m || 0
				totalM2 += obj.quantity.m2 || 0
				processedParents.add(key)
			}
			// Always add the cubic value since that is still relevant
			totalM3 += obj.quantity.m3 || 0
		})

		return {
			m: parseFloat(totalM.toFixed(2)),
			m2: parseFloat(totalM2.toFixed(2)),
			m3: parseFloat(totalM3.toFixed(2))
		}
	})
</script>
