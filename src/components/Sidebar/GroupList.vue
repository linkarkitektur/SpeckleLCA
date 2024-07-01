<template>
	<nav class="flex flex-1 flex-col pt-4">
		<div class="relative h-12">
			<Dropdown
				:items="dropdownItems"
				:dropdownName="dropdownName"
				@selectedItem="handleSelected"
			/>
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
import Dropdown from '@/components/Dropdown.vue'

import { useProjectStore, useNavigationStore } from '@/stores/main'
import { useSpeckleStore } from '@/stores/speckle'
import { useFirebaseStore } from '@/stores/firebase'
import { createStandardFilters, calculateGroups } from '@/utils/projectUtils'
import { updateMapping } from '@/utils/material'

import { FilterRegistry } from '@/models/filters'
import type { NestedGroup, FilterList } from '@/models/filters'
import type { dropdownItem } from '../Dropdown.vue'
import type { Mapping } from '@/models/material'
import type {
  FilterLog,
  MappingLog,
  ResultsLog
} from '@/models/firebase'

const useFetchDropdownItems = (navStore, firebaseStore, speckleStore, projectStore) => {
	const dropdownItems = ref<dropdownItem[]>([])
	const dropdownName = ref('Fetch data')

	const { handleSelected } = useHandleSelected(navStore, projectStore)

	const fetchDropdownItems = async () => {
		switch (navStore.activePage) {
			case 'Overview': {				
				//Clear dropdownItems
				dropdownItems.value = []
				dropdownName.value = 'Fetch filters'
				//Fetch filters for project and generic filters
				const projectFilters = await firebaseStore.fetchLatestFilters(speckleStore.selectedProject.id)
				const genericFilter = await firebaseStore.fetchGenericFilters()
				if (projectFilters) {
					dropdownItems.value.push(
						...projectFilters.map((log: FilterLog) => ({
							name: log.stackName,
							data: JSON.stringify(log.filterCallStack),
						}))
					)
				}
				if (genericFilter) {
					dropdownItems.value.push(
						...genericFilter.map((log: FilterLog) => ({
							name: log.stackName,
							data: JSON.stringify(log.filterCallStack),
						}))
					)
				}
				break
			}
			case 'Mapping': {
				//Clear dropdownItems
				dropdownItems.value = []
				dropdownName.value = 'Fetch mappings'
				const projectFilters = await firebaseStore.fetchMappings(speckleStore.selectedProject.id)

				dropdownItems.value = [
					...projectFilters.map(log => ({ 
						name: log.mapping.name,
						data: JSON.stringify(log.mapping)
					}))
				]
				break
			}
			case 'Results':
			case 'Benchmark': {
				dropdownName.value = 'Fetch results'
				const projectFilters = await firebaseStore.fetchResults(speckleStore.selectedProject.id)

				dropdownItems.value = [
					...projectFilters.map(log => ({ 
						name: log.results.date.toDateString(),
						data: JSON.stringify(log.results)
					}))
				]
				break
			}
			default:
				return null
		}
	}

	return {
		dropdownItems,
		dropdownName,
		fetchDropdownItems
	}
}

const useHandleSelected = (navStore, projectStore) => {
	const handleSelected = (item: any) => {
		try {
			switch (navStore.activePage) {
				case 'Overview': {
					const filterList = JSON.parse(item.data) as FilterList
					projectStore.updateRegistryStack(filterList.name, filterList.callStack)
					break
				} 
				case 'Mapping': {
					const mapping = JSON.parse(item) as Mapping
					updateMapping(mapping)
					break
				}
				case 'Results':
				case 'Benchmark':
					//projectStore.updateResultState(item)
					break
				default:
					throw new Error(`Unsupported active page: ${navStore.activePage}`)
			}
		} catch (error) {
			console.error(error)
		}
	}

	return {
		handleSelected
	}
}

export default defineComponent({
	name: 'GroupList',
	components: {
		PencilSquareIcon,
		PlusCircleIcon,
		Draggable,
		GroupCard,
		Dropdown
	},
	setup() {
		const projectStore = useProjectStore()
		const navStore = useNavigationStore()
		const speckleStore = useSpeckleStore()
		const firebaseStore = useFirebaseStore()

		const currSlideName = computed(() => {
			if (navStore.activePage === 'Overview') return 'Edit filters'
			else if (navStore.activePage === 'Mapping') return 'Edit materials'
			else if (navStore.activePage === 'Results') return 'Edit results'
			else if (navStore.activePage === 'Benchmark') return 'Edit results'
			else return null
		})

		const { dropdownItems, dropdownName, fetchDropdownItems } = useFetchDropdownItems(navStore, firebaseStore, speckleStore, projectStore)
		const { handleSelected } = useHandleSelected(navStore, projectStore)

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

		onMounted(() => {
			setStandardFilters()
			calculateGroups(true)
			refTree.value = projectStore.getGroupTree()?.children
			speckleStore.calculateGroupColors(refTree.value)
		})

		watch(
			() => navStore.activePage,
			() => {
				fetchDropdownItems()
			},
			{ immediate: true }
		)

		watch(
			() => filterRegistry.value?.filterCallStack,
			() => {
				calculateGroups(true)
				refTree.value = projectStore.getGroupTree()?.children
				speckleStore.calculateGroupColors(refTree.value)
				speckleStore.hideUnusedObjects(speckleStore.hiddenObjects.map(obj => obj.id))
			}
		)

		watch(
			projectGroups,
			() => {
				calculateGroups(false)
			},
			{ deep: true }
		)

		return {
			refTree,
			currSlideName,
			dropdownItems,
			dropdownName,
			handleSelected,
			toggleSlideover,
			addGroup,
			toggleColorMode
		}
	}
})
</script>
