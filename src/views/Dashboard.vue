<template>
  <NavbarComponent />
  <Sidebar />
  <Slideover />
</template>

<script lang="ts">
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import NavbarComponent from '@/components/Navbar.vue'
import Slideover from '@/components/ModelViewer/Sliderover.vue'
import '@/index.css'

/**
 * Dashboard view.
 * This component represents the main dashboard view of the application.
 */
export default {
  name: 'DashboardView',
  components: {
    NavbarComponent,
    Sidebar,
    Slideover,
  },
  setup() {},
}
</script>
