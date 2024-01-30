<template>
  <div class="p-4">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search..."
      class="w-full border p-2 rounded-md"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useMaterialStore } from '@/stores/material'

export default defineComponent({
  name: 'MaterialSearch',
  components: {},
  setup() {
    const materialStore = useMaterialStore()
    const searchQuery = ref('')
    
    watch(searchQuery, (newVal) => {
      if (newVal != null) {
        console.log('searching')
        if (materialStore.filteredList != undefined && materialStore.filteredList.length > 0) {
          materialStore.setFilteredMaterials(materialStore.materials.filter(
            (material) => {
              return material.name
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase())
            }
          ))
        }
        else {
          materialStore.filteredList = materialStore.materials
        }
      }
    })

    return {
      searchQuery,
    }
  },
})

</script>