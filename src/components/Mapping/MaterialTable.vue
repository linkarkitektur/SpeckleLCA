<template>
  <!-- Table -->
  <table class="divide-y divide-gray-200 max-w-full block table-fixed">
    <thead class="w-full block">
      <tr class="w-full flex bg-gray-200 text-gray-700 text-left text-xs leading-4 font-medium uppercase tracking-wider whitespace-nowrap">
        <th class="m-3 w-2/6">
          Name
        </th>
        <th class="m-3 w-2/6">
          Material type
        </th>
        <th class="m-3 w-1/6">
          Unit
        </th>
        <th class="m-3 w-1/6">
          Emission
        </th>
      </tr>
    </thead>
    <Draggable
      v-if="EPDList"
      :list="EPDList"
      :options="dragOptions"
      class="bg-gray-100 divide-y divide-gray-300 max-w-full block table-fixed hover:cursor-move"
      tag="tbody"
      item-key="id"
      :group ="{ name: 'materials', pull: 'clone', put: false }"
      :clone="cloneItem"
    >
      <template #item="{element, index}">
        <tr 
          class="text-xs whitespace-no-wrap w-full flex hover:bg-gray-200"
          :data-item="JSON.stringify(element)"
          @dragstart="dragStart($event, element)"
        >
          <td scope="row" class="m-2 w-2/6 line-clamp-3">{{ element.name }}</td>
          <td v-if=element.metaData.materialType class="m-2 w-2/6">{{ element.metaData.materialType }}</td>
          <td v-else class="m-2 w-2/6">Other</td>
          <td class="m-2 w-1/6">{{ element.unit }}</td>
          <td 
            :class="{'text-red-600' : roundedEmissions[index].isPositive, 'text-green-600' : !roundedEmissions[index].isPositive}"
            class="m-2 w-1/6"
          >
              {{ roundedEmissions[index].value }} 
            <br>
              kg/CO<sub>2</sub>
          </td>
        </tr>
      </template>
    </Draggable>
  </table>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import Draggable from 'vuedraggable'
import { useMaterialStore } from '@/stores/material'
import type { Product, Assembly } from '@/models/material'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'MaterialTable',
  components: {
    Draggable,
  },
  setup() {
    const materialStore = useMaterialStore()
    
    const { EPDList } = storeToRefs(materialStore)

    const dragOptions = ref({
      animation: 200,
      group: 'materials',
      disabled: false,
      ghostClass: 'ghost',
      handle: '.handle',
    })

    // Compute rounded emissions for Products and Assemblies
    const roundedEmissions = computed(() => {
      if (!EPDList.value) return [];

      return EPDList.value.map((product: Product) => {
        const value = product.emission?.gwp?.a1a3.amount ?? 0;
        const roundedValue = !isNaN(value) ? parseFloat(value.toFixed(2)) : 0;
        
        return {
          value: roundedValue,
          isPositive: roundedValue > 0,
        }
      })
    })

    const dragStart = (event: DragEvent, material: Product) => {
      materialStore.setCurrentMapping(material)
    }

    const cloneItem = (item: Product) => {
      return { ...item }
    }

    return {
      EPDList,
      dragOptions,
      roundedEmissions,
      dragStart,
      cloneItem
    }
  },
})
</script>