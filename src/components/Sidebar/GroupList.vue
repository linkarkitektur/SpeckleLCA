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
	import { createStandardFilters } from '@/utils/projectUtils'

	import type { NestedGroup } from '@/models/filters'
	import type { Filter, Group, FilterList } from '@/models/filters'
	import type { GeometryObject } from '@/models/geometryObject'

	export default defineComponent({
		name: 'FilterList',
		components: {
			PencilSquareIcon,
			PlusCircleIcon,
			Draggable,
			GroupCard
		},
		setup() {
			const projectstore = useProjectStore()
			const navStore = useNavigationStore()

			const currSlideName = computed(() => {
				if (navStore.activePage === 'Overview') return 'Edit filters'
				else if (navStore.activePage === 'Mapping') return 'Edit materials'
				else if (navStore.activePage === 'Results') return 'Edit results'
				else if (navStore.activePage === 'Benchmark') return 'Edit results'
				else return null
			})

			const { filterRegistry, projectGroups } = storeToRefs(projectstore)
			const refTree = ref<NestedGroup[]>([])

			const toggleSlideover = () => {
				navStore.toggleSlideover()
			}

			const addGroup = () => {
				navStore.toggleGroupModal()
			}

			onMounted(() => {
				setStandardFilters()
				calcList(true)
			})

			/**
			 * Remake the tree if change is done on filterss
			 */
			watch(
				() => filterRegistry.value?.filterCallStack,
				() => {
					calcList(true)
				}
			)

			/**
			 * Remake the tree if change is done of the group list
			 */
			watch(
				projectGroups,
				() => {
					calcList(false)
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
							name: 'groupByFilter',
							field: 'category'
						},
						{
							name: 'groupByFilter',
							field: 'family'
						}
					]
				}

				exampleRegistry.filterCallStack = testFilters
				projectstore.setFilterRegistry(exampleRegistry)
			}

			/**
			 * TODO: Move this to projectutils
			 * Calculate the list, this is triggered onMounted but can be manually triggered on updates
			 */
			const calcList = (reCalc: boolean) => {
				let groups: Group[] = []

				// First time running we need to define the groups from scratch
				if (reCalc) {
					//Create geometry objects from the project
					let geo: GeometryObject[] = []
					projectstore.currProject?.geometry.forEach((element) => {
						geo.push(element)
					})

					//Root for the group, this should not be needed
					groups = [
						{
							id: 'test',
							name: 'root',
							path: ['root'],
							elements: geo
						}
					]

					//Go through each filter and iterate over them
					let reverseStack: Filter[] = []
					if (projectstore.filterRegistry)
						reverseStack = projectstore.filterRegistry.filterCallStack.callStack

					reverseStack.forEach((el) => {
						if (el.value) {
							groups = projectstore.filterRegistry?.callFilter(
								`${el.name}`,
								groups,
								`${el.field}`,
								`${el.value}`,
								el.remove
							)
						} else {
							groups = projectstore.filterRegistry?.callFilter(
								`${el.name}`,
								groups,
								`${el.field}`
							)
						}

						//Remove root in path since we had to add it
						groups.forEach((element) => {
							if (element.path[0] === 'root') element.path.splice(0, 1)
						})
					})
				} else {
					if (projectstore.projectGroups) {
						groups = projectstore.projectGroups
					}
				}

				groups.sort((a, b) => b.elements.length - a.elements.length)

				//Update groups and make a tree structure from them
				projectstore.updateGroups(groups)
				const tree: NestedGroup[] | undefined =
					projectstore.getGroupTree()?.children

				if (tree) {
					tree.sort((a, b) => b.objects.length - a.objects.length)
					refTree.value = tree
				}
			}

			return {
				refTree,
				currSlideName,
				toggleSlideover,
				addGroup
			}
		}
	})
</script>
