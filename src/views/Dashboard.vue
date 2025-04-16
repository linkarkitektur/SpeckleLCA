<!-- eslint-disable vue/multi-word-component-names -->
<template>
	<!-- Modal area -->
	<SettingsModal />
	<StandardBackground />

  <!-- App area -->
	<div class="flex">
		<Navbar />
		<Sidebar />
		<div 
			class="absolute inset-y-16 w-full h-[calc(100vh-4rem)] overflow-auto" 
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
		<div v-if="navStore.detailBarShow" id="Detailbar">
      <DetailBar />
    </div>
	</div>
</template>

<script setup lang="ts">
import { watch, onMounted, nextTick } from 'vue'

import Sidebar from '@/components/Sidebar/Sidebar.vue'
import Slideover from '@/components/SlideOver/Sliderover.vue'
import SpeckleViewer from '@/components/ModelViewer/SpeckleViewer.vue'
import Navbar from '@/components/Base/Navbar.vue'
import DetailBar from '@/components/DetailBar/DetailBar.vue'
import StandardBackground from '@/components/Misc/StandardBackground.vue'

import { useProjectStore } from '@/stores/projectStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { useSpeckleStore } from '@/stores/speckleStore'

// Utils
import { 
	updateProjectGroups,
	setMappingColorGroup,
	setResultsColorGroup,
} from '@/utils/projectUtils'
import { EmissionCalculator } from '@/utils/emissionUtils'
import { ResultCalculator } from '@/utils/resultUtils'
import { preloadDashboardData } from '@/services/preLoader'

// Modals
import SettingsModal from '@/components/Modals/SettingsModal.vue'


/**
 * Dashboard view.
 * This component represents the main dashboard view of the application.
 */
const navStore = useNavigationStore()
const projectStore = useProjectStore()
const speckleStore = useSpeckleStore()

// Preload all needed resources
preloadDashboardData()

onMounted(async () => {
  // Wait for DOM updates and Suspense to resolve if needed
  await nextTick()
  // When all elements have loaded, explicitly set loading to false
  navStore.loading = false
})

// Watch for changes in the active page and update viewer colors
watch(() => navStore.activePage , (newVal) => {
	if(newVal === 'Filtering') {
		updateProjectGroups()
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
</script>
