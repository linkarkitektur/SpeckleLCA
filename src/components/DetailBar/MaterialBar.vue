<template>
  <div  
    class="text-center text-bold text-lg"
  >
    <label
      :class="`text-${mappedMaterial.color}0`"
    >
      {{ mappedMaterial.name }}
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { getMappedMaterial } from '@/utils/materialUtils'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'MaterialBar',
  components: {
  },
  setup() {
    const { selectedObjects } = storeToRefs(useProjectStore())
    
    // Get the material mapped to the group and color them accordingly
    const mappedMaterial = computed(() => {
      return getMappedMaterial(selectedObjects.value)
    })

    return {
      mappedMaterial,
    }
  },
})
</script>