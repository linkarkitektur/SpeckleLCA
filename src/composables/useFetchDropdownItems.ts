import { ref, computed } from 'vue'
import { useNavigationStore } from '@/stores/navigationStore'
import { useFirebaseStore } from '@/stores/firebaseStore'
import { useSpeckleStore } from '@/stores/speckleStore'

import type { MappingLog, ResultsLog, FilterLog } from '@/models/firebaseModel'
import type { dropdownItem } from '@/components/Base/Dropdown.vue'

export function useFetchDropdownItems() {
	const navStore = useNavigationStore()
	const firebaseStore = useFirebaseStore()
	const speckleStore = useSpeckleStore()

	const dropdownItems = ref<dropdownItem[]>([])
	const dropdownName = computed(() => {
		switch (navStore.activePage) {
			case 'Filtering':
				return 'Filter Groups'
			case 'Mapping':
				return 'Available Mappings'
			case 'Results':
				return 'Available Results'
			case 'Benchmark':
				return 'Available Benchmarks'
			default:
				return 'Select'
		}
	})

	const fetchDropdownItems = async () => {
		switch (navStore.activePage) {
			case 'Filtering': {
				//Clear dropdownItems
				dropdownItems.value = []
				//Fetch filters for project and generic filters
				const projectFilters = await firebaseStore.fetchLatestFilters(
					speckleStore.selectedProject.id
				)
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
							// Old naming convention
							// TODO: Clean up all saved filters and make them follow new naming conventions
							data: JSON.stringify(
								log.filterList || (log as any).filterCallStack
							)
						}))
					)
				}
				if (genericFilter) {
					dropdownItems.value.push(
						...genericFilter.map((log: FilterLog) => ({
							name: log.stackName,
							// Old naming convention
							data: JSON.stringify(
								log.filterList || (log as any).filterCallStack
							)
						}))
					)
				}
				break
			}
			case 'Mapping': {
				//Clear dropdownItems
				dropdownItems.value = []
				const projectMappings = await firebaseStore.fetchMappings(
					speckleStore.selectedProject.id
				)

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
				const projectResults = await firebaseStore.fetchResults(
					speckleStore.selectedProject.id
				)

				if (!projectResults) {
					dropdownItems.value = [
						{
							name: 'No results found',
							data: null
						}
					]
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
				dropdownItems.value = []
		}
	}

	return {
		dropdownItems,
		dropdownName,
		fetchDropdownItems
	}
}
