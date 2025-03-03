import { useProjectStore } from '@/stores/main'
import { useMaterialStore } from '@/stores/material'
import { useSettingsStore } from '@/stores/settings'

import { getAssemblyList } from '@/utils/material'
import { getRevaluBaseList, getRevaluCollections } from '@/models/revaluDataSource'
import { getEPDList } from './EPDUtils'
import { createStandardFilters } from './filterUtils'

import { APISource } from '@/models/material'
import { FilterRegistry } from '@/models/filters'

/**
 * Preload data needed for the dashboard view
 */
export async function preloadDashboardData() {
  const projectStore = useProjectStore()
  const materialStore = useMaterialStore()
  const settingsStore = useSettingsStore()


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


  try {
    await projectStore.getAvailableParameterList()
    await setStandardFilters()

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
