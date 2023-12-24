<template>
  <Navbar />
  <ProjectGrid />
</template>

<script>
import ProjectGrid from '@/components/ProjectSelection/ProjectGrid.vue'
import Navbar from '@/components/Navbar.vue'

export default {
  name: 'ProjectSelectionView',
  components: {
    Navbar,
    ProjectGrid,
  },
  setup() {},
}
</script>
