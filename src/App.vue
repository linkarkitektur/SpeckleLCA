<template>
  <div id="app">
    <LoadScreen />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import LoadScreen from '@/components/Misc/LoadScreen.vue'

const route = useRoute()

// Check for route redirects on mount
onMounted(() => {
  if (route.redirectedFrom) {
    const originalPath = route.redirectedFrom
    const redirectPath = route.path
    const query = route.query
    const params = route.params
  }
})
</script>
