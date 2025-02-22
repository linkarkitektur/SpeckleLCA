<template>
	<!-- Modal area -->
	<NewGroupModal />
  <MaterialMappingModal />
	<SaveFilterModal />
	<AssemblyModal />
	<SettingsModal />

  <!-- App area -->
	<div class="flex">
		<NavbarComponent />
		<Sidebar />
		<div 
			class="relative inset-y-16 w-full h-[calc(100vh-4rem)] bg-gray-100 overflow-auto" 
			id="renderParent"
		>
			<Suspense>
				<SpeckleViewer />

				<template #fallback>
					Loading...
				</template>
			</Suspense>
		</div>
		<Slideover />
	</div>
</template>

<script lang="ts">
import { watch } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import Slideover from '@/components/SlideOver/Sliderover.vue'
import SpeckleViewer from '@/components/ModelViewer/SpeckleViewer.vue'
import NavbarComponent from '@/components/Navbar.vue'
import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'
import { useSpeckleStore } from '@/stores/speckle'

// Utils
import { 
	updateProjectGroups,
	setMappingColorGroup,
	setResultsColorGroup,
} from '@/utils/projectUtils'
import { EmissionCalculator } from '@/utils/emissionUtils'
import { ResultCalculator } from '@/utils/resultUtils'
import { preloadDashboardData } from '@/utils/preLoader'

// Modals
import NewGroupModal from '@/components/Sidebar/NewGroupModal.vue'
import MaterialMappingModal from '@/components/Mapping/MaterialMappingModal.vue'
import SaveFilterModal from '@/components/Modals/SaveFilterModal.vue'
import AssemblyModal from '@/components/Modals/AssemblyModal.vue'
import SettingsModal from '@/components/Modals/SettingsModal.vue'


/**
 * Dashboard view.
 * This component represents the main dashboard view of the application.
 */
export default {
	name: 'DashboardView',
	components: {
		NavbarComponent,
		SpeckleViewer,
		Sidebar,
		Slideover,
		NewGroupModal,
		MaterialMappingModal,
		SaveFilterModal, 
		AssemblyModal,
		SettingsModal,
	},
	setup() {
		//Load materials from the store on startup
		const navStore = useNavigationStore()
		const projectStore = useProjectStore()
		const speckleStore = useSpeckleStore()

		// Preload all needed resources
		preloadDashboardData()

		// Watch for changes in the active page and update viewer colors
		// TODO: Have this in the navStore instead?
		watch(() => navStore.activePage , (newVal) => {
			if(newVal === 'Overview') {
				updateProjectGroups(true)
				const tree =	projectStore.getGroupTree()?.children
				speckleStore.calculateGroupColors(tree)
			} else if(newVal === 'Mapping') {
				const mappingColors = setMappingColorGroup()
				speckleStore.setColorGroups(mappingColors)
			} else if(newVal === 'Results') {
				// Trigger calc for project
				const calculator = new EmissionCalculator()
				calculator.calculateEmissions()

				const resCalc = new ResultCalculator()
				resCalc.aggregate()
				
				const resultsColors = setResultsColorGroup()
				speckleStore.setColorGroups(resultsColors)
			} else if(newVal === 'Benchmark') {
				console.log("Benchmark page - No graphics to update")
			}
		})

		return {}
	}
}
</script>
