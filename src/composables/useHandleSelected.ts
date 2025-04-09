import { useNavigationStore } from '@/stores/navigationStore'
import { useProjectStore } from '@/stores/projectStore'
import { useResultStore } from '@/stores/resultStore'

import { updateMapping } from '@/utils/materialUtils'

import type { FilterList } from '@/models/filterModel'
import type { Mapping } from '@/models/materialModel'
import type { ResultList } from '@/models/resultModel'
import { updateProjectGroups } from '@/utils/projectUtils'

export function useHandleSelected() {
  const navStore = useNavigationStore()
  const projectStore = useProjectStore()
  const resultStore = useResultStore()

  const handleSelected = (item: any) => {
    try {
      switch (navStore.activePage) {
        case 'Filtering': {
          const filterList = JSON.parse(item.data) as FilterList
          projectStore.updateRegistryStack(filterList.name, filterList.callStack)
          
          updateProjectGroups()
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

  return { handleSelected }
}