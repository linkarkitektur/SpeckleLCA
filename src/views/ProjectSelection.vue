<template>
  <Navbar />
  <ProjectGrid />
</template>

<script>
import ProjectGrid from '@/components/ProjectSelection/ProjectGrid.vue'
import Navbar from '@/components/Navbar.vue'

/**
 * The project selection view.
 * This component represents the project selection view of the application.
 */
export default {
  name: 'ProjectSelectionView',
  components: {
    Navbar,
    ProjectGrid,
  },
  setup() {},
}
</script>
