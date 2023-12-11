<template>
    <Navbar />
    <Sidebar />
    <Slideover />
</template>


<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import Navbar from '@/components/Navbar.vue';
import Slideover from '@/components/ModelViewer/Sliderover.vue';
import '@/index.css';

export default defineComponent({
  name: "Dashboard",
  components: {
    Navbar,
    Sidebar,
    Slideover
  },
  setup() {
  },
});
</script>