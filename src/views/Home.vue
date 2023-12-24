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

export default {
    name: 'HomeView',
    components: {
        HeroComponent,
        FeaturesComponent,
        ContributeComponent,
        FooterComponent,
    },
    setup() {},
}
</script>
