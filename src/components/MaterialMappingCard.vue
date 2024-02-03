<template>
	<div
		tabindex="0"
		id="groupCard"
		class="rounded-2xl bg-gray-200 p-2 focus:ring-1 focus:ring-gray-400 min-w-full"
	>
		<div class="flex flex-col justify-between items-center">
			<div class="flex items-center">
				<label
					id="groupName"
					class="w-full text-center ml-2 text-gray-700 font-semibold font-sans truncate hover:underline"
				>
					{{ inGroup.name ? inGroup.name : 'No name' }}
				</label>
			</div>
			<div
				class="bg-gray-100 rounded-lg p-1 mt-1 items-center w-3/4 flex flex-col"
			>
				<label
					class="w-full text-center ml-2 text-gray-700 font-semibold font-sans truncate"
				>
					{{ mappedMaterial }}
				</label>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	import { computed, defineComponent, ref } from 'vue'
	import type { NestedGroup } from '@/models/filters'

	export default defineComponent({
		name: 'MappingCard',
		props: {
			/**
			 * Group to show in the card
			 */
			group: {
				type: Object as () => NestedGroup,
				required: true
			}
		},
		setup(props) {
			const inGroup = ref(props.group)

			const mappedMaterial = computed(() => {
				const objects = inGroup.value.objects

				if (objects) {
					const materialNames = objects.map((obj) => obj.material?.name)
					const uniqueMaterialNames = new Set(materialNames)

					if (uniqueMaterialNames.size === 1) {
						if (uniqueMaterialNames[0] == undefined) {
							return 'No material mapped'
						} else {
							return uniqueMaterialNames[0]
						}
					} else {
						return 'Mixed'
					}
				} else {
					return 'No material mapped'
				}
			})

			return {
				inGroup,
				mappedMaterial
			}
		}
	})
</script>
