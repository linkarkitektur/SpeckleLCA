<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import './index.css'

export default defineComponent({
  name: 'SpeckLCA',
  components: {},
  setup() {
    const route = useRoute()

    return {
      route,
    }
  },
})
</script>
