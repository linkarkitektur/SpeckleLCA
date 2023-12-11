<template>
  <Hero />
  <Features />
  <Contribute />
  <Footer />
</template>

<script lang="ts">
import Hero from '@/components/Landing/Hero.vue'
import Features from '@/components/Landing/Features.vue'
import Contribute from '@/components/Landing/Contribute.vue'
import Footer from '@/components/Landing/Footer.vue'

export default {
  name: 'Home',
  components: {
    Hero,
    Features,
    Contribute,
    Footer,
  },
  setup() {
  },
}
</script>