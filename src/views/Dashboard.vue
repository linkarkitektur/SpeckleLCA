<template>
  <NavbarComponent />
  <!-- <Sidebar /> -->
  <SlideoveComponent />
  <SpeckleViewer />
</template>

<script lang="ts">
// import Sidebar from '@/components/Sidebar/Sidebar.vue'
import NavbarComponent from '@/components/Navbar.vue'
import SlideoveComponent from '@/components/ModelViewer/Sliderover.vue'
import SpeckleViewer from '@/components/ModelViewer/SpeckleViewer.vue'
import '@/index.css'

/**
 * Dashboard view.
 * This component represents the main dashboard view of the application.
 */
export default {
  name: 'DashboardView',
  components: {
    NavbarComponent,
    // Sidebar,
    SlideoveComponent,
    SpeckleViewer,
  },
  setup() {},
}
</script>
