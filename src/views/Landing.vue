<template>
  <HeroComponent />
  <FeaturesComponent />
  <ContributeComponent />
  <FooterComponent />
</template>

<script lang="ts">
import ContributeComponent from '@/components/Landing/Contribute.vue'
import FeaturesComponent from '@/components/Landing/Features.vue'
import FooterComponent from '@/components/Landing/Footer.vue'
import HeroComponent from '@/components/Landing/Hero.vue'

/**
 * The landing view.
 * This component represents the landing page of the application.
 */
export default {
  name: 'LandingView',
  components: {
    ContributeComponent,
    FeaturesComponent,
    FooterComponent,
    HeroComponent,
  },
  setup() {},
}
</script>
