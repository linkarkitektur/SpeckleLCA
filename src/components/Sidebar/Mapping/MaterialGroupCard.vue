<template>
  <p class="text-center">{{ mappedMaterial }}</p>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue'
import type { NestedGroup } from '@/models/filters'

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

    const mappedMaterial = computed(() => {
      const objects = inGroup.value.objects

      if (objects) {
        const materialNames = objects.map(obj => obj.material?.name)
        const uniqueMaterialNames = [...new Set(materialNames)]
        if (uniqueMaterialNames.length === 1) {
          if (uniqueMaterialNames[0] == undefined) {
            return "No material mapped"
          } else {
            return uniqueMaterialNames[0]
          }
        } else {
          return "Mixed"
        }
      } else {
        return "No material mapped"
      }
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
