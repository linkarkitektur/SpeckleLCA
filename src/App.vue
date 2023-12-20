<template>
  <div id="app">
    <pacman-loader/>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import pacmanLoader from '@/components/pacmanLoader.vue';
import './index.css'

export default defineComponent({
  name: "App",
  components: {
    pacmanLoader
  },
  setup() {
    const route = useRoute();

    return {
      route,
    };
  },
});
</script>