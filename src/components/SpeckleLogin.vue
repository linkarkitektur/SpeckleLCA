<template>
  <v-container
    fill-height
    class="home flex-column justify-center align-center primary--text"
    v-if="!isAuthenticated"
  >
    <h1>Welcome to SpeckLCA</h1>
    <button class="outlined-button" @click="login">Please Login</button>
  </v-container>

  <v-container
    fill-height
    class="home flex-column justify-center align-center primary--text"
    v-else
  >
    <h1>Welcome to SpeckleLCA {{ speckleStore.user?.name }}</h1>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useSpeckleStore } from '@/stores/speckle'

export default defineComponent({
  name: 'LoginComponent',
  setup() {
    const speckleStore = useSpeckleStore()

    const isAuthenticated = computed(() => speckleStore.isAuthenticated)
    const login = () => {
      speckleStore.login()
    }

    return {
      isAuthenticated,
      login,
      speckleStore,
    }
  },
})
</script>
