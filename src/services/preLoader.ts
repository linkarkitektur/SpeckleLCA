import { useProjectStore } from '@/stores/projectStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useSettingsStore } from '@/stores/settingStore'

import { getAssemblyList } from '@/utils/materialUtils'
import { getRevaluCollections } from '@/models/revaluModel'
import { getEPDList } from '@/utils/EPDUtils'
import { createStandardFilters } from '@/utils/filterUtils'

import { APISource } from '@/models/materialModel'
import { FilterRegistry } from '@/models/filterModel'
import { useRoute } from 'vue-router'
import type { ProjectId } from '@/models/speckleModel'
import { useFirebaseStore } from '@/stores/firebaseStore'
import { useSpeckleStore } from '@/stores/speckleStore'
import { loadProject } from '@/utils/speckleUtils'

/**
 * Preload data needed for the dashboard view
 */
export async function preloadDashboardData() {
	const projectStore = useProjectStore()
	const firebaseStore = useFirebaseStore()
	const materialStore = useMaterialStore()
	const speckleStore = useSpeckleStore()
	const settingsStore = useSettingsStore()
	const route = useRoute()

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

	if (projectStore.currProject == null) {
		const projectId = route.params.projectId
		const modelId = route.params.modelId as string
		const projectData = await firebaseStore.fetchProjectInfo(
			projectId as string
		)
		projectStore.updateProjectInformation(projectData as ProjectId)
		await speckleStore.updateProjectVersions(projectId as string, 100, null)
		await loadProject(false, modelId)
	}

	try {
		setStandardFilters()

		if (settingsStore.materialSettings.APISource[APISource.LCAbyg])
			await materialStore.materialsFromJson()

		await getAssemblyList()

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
