<template>
	<div class="flex">
		<NavbarComponent />
		<Sidebar />
		<SpeckleStats
			:visible="statsVisible"
			:names="statNames"
			:vals="statValues"
		/>
		<Suspense>
			<SpeckleViewer />
		</Suspense>
		<Slideover />
	</div>
</template>

<script lang="ts">
	import Sidebar from '@/components/Sidebar/Sidebar.vue'
	import Slideover from '@/components/SlideOver/Sliderover.vue'
	import type { ViewerStats } from '@/models/speckle'
	import SpeckleStats from '@/components/ModelViewer/SpeckleStats.vue'
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
			SpeckleStats,
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
		setup(props) {
			const materialStore = useMaterialStore()
			//Load materials from the store on startup
    	materialStore.materialsFromJson()
			let statNames: Array<string>
			let statValues: Array<object>

			if (props.statsVisible) {
				// If props are not provided, use these defaults, otherwise deconstuct the given stats object.
				const stats = (props.stats as ViewerStats)
					? props.stats
					: { names: null, vals: null }

				statNames = stats.names ? stats.names : ['Elements', ' Stream']
				statValues = stats.vals ? stats.vals : [18, ""]
			} else {
				statNames = []
				statValues = []
			}

			return {
				statNames,
				statValues
			}
		}
	}
</script>
