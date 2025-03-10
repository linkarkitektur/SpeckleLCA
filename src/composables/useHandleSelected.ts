import { useNavigationStore } from '@/stores/navigation'
import { useProjectStore } from '@/stores/main'
import { useResultStore } from '@/stores/result'

import { updateMapping } from '@/utils/material'

import type { FilterList } from '@/models/filters'
import type { Mapping } from '@/models/material'
import type { ResultList } from '@/models/result'

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