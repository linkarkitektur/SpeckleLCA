<template>
	<SpeckleLogin />
</template>

<script lang="ts">
	import SpeckleLogin from '@/components/SpeckleLogin.vue'

	/**
	 * The login view.
	 * This component represents the login view of the application.
	 */
	export default {
		name: 'LoginView',
		components: {
			SpeckleLogin
		},
		setup() {}
	}
</script>
