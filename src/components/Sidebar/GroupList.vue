<template>
	<nav class="flex flex-1 flex-col pt-4">
		<div class="relative h-12">
			<button
				aria-label="Expand"
				class="absolute flex top-0 right-0 p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
				@click="toggleSlideover"
			>
				<p>{{ currSlideName }}</p>
				<PencilSquareIcon class="ml-2 h-5 w-5" />
			</button>
		</div>
		<Draggable
			v-if="refTree"
			:list="refTree"
			:group="refTree"
			item-key="id"
			ghost-class="ghost"
			:animation="200"
		>
			<template #item="{ element }">
				<div class="pt-4 pb-4">
					<GroupCard class="hover:cursor-move" :groups="element" />
				</div>
			</template>
		</Draggable>
		<div class="p-10 grid place-items-center">
			<button @click="addGroup">
				<PlusCircleIcon class="h-10 w-10 text-green-600 hover:text-green-500" />
			</button>
		</div>
	</nav>
</template>

<script lang="ts">
	import { defineComponent, ref, onMounted, watch, computed } from 'vue'
	import Draggable from 'vuedraggable'
	import { storeToRefs } from 'pinia'
	import { PencilSquareIcon, PlusCircleIcon } from '@heroicons/vue/24/solid'

	import GroupCard from '@/components/Sidebar/GroupCard.vue'

	import { useProjectStore, useNavigationStore } from '@/stores/main'
	import { FilterRegistry } from '@/models/filters'
	import { createStandardFilters, calculateGroups } from '@/utils/projectUtils'

	import type { NestedGroup } from '@/models/filters'
	import type { Filter, Group, FilterList } from '@/models/filters'
	import { useSpeckleStore } from '@/stores/speckle'

	export default defineComponent({
		name: 'FilterList',
		components: {
			PencilSquareIcon,
			PlusCircleIcon,
			Draggable,
			GroupCard
		},
		setup() {
			const projectStore = useProjectStore()
			const navStore = useNavigationStore()
			const speckleStore = useSpeckleStore()

			const currSlideName = computed(() => {
				if (navStore.activePage === 'Overview') return 'Edit filters'
				else if (navStore.activePage === 'Mapping') return 'Edit materials'
				else if (navStore.activePage === 'Results') return 'Edit results'
				else if (navStore.activePage === 'Benchmark') return 'Edit results'
				else return null
			})

			const { filterRegistry, projectGroups } = storeToRefs(projectStore)
			const refTree = ref<NestedGroup[]>([])

			const toggleSlideover = () => {
				navStore.toggleSlideover()
			}

			const addGroup = () => {
				navStore.toggleGroupModal()
			}

			const toggleColorMode = () => {
				navStore.toggleColorMode()
			}

			onMounted(() => {
				setStandardFilters()
				calculateGroups(true)
				refTree.value =	projectStore.getGroupTree()?.children
				speckleStore.calculateGroupColors(refTree.value)
			})

			/**
			 * Remake the tree if change is done on filterss
			 */
			watch(
				() => filterRegistry.value?.filterCallStack,
				() => {
					calculateGroups(true)
					refTree.value =	projectStore.getGroupTree()?.children
					speckleStore.calculateGroupColors(refTree.value)
					speckleStore.hideUnusedObjects(speckleStore.hiddenObjects.map(obj => obj.id))
				}
			)

			/**
			 * Remake the tree if change is done on the group list
			 */
			watch(
				projectGroups,
				() => {
					calculateGroups(false)
				},
				{ deep: true }
			)

			/**
			 * Set the standard filters for the project, this is mostly for testing
			 * should be a popup or something better later on
			 */
			const setStandardFilters = () => {
				//Create new filterregistry, maybe store this in the projectStore?
				const exampleRegistry = new FilterRegistry()
				createStandardFilters(exampleRegistry)

				//We use filterlists to create the tree
				const testFilters: FilterList = {
					name: 'testFiltering',
					callStack: [
						{
							name: 'groupBy',
							field: 'speckle_type'
						}
					]
				}

				exampleRegistry.filterCallStack = testFilters
				projectStore.setFilterRegistry(exampleRegistry)
			}

			return {
				refTree,
				currSlideName,
				toggleSlideover,
				addGroup,
				toggleColorMode
			}
		}
	})
</script>
