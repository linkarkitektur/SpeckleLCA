<!-- eslint-disable vue/multi-word-component-names -->
<template>
	<!-- Modal area -->
	<SettingsModal />

  <!-- App area -->
  <div class="h-screen overflow-hidden scrollbar-hide">
    <Navbar />
    <BenchmarkGrid />
    <div 
      class="relative w-full h-[55vh] overflow-auto bg-white p-4 shadow-md rounded-md"
      id="renderParent"
    >
      <Suspense>
        <SpeckleViewer :Detailbar="false"/>
      </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import Navbar from '@/components/Base/Navbar.vue'
import BenchmarkGrid from '@/components/Benchmark/BenchmarkGrid.vue'
import SpeckleViewer from '@/components/ModelViewer/SpeckleViewer.vue'

// Stores
import { useNavigationStore } from '@/stores/navigationStore'

// Modals
import SettingsModal from '@/components/Modals/SettingsModal.vue'

/**
 * Dashboard view.
 * This component represents the main dashboard view of the application.
 */
const navStore = useNavigationStore()

// Watch for changes in the active page and update viewer colors
// TODO: Have this in the navStore instead?
watch(() => navStore.activePage , (newVal) => {
	if(newVal === 'Benchmark') {
		console.log("Benchmark page - No graphics to update")
	}
})
</script>
