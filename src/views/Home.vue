<template>
  <Hero />
  <Features />
  <Contribute />
  <Footer />
</template>

<script lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSpeckleStore } from '@/stores/speckle'
import Hero from '@/components/Landing/Hero.vue'
import Features from '@/components/Landing/Features.vue'
import Contribute from '@/components/Landing/Contribute.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'Home',
  components: {
    Hero,
    Features,
    Contribute,
    Footer,
  },
  setup() {
    const speckleStore = useSpeckleStore();

    const user = computed(() => speckleStore.user);

    return {
      user,
    };
  },
}
</script>