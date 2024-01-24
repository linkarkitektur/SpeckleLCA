<template>
  <div class="flex h-screen">
    <NavbarComponent />
    <Sidebar />
    <Slideover />
    <SpeckleViewer />
  </div>

</template>

<script lang="ts">
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import NavbarComponent from '@/components/Navbar.vue'
import Slideover from '@/components/SlideOver/Sliderover.vue'
import SpeckleViewer from '@/components/ModelViewer/SpeckleViewer.vue'

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
    SpeckleViewer
},
  setup() {},
}
</script>
