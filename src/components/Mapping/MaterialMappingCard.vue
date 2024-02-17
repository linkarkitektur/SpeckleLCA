<template>
  <div 
    tabindex="0"
    id="groupCard"
    class="rounded-2xl pb-2 p-2 focus:ring-1 focus:ring-gray-400 dropArea"
    @drop="onDrop"
    @dragover.prevent
  >
    <div class="flex flex-col justify-between items-center">
      <div class="flex items-center">
        <label 
          id="groupName"
          class="w-full text-center ml-2 text-gray-700 font-semibold font-sans truncate hover:underline hover:cursor-pointer"
          @dblclick="openSubGroup"
        >
          {{ inGroup.name? inGroup.name : "No name"}}
        </label>
      </div>
      <div 
        class="rounded-lg p-1 mt-1  text-neutral-700 items-center w-3/4 flex flex-col"
        :class="`bg-${mappedMaterial.color}`"
      >
        <label class="w-full text-center ml-2 text-gray-700 font-semibold font-sans truncate">
          {{ mappedMaterial.name }}
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useMaterialStore } from '@/stores/material'

import type { NestedGroup } from '@/models/filters'
import { useProjectStore } from '@/stores/main'
import { getMappedMaterial } from '@/utils/projectUtils'

export default defineComponent({
  name: 'MappingCard',
  components: {},
  props: {
    /**
     * Group to show in the card
     */
    group: {
      type: Object as () => NestedGroup,
      required: true,
    },
  },
  setup(props) {
    const materialStore = useMaterialStore()
    const projStore = useProjectStore()

    const inGroup = ref(props.group)

    // Get the material mapped to the group and color them accordingly
    const mappedMaterial = computed(() => {
      return getMappedMaterial(inGroup.value.objects)
    })

    // Couldnt get the drop event to transmit the data so we use the store instead
    const onDrop = () => {
      inGroup.value.objects.forEach(obj => {
        if (materialStore.currentMapping != null) {
          obj.material = materialStore.currentMapping
        }
      })
    }

    // Open sub group if there are any
    const openSubGroup = () => {
      if (inGroup.value.children.length > 0) {
        projStore.setSelectedGroup(inGroup.value)
      }
    }

    return {
      inGroup,
      mappedMaterial,
      onDrop,
      openSubGroup
    }
  },
})

</script>