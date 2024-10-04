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
	import { useMaterialStore } from '@/stores/material'
	import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'
	import { useSpeckleStore } from '@/stores/speckle'

	// Utils
	import { 
		updateProjectGroups,
		setMappingColorGroup,
		setResultsColorGroup,
	 } from '@/utils/projectUtils'

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
			const materialStore = useMaterialStore()
			const navStore = useNavigationStore()
			const projectStore = useProjectStore()
			const speckleStore = useSpeckleStore()
    	materialStore.materialsFromJson()
			
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
