<template>
  <div id="app">
    <LoadScreen />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { logMessageToSentry } from './utils/monitoring'

import LoadScreen from '@/components/Misc/LoadScreen.vue'

const route = useRoute()

// Check for route redirects on mount
onMounted(() => {
  if (route.redirectedFrom) {
    const originalPath = route.redirectedFrom
    const redirectPath = route.path
    const query = route.query
    const params = route.params

    // Log the redirect route to Sentry as a warning message
    logMessageToSentry(
      `Route redirected from ${originalPath} to ${redirectPath} with query params ${JSON.stringify(
        query
      )} and params ${JSON.stringify(params)}`,
      'warning'
    )
  }
})
</script>
