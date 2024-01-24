<template>
  <button
    id="cardAction"
    aria-label="Expand"
    class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
    @click="toggleMappingModal"
  >
    <MapIcon id="cardAction" class="h-5 w-5" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { MapIcon } from '@heroicons/vue/24/solid'
import { useNavigationStore } from '@/stores/main'

export default defineComponent({
  name: 'MaterialIconAction',
  components: {
    MapIcon,
  },
  setup() {
    const navStore = useNavigationStore()

    const toggleMappingModal = () => {
      navStore.toggleMappingModal()
    }

    return {
      toggleMappingModal
    }
  },
})
</script>