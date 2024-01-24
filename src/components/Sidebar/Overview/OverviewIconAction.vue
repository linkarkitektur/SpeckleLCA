<template>
  <button
    aria-label="Expand"
    class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
    @click="toggleEditName"
  >
    <PencilSquareIcon class="h-5 w-5" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { PencilSquareIcon } from '@heroicons/vue/24/solid'
import { useNavigationStore } from '@/stores/main'

import type { NestedGroup } from '@/models/filters'

export default defineComponent({
  name: 'EditIconAction',
  components: {
    PencilSquareIcon,
  },
  props: {
    /**
     * Array of groups to show in the card, they should all share a top level to show
     */
    groups: {
      type: Object as () => NestedGroup,
      required: true,
    },
  },
  setup(props) {
    const navStore = useNavigationStore()

    const toggleEditName = () => {
      navStore.toggleEditName(props.groups.id)
    }

    return {
      toggleEditName
    }
  },
})
</script>