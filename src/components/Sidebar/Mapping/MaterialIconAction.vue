<template>
	<button
		id="cardAction"
		aria-label="Expand"
		class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
		@click="toggleMappingModal"
	>
		<MapIcon id="cardAction" class="h-5 w-5" />
	</button>
</template>

<script lang="ts">
	import { defineComponent } from 'vue'
	import { MapIcon } from '@heroicons/vue/24/solid'
	import { useNavigationStore, useProjectStore } from '@/stores/main'

	import type { NestedGroup } from '@/models/filters'

	export default defineComponent({
		name: 'MaterialIconAction',
		components: {
			MapIcon
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
			const navStore = useNavigationStore()
			const projectStore = useProjectStore()
			const toggleMappingModal = () => {
				projectStore.setSelectedGroup(props.groups)
				navStore.toggleMappingModal()
			}

			return {
				toggleMappingModal
			}
		}
	})
</script>
