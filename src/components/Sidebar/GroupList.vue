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
				class="absolute flex top-0 right-0 p-1 text-sm focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
				@click="toggleSlideover"
			>
				<p>{{ currSlideName }}</p>
				<PencilSquareIcon class="ml-2 h-5 w-5" />
			</button>
			<button
				v-if="activePage === 'Mapping'"
				aria-label="Expand"
				class="flex absolute top-0 left-[40%] p-1 text-sm focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
				@click="toggleAssemblyModal">
					<p>Edit Assemblies</p>
					<Square3Stack3DIcon class="ml-2 h-5 w-5" />
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
import { 
	PencilSquareIcon, 
	PlusCircleIcon, 
	Square3Stack3DIcon,
	StopIcon
 } from '@heroicons/vue/24/solid'

import GroupCard from '@/components/Sidebar/GroupCard.vue'
import Dropdown from '@/components/Misc/Dropdown.vue'

import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'

import { useSpeckleStore } from '@/stores/speckle'
import { useFirebaseStore } from '@/stores/firebase'
import { createStandardFilters } from '@/utils/filterUtils'
import { updateProjectGroups } from '@/utils/projectUtils'
import { updateMapping } from '@/utils/material'

import { FilterRegistry } from '@/models/filters'
import type { NestedGroup, FilterList } from '@/models/filters'
import type { dropdownItem } from '../Misc/Dropdown.vue'
import type { Mapping } from '@/models/material'
import type { ResultList } from '@/models/result'
import type {
  FilterLog,
	MappingLog,
	ResultsLog
} from '@/models/firebase'
import { useResultStore } from '@/stores/result'


const useFetchDropdownItems = (navStore, firebaseStore, speckleStore, projectStore) => {
	const dropdownItems = ref<dropdownItem[]>([])
	const dropdownName = ref('Fetch data')

	const fetchDropdownItems = async () => {
		switch (navStore.activePage) {
			case 'Overview': {				
				//Clear dropdownItems
				dropdownItems.value = []
				dropdownName.value = 'Fetch filters'
				//Fetch filters for project and generic filters
				const projectFilters = await firebaseStore.fetchLatestFilters(speckleStore.selectedProject.id)
				const genericFilter = await firebaseStore.fetchGenericFilters()

				if (!projectFilters && !genericFilter) {
					dropdownItems.value.push({
						name: 'No filters found',
						data: null
					})
					break
				}

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
				const projectMappings = await firebaseStore.fetchMappings(speckleStore.selectedProject.id)
				
				if (!projectMappings) {
					dropdownItems.value.push({
						name: 'No mappings found',
						data: null
					})
					break
				}

				dropdownItems.value = [
					...projectMappings.map((log: MappingLog) => ({ 
						name: log.name,
						data: JSON.stringify(log.mapping)
					}))
				]
				break
			}
			case 'Results':
			case 'Benchmark': {
				dropdownName.value = 'Fetch results'
				const projectResults = await firebaseStore.fetchResults(speckleStore.selectedProject.id)

				if (!projectResults) {
					dropdownItems.value = [{
						name: 'No results found',
						data: null
					}]
					break
				}
				
				dropdownItems.value = [
					...projectResults.map((log: ResultsLog) => ({ 
						name: log.name,
						data: JSON.stringify(log.resultList)
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

const useHandleSelected = (navStore, projectStore, resultStore) => {
	const handleSelected = (item: any) => {
		try {
			switch (navStore.activePage) {
				case 'Overview': {
					const filterList = JSON.parse(item.data) as FilterList
					projectStore.updateRegistryStack(filterList.name, filterList.callStack)
					break
				} 
				case 'Mapping': {
					const mapping = JSON.parse(item.data) as Mapping
					updateMapping(mapping)
					break
				}
				case 'Results': {
					const resultList = JSON.parse(item.data) as ResultList
					resultStore.setResultList(resultList)
					break
				}
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
		Square3Stack3DIcon,
		Draggable,
		GroupCard,
		Dropdown
	},
	setup() {
		const projectStore = useProjectStore()
		const navStore = useNavigationStore()
		const resultStore = useResultStore()
		const speckleStore = useSpeckleStore()
		const firebaseStore = useFirebaseStore()

		const currSlideName = computed(() => {
			if (navStore.activePage === 'Overview') return 'Edit filters'
			else if (navStore.activePage === 'Mapping') return 'Save mapping'
			else if (navStore.activePage === 'Results') return 'Save results'
			else if (navStore.activePage === 'Benchmark') return 'Edit results'
			else return null
		})

		const { dropdownItems, dropdownName, fetchDropdownItems } = useFetchDropdownItems(navStore, firebaseStore, speckleStore, projectStore)
		const { handleSelected } = useHandleSelected(navStore, projectStore, resultStore)

		const { filterRegistry, projectGroups } = storeToRefs(projectStore)
		const { activePage } = storeToRefs(navStore)
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

		const toggleAssemblyModal = () => {
			navStore.toggleAssemblyModal()
		}


		/**
		 * Set the standard filters for the project, this is mostly for testing
		 * should be a popup or something better later on
		 */
		 const setStandardFilters = () => {
			//Create new filterregistry, maybe store this in the projectStore?
			const registry = new FilterRegistry()
			projectStore.setFilterRegistry(registry)
			createStandardFilters()
		}

		onMounted(() => {
			setStandardFilters()
			updateProjectGroups(true)
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
				updateProjectGroups(true)
				refTree.value = projectStore.getGroupTree()?.children
				speckleStore.calculateGroupColors(refTree.value)
				speckleStore.hideUnusedObjects(speckleStore.hiddenObjects.map(obj => obj.id))
			}
		)

		watch(
			projectGroups,
			() => {
				updateProjectGroups(false)
			},
			{ deep: true }
		)

		return {
			refTree,
			currSlideName,
			dropdownItems,
			dropdownName,
			activePage,
			handleSelected,
			toggleSlideover,
			addGroup,
			toggleColorMode,
			toggleAssemblyModal
		}
	}
})
</script>
