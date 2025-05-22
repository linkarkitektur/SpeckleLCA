import { useProjectStore } from '@/stores/projectStore'
import { useResultStore } from '@/stores/resultStore'

import { updateMapping } from '@/utils/materialUtils'

import type { FilterList } from '@/models/filterModel'
import type { Mapping } from '@/models/materialModel'
import type { ResultList } from '@/models/resultModel'
import { updateProjectGroups } from '@/utils/projectUtils'
import { useRoute } from 'vue-router'

export function useHandleSelected() {
	const projectStore = useProjectStore()
	const resultStore = useResultStore()
	const route = useRoute()

	const handleSelected = (item: any) => {
		try {
			switch (route.name) {
				case 'Filtering': {
					const filterList = JSON.parse(item.data) as FilterList
					projectStore.updateRegistryStack(
						filterList.name,
						filterList.callStack,
						filterList.customGeo
					)

					updateProjectGroups()
					break
				}
				case 'Mapping': {
					const mapping = JSON.parse(item.data) as Mapping
					console.log(item.name, mapping)
					updateMapping(item.name, mapping)
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
					throw new Error(`Unsupported active page: ${route.name.toString}`)
			}
		} catch (error) {
			console.error(error)
		}
	}

	return { handleSelected }
}
