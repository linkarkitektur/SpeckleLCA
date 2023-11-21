<template>
    <Navbar />
    <ProjectGrid />
</template>

<script>
import ProjectGrid from '@/components/ProjectGrid.vue';
import Navbar from '@/components/Navbar.vue';

export default {
  name: 'ProjectSelection',
  components: {
    Navbar,
    ProjectGrid
},
  setup() {
  },
}
</script>