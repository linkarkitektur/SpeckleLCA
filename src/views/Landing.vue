<template>
	<HeroComponent />
	<FeaturesComponent />
	<ContributeComponent />
	<FooterComponent />
</template>

<script lang="ts">
	import HeroComponent from '@/components/Landing/Hero.vue'
	import FeaturesComponent from '@/components/Landing/Features.vue'
	import ContributeComponent from '@/components/Landing/Contribute.vue'
	import FooterComponent from '@/components/Landing/Footer.vue'

	/**
	 * The landing view.
	 * This component represents the landing page of the application.
	 */
	export default {
		name: 'LandingView',
		components: {
			HeroComponent,
			FeaturesComponent,
			ContributeComponent,
			FooterComponent
		},
		setup() {}
	}
</script>
