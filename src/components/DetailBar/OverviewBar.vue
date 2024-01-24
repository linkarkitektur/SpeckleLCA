<template>
  <label class="text-center">Selected: {{ amountSelected }} objects <br> Total of {{ groupArea }}m<sup>2</sup> </label> 
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useProjectStore } from '@/stores/main'

export default defineComponent({
  name: 'OverviewBar',
  components: {},
  setup() {
    const projectStore = useProjectStore()

    const amountSelected = computed(() => {
      if (projectStore.selectedGeometry == null) {
        return 0
      } else {
        return projectStore.selectedGeometry.length
      }
    })

    const groupArea = computed(() => {
      if (projectStore.selectedGeometry == null) {
        return 0
      } else {
        const area = projectStore.selectedGeometry.reduce((sum, obj) => sum + obj.quantity.M2, 0)
        return parseFloat(area.toFixed(2));
      }
    })

    return {
      amountSelected,
      projectStore,
      groupArea
    }
  },
})
</script>