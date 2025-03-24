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
import { useMaterialStore } from '@/stores/materialStore'

import type { NestedGroup } from '@/models/filterModel'
import { useProjectStore } from '@/stores/projectStore'
import { useSpeckleStore } from '@/stores/speckleStore'
import { getMappedMaterial } from '@/utils/materialUtils'
import { mapMaterial } from '@/utils/materialUtils'

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
    const speckleStore = useSpeckleStore()

    const inGroup = ref(props.group)

    // Get the material mapped to the group and color them accordingly
    const mappedMaterial = computed(() => {
      return getMappedMaterial(inGroup.value.objects)
    })

    // Couldnt get the drop event to transmit the data so we use the store instead
    // This is where we update the material of the objects
    const onDrop = () => {
      if (inGroup.value != null)
        mapMaterial(inGroup.value)
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