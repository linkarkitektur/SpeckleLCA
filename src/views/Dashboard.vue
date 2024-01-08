<template>
  <div class="">
    <NavbarComponent @submit="updateRoute" />
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script lang="ts">
// import Sidebar from '@/components/Sidebar/Sidebar.vue'
import NavbarComponent from '@/components/Navbar.vue'
import '@/index.css'
import router from '@/router'
import { logMessageToSentry } from '@/utils/monitoring'
import { useRoute } from 'vue-router'

/**
 * Dashboard view.
 * This component represents the main dashboard view of the application.
 */
export default {
  name: 'DashboardView',
  components: {
    NavbarComponent,
    // Sidebar,
  },
  setup() {
    const route = useRoute()
    const pathHistory = false

    function updateRoute(target: string) {
      console.log('Route changed:', target)
      router.push(target)
    }

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
      updateRoute,
    }
  },
}
</script>
