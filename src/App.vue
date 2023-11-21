<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Footer from '@/components/Footer.vue';
import './index.css'

export default defineComponent({
  name: "App",
  components: {
    Footer,
  },
  setup() {
    const route = useRoute();

    return {
      route,
    };
  },
});
</script>