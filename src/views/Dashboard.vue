<template>
	<div class="flex">
		<NavbarComponent />
		<!-- <Sidebar /> -->
		<!-- <Slideover /> -->
		<SpeckleStats
			:visible="statsVisible"
			:names="statNames"
			:vals="statValues"
		/>
		<Suspense>
			<SpeckleViewer
				:stream-id="streamId"
				:long-object-id="objectId"
				ref="viewerInstance"
			/>
		</Suspense>
	</div>
</template>

<script lang="ts">
	// import Sidebar from '@/components/Sidebar/Sidebar.vue'
	// import Slideover from '@/components/SlideOver/Sliderover.vue'
	import type { ViewerStats } from '@/models/speckle'
	import SpeckleStats from '@/components/ModelViewer/SpeckleStats.vue'
	import SpeckleViewer from '@/components/ModelViewer/SpeckleViewer.vue'
	import NavbarComponent from '@/components/Navbar.vue'

	/**
	 * Dashboard view.
	 * This component represents the main dashboard view of the application.
	 */
	export default {
		name: 'DashboardView',
		components: {
			NavbarComponent,
			SpeckleStats,
			SpeckleViewer
			// Sidebar,
			// Slideover,
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
			const streamId = props.speckleStreamId
				? props.speckleStreamId
				: 'ae6354b212' // Test stream.
			const objectId = props.longObjectId
				? props.longObjectId
				: 'e0eb73a3a6a64668c5caf2a819a7700b' // Test object.

			let statNames: Array<string>
			let statValues: Array<object>

			if (props.statsVisible) {
				// If props are not provided, use these defaults, otherwise deconstuct the given stats object.
				const stats = (props.stats as ViewerStats)
					? props.stats
					: { names: null, vals: null }

				statNames = stats.names ? stats.names : ['Elements', ' Stream']
				statValues = stats.vals ? stats.vals : [18, streamId]
			} else {
				statNames = []
				statValues = []
			}

			return {
				streamId,
				objectId,
				statNames,
				statValues
			}
		}
	}
</script>
