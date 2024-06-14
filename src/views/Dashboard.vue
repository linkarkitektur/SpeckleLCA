<template>
	<!-- Add all modals here -->
	<NewGroupModal />
  <MaterialMappingModal />
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
	import { useNavigationStore, useProjectStore } from '@/stores/main'
	import { useSpeckleStore } from '@/stores/speckle'

	// Utils
	import { 
		calculateGroups,
		setMappingColorGroup,
	 } from '@/utils/projectUtils'

	// Modals
	import NewGroupModal from '@/components/Sidebar/NewGroupModal.vue'
	import MaterialMappingModal from '@/components/Mapping/MaterialMappingModal.vue'

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
		},
		setup() {
			//Load materials from the store on startup
			const materialStore = useMaterialStore()
			const navStore = useNavigationStore()
			const projectStore = useProjectStore()
			const speckleStore = useSpeckleStore()
    	materialStore.materialsFromJson()
			
			watch(() => navStore.activePage , (newVal) => {
				if(newVal === 'Overview') {
					calculateGroups(true)
					const tree =	projectStore.getGroupTree()?.children
					speckleStore.calculateGroupColors(tree)
				} else if(newVal === 'Mapping') {
					const mappingColors = setMappingColorGroup()
					speckleStore.setColorGroups(mappingColors)
				} else if(newVal === 'Results') {
					console.log("Results page")
				} else if(newVal === 'Benchmark') {
					console.log("Benchmark page")
				}
			})

			return {}
		}
	}
</script>
