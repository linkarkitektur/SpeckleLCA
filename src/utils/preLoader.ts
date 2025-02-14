import { useProjectStore } from '@/stores/main'
import { useMaterialStore } from '@/stores/material'
import { useSettingsStore } from '@/stores/settings'

import { getAssemblyList } from '@/utils/material'
import { getRevaluBaseList, getRevaluCollections } from '@/models/revaluDataSource'
import { getEPDList } from './EPDUtils'

import { APISource } from '@/models/material'

/**
 * Preload data needed for the dashboard view
 */
export async function preloadDashboardData() {
  const projectStore = useProjectStore()
  const materialStore = useMaterialStore()
  const settingsStore = useSettingsStore()

  try {
    await projectStore.getAvailableParameterList()

    if(settingsStore.materialSettings.APISource[APISource.LCAbyg])
      await materialStore.materialsFromJson()
		
    getAssemblyList()

    if (settingsStore.materialSettings.APISource[APISource.Revalu])
      await getRevaluCollections()

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
