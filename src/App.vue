<template>
	<div id="app">
		<!-- <pacman-loader/> -->
		<router-view />
	</div>
</template>

<script lang="ts">
	import { defineComponent } from 'vue'
	import { useRoute } from 'vue-router'
	import { logMessageToSentry } from './utils/monitoring'
	// import pacmanLoader from '@/components/Misc/PacmanLoader.vue'

	/**
	 * The main application component.
	 */
	export default defineComponent({
		name: 'SpeckLCA',
		components: {
			// pacmanLoader,
		},
		setup() {
			const route = useRoute()

			/**
			 * Checks if the route has been redirected from another route.
			 *
			 * @param {Object} route - The route object.
			 * @returns {boolean} - Returns true if the route has been redirected, otherwise false.
			 */
			if (route.redirectedFrom !== null) {
				const originalPath = route.redirectedFrom
				const redirectPath = route.path
				const query = route.query
				const params = route.params

				// Log the redirect route to Sentry as a warning message.
				logMessageToSentry(
					`Route redirected from ${originalPath} to ${redirectPath} with query params ${JSON.stringify(
						query
					)} and params ${JSON.stringify(params)}`,
					'warning'
				)
			}
			return {
				route
			}
		}
	})
</script>
