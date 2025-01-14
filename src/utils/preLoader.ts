import { useProjectStore } from '@/stores/main'
import { useMaterialStore } from '@/stores/material'

import { getAssemblyList } from '@/utils/material'
import { getRevaluBaseList, getRevaluCollections } from '@/models/revaluDataSource'

/**
 * Preload data needed for the dashboard view
 */
export async function preloadDashboardData() {
  const projectStore = useProjectStore()
  const materialStore = useMaterialStore()

  try {
    await projectStore.getAvailableParameterList()

    materialStore.materialsFromJson()
		getAssemblyList()
		//getRevaluBaseList()
		getRevaluCollections()

    // Add more preload calls here if needed
    console.log('Dashboard data preloaded successfully.')
  } catch (error) {
    console.error('Error preloading dashboard data:', error)
  }
}
