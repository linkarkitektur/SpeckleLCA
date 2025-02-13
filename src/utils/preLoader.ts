import { useProjectStore } from '@/stores/main'
import { useMaterialStore } from '@/stores/material'

import { getAssemblyList } from '@/utils/material'
import { getRevaluBaseList, getRevaluCollections } from '@/models/revaluDataSource'
import { getEPDList } from './EPDUtils'

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

    // Get list of products
    const productList = await getEPDList()
    for (const product of productList) {
      materialStore.addMaterial(product)
    }

    // Add more preload calls here if needed
    console.log('Dashboard data preloaded successfully.')
  } catch (error) {
    console.error('Error preloading dashboard data:', error)
  }
}
