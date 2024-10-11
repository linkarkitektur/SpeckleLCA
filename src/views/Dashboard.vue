<template>
	<!-- Add all modals here -->
	<NewGroupModal />
  <MaterialMappingModal />
	<SaveFilterModal />
  <!-- End of modal area -->
	<div class="flex">
		<NavbarComponent />
		<Sidebar />
		<Suspense>
			<SpeckleViewer />
		</Suspense>
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
import { useMaterialStore } from '@/stores/material'

// Utils
import { 
	updateProjectGroups,
	setMappingColorGroup,
	setResultsColorGroup,
} from '@/utils/projectUtils'
import { EmissionCalculator } from '@/utils/emissionUtils'
import { EmissionAggregator } from '@/utils/resultUtils'
import { getRevaluBaseList } from '@/models/revaluDataSource'

// Modals
import NewGroupModal from '@/components/Sidebar/NewGroupModal.vue'
import MaterialMappingModal from '@/components/Mapping/MaterialMappingModal.vue'
import SaveFilterModal from '@/components/Modals/SaveFilterModal.vue'


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
	},
	setup() {
		//Load materials from the store on startup
		const navStore = useNavigationStore()
		const projectStore = useProjectStore()
		const speckleStore = useSpeckleStore()
		const materialStore = useMaterialStore()
		
		materialStore.materialsFromJson()
		//getRevaluBaseList()
		
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

				const aggregator = new EmissionAggregator()
				aggregator.aggregate()
				
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
