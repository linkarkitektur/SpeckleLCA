<template>
	<Navbar />
	<ProjectGrid />
</template>

<script>
	import ProjectGrid from '@/components/ProjectSelection/ProjectGrid.vue'
	import Navbar from '@/components/Navbar.vue'

	import { getEPDList } from '@/utils/EPDUtils'

	/**
	 * The project selection view.
	 * This component represents the project selection view of the application.
	 */
	export default {
		name: 'ProjectSelectionView',
		components: {
			Navbar,
			ProjectGrid
		},
		setup() {
			getEPDList()
		}
	}
</script>
