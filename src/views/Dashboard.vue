<template>
    <Navbar />
    <Sidebar />
</template>


<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import Navbar from '@/components/Navbar.vue';
import '@/index.css';

export default defineComponent({
  name: "Dashboard",
  components: {
    Navbar,
    Sidebar
  },
  setup() {
  },
});
</script>