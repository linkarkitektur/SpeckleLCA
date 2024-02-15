<template>
  <p 
    class="text-center"
    :class="mappedMaterial.color"
  >{{ mappedMaterial.name }}</p>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue'
import type { NestedGroup } from '@/models/filters'
import { getMappedMaterial } from '@/utils/projectUtils'

export default defineComponent({
  name: 'MaterialGroupCard',
  components: {
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
    const inGroup = ref(props.groups)

    // Get the material mapped to the group and color them accordingly
    const mappedMaterial = computed(() => {
      return getMappedMaterial(inGroup.value)
    })

    watch(
      () => props.groups,
      (newValue) => {
        inGroup.value = newValue
      }
    )

    return {
      mappedMaterial,
    }
  },
})
</script>