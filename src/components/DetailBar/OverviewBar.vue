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
      if (projectStore.selectedGroup == null) {
        return 0
      } else {
        return projectStore.selectedGroup.objects.length
      }
    })

    const groupArea = computed(() => {
      if (projectStore.selectedGroup == null) {
        return 0
      } else {
        const area = projectStore.selectedGroup.objects.reduce((sum, obj) => sum + obj.quantity.M2, 0)
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