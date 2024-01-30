<template>
  <div class="flex">
    <NavbarComponent />
    <!-- <Sidebar /> -->
    <!-- <Slideover /> -->
    <SpeckleToolbar :visible="true" />
    <SpeckleStats :visible="true" :names="statNames" :vals="statValues" />
    <SpeckleViewer />
  </div>
</template>

<script lang="ts">
// import Sidebar from '@/components/Sidebar/Sidebar.vue'
// import Slideover from '@/components/SlideOver/Sliderover.vue'
import SpeckleStats from '@/components/ModelViewer/SpeckleStats.vue'
import SpeckleToolbar from '@/components/ModelViewer/SpeckleToolbar.vue'
import SpeckleViewer from '@/components/ModelViewer/SpeckleViewer.vue'
import NavbarComponent from '@/components/Navbar.vue'

/**
 * Dashboard view.
 * This component represents the main dashboard view of the application.
 */
export default {
  name: 'DashboardView',
  components: {
    NavbarComponent,
    SpeckleStats,
    SpeckleToolbar,
    SpeckleViewer,
    // Sidebar,
    // Slideover,
  },
  setup() {
    const statNames = ['Objects', 'Comments']
    const statValues = [1, 2]

    return {
      statNames,
      statValues,
    }
  },
}
</script>
