<template>
	<nav class="flex flex-col h-full overflow-hidden">
		<!-- Scrollable content -->
		<div class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
			<Draggable
				v-if="refTree && refTree.length"
				:list="refTree"
				:group="refTree"
				item-key="id"
				ghost-class="ghost"
				:animation="200"
			>
				<template #item="{ element }">
					<div class="px-2 py-4">
						<GroupCard class="hover:cursor-move" :groups="element" />
					</div>
				</template>
			</Draggable>
		</div>
	</nav>
</template>

<script setup lang="ts">
	import { watch, computed } from 'vue'
	import Draggable from 'vuedraggable'

	import GroupCard from '@/components/Sidebar/GroupCard.vue'

	import { useProjectStore } from '@/stores/projectStore'

	import { useSpeckleStore } from '@/stores/speckleStore'

	const projectStore = useProjectStore()
	const speckleStore = useSpeckleStore()

	const refTree = computed(() => {
		const tree = projectStore.getGroupTree()
		return tree?.children || []
	})

	// Watch group colors on change of refTree
	watch(
		refTree,
		(newTree) => {
			if (newTree?.length) {
				try {
					speckleStore.calculateGroupColors(newTree)
				} catch (error) {
					console.error('Error calculating group colors:', error)
				}
			}
		},
		{ immediate: true }
	)
</script>
