<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import { logMessageToSentry } from './utils/monitoring'

/**
 * The main application component.
 */
export default defineComponent({
  name: 'SpeckleLCA',
  components: {},
  setup() {
    const route = useRoute()
    const pathHistory = false

    if (route.redirectedFrom !== null && pathHistory) {
      const originalPath = route.redirectedFrom
      const redirectPath = route.path
      const query = route.query
      const params = route.params

      // Log the redirect route to Sentry as a warning message.
      logMessageToSentry(
        `Route redirected from ${originalPath} to ${redirectPath} with query params ${JSON.stringify(
          query
        )} and params ${JSON.stringify(params)}`,
        'warning'
      )
    }
    return {
      route,
    }
  },
})
</script>
