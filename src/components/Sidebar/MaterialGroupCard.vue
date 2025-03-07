<template>
  <div class="w-full flex flex-col items-center h-10 relative overflow-hidden">
    <!-- Progress bars container -->
    <div class="w-full h-full flex absolute top-0 overflow-hidden styled-element"> 
      <!-- Mapped items (green) -->
      <div 
        class="transition-all ease-out duration-1000 h-full bg-green-300 justify-center flex items-center opacity-80" 
        :style="{ width: percentMapped + '%' }"
      >
      </div>

      <!-- Divider -->
      <div 
        class="transition-all ease-out duration-1000 w-0.5 h-6 my-2 bg-white opacity-50"
      >
      </div>

      <!-- Unmapped items (red) -->
      <div 
        class="transition-all ease-out duration-1000 h-full bg-red-300 justify-center flex items-center opacity-80" 
        :style="{ width: (100 - percentMapped) + '%' }"
      >
      </div>
    </div>

    <!-- Text overlay -->
    <div class="absolute bottom-0 w-full z-10 styled-element styled-data">
      <div class="flex w-full items-center justify-between text-sm px-2 bg-neutral-100 bg-opacity-90">
        <div class="text-black">Mapped</div>
        <label class="text-center">
          {{ percentMapped }}%
        </label>
        <div class="text-black">Not mapped</div>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import type { NestedGroup } from '@/models/filters'

export default defineComponent({
  name: 'OverviewBar',
  components: {},
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
    
    // Check how many geometry objects has a material mapped to them
    const percentMapped = computed(() => {
			// Count the number of objects with and without a material
			const totalObjects = inGroup.value.objects.length
			const objectsWithMaterial = inGroup.value.objects.filter(obj => obj.material !== undefined && obj.material !== null)

			const percentageWithMaterial = (objectsWithMaterial.length / totalObjects) * 100
			return parseFloat(percentageWithMaterial.toFixed(1))
    })

    return {
      percentMapped,
    }
  },
})
</script>
