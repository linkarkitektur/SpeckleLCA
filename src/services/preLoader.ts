import { useProjectStore } from '@/stores/projectStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useSettingsStore } from '@/stores/settingStore'

import { getAssemblyList } from '@/utils/materialUtils'
import { getRevaluBaseList, getRevaluCollections } from '@/models/revaluModel'
import { getEPDList } from '@/utils/EPDUtils'
import { createStandardFilters } from '@/utils/filterUtils'

import { APISource } from '@/models/materialModel'
import { FilterRegistry } from '@/models/filterModel'

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
