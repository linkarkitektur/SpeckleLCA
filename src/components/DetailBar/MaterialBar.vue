<template>
	<div class="w-5/6 flex flex-col items-center">
		<div class="w-full flex">
			<div
				class="transition-all ease-out duration-1000 h-10 rounded-sm bg-green-300 justify-center flex items-center opacity-80 right-0 text-gray-600"
				:style="{ width: percentMapped + '%' }"
			>
				<label v-if="percentMapped > 0" class="text-center">
					{{ percentMapped }}%
				</label>
				<label v-else class="text-center pl-8"> {{ percentMapped }}% </label>
			</div>
			<div
				class="transition-all ease-out duration-1000 w-1 h-8 m-1 rounded-full bg-white border-transparent border-r opacity-50"
			></div>
			<div
				class="transition-all ease-out duration-1000 top-0 left-0 h-10 rounded-sm bg-red-300 justify-center flex items-center opacity-80"
				:style="{ width: 100 - percentMapped + '%' }"
			></div>
		</div>
		<div class="mt-1 flex w-full items-center justify-between text-xs">
			<div class="text-gray-600 left-0">Mapped</div>
			<div class="text-gray-600 right-0">Not mapped</div>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, computed } from 'vue'
	import { useProjectStore } from '@/stores/main'

	export default defineComponent({
		name: 'OverviewBar',
		components: {},
		setup() {
			const projectStore = useProjectStore()

			// Check how many geometry objects has a material mapped to them
			const percentMapped = computed(() => {
				if (projectStore.selectedGroup == null) {
					// If no selection but we have a project get everything
					if (projectStore.currProject?.geometry != null) {
						const totalObjects = projectStore.currProject.geometry.length
						const objectsWithMaterial =
							projectStore.currProject.geometry.filter(
								(obj) => obj.material !== undefined && obj.material !== null
							)

						const percentageWithMaterial =
							(objectsWithMaterial.length / totalObjects) * 100
						return parseFloat(percentageWithMaterial.toFixed(1))
					} else {
						return 0
					}
				} else {
					// Count the number of objects with and without a material
					const totalObjects = projectStore.selectedGroup.objects.length
					const objectsWithMaterial = projectStore.selectedGroup.objects.filter(
						(obj) => obj.material !== undefined && obj.material !== null
					)

					const percentageWithMaterial =
						(objectsWithMaterial.length / totalObjects) * 100
					// Debug remove for production
					const randInt = Math.random() * 100
					return parseFloat(randInt.toFixed(1))
					//return parseFloat(percentageWithMaterial.toFixed(1))
				}
			})

			return {
				percentMapped
			}
		}
	})
</script>
