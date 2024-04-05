<template>
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
		},
		props: {
			speckleStreamId: {
				type: String,
				required: false
			},
			longObjectId: {
				type: String,
				required: false
			},
			toolbarVisible: {
				type: Boolean,
				required: false,
				default: true
			},
			statsVisible: {
				type: Boolean,
				required: false,
				default: true
			},
			stats: {
				type: Object,
				required: false
			}
		},
		setup() {
			//Load materials from the store on startup
			const materialStore = useMaterialStore()
    	materialStore.materialsFromJson()

			return {}
		}
	}
</script>
