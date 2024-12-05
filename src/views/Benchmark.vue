<template>
	<!-- Modal area -->
	<SettingsModal />

  <!-- App area -->
  <div class="h-screen overflow-hidden scrollbar-hide">
    <NavbarComponent />
    <BenchmarkGrid />
    <div 
      class="relative w-full h-[calc(100vh-4rem)] overflow-auto bg-white p-4 shadow-md rounded-md"
      id="renderParent"
    >
      <Suspense>
        <SpeckleViewer />
      </Suspense>
    </div>
  </div>
</template>

<script lang="ts">
import { watch } from 'vue'
import NavbarComponent from '@/components/Navbar.vue'
import BenchmarkGrid from '@/components/Benchmark/BenchmarkGrid.vue'
import SpeckleViewer from '@/components/ModelViewer/SpeckleViewer.vue'

// Stores
import { useNavigationStore } from '@/stores/navigation'

// Modals
import SettingsModal from '@/components/Modals/SettingsModal.vue'

/**
 * Dashboard view.
 * This component represents the main dashboard view of the application.
 */
export default {
	name: 'DashboardView',
	components: {
		NavbarComponent,
    BenchmarkGrid,
		SettingsModal,
    SpeckleViewer
	},
	setup() {
		//Load materials from the store on startup
		const navStore = useNavigationStore()
		
		// Watch for changes in the active page and update viewer colors
		// TODO: Have this in the navStore instead?
		watch(() => navStore.activePage , (newVal) => {
			if(newVal === 'Benchmark') {
				console.log("Benchmark page - No graphics to update")
			}
		})

		return {}
	}
}
</script>
