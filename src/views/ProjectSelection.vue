<template>
	<!-- Modal area -->
	<SettingsModal />

	<!-- Main content area -->
	<Navbar />
	<ProjectGrid />
</template>

<script>
import ProjectGrid from '@/components/ProjectSelection/ProjectGrid.vue'
import Navbar from '@/components/Navbar.vue'
import SettingsModal from '@/components/Modals/SettingsModal.vue';

	/**
	 * The project selection view.
	 * This component represents the project selection view of the application.
	 */
	export default {
		name: 'ProjectSelectionView',
		components: {
			Navbar,
			ProjectGrid,
			SettingsModal
		},
		setup() {
		}
	}
</script>
