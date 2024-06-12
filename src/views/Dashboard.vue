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
	import Sidebar from '@/components/Sidebar/Sidebar.vue'
	import Slideover from '@/components/SlideOver/Sliderover.vue'
	import SpeckleViewer from '@/components/ModelViewer/SpeckleViewer.vue'
	import NavbarComponent from '@/components/Navbar.vue'
	import { useMaterialStore } from '@/stores/material'
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
    	materialStore.materialsFromJson()
			
			return {}
		}
	}
</script>
