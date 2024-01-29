<template>
  <!-- Table -->
  <table class="divide-y divide-gray-200 max-w-full block table-fixed">
    <thead class="w-full block">
      <tr class="w-full flex bg-gray-200 text-gray-700 text-left text-xs leading-4 font-medium uppercase tracking-wider whitespace-nowrap">
        <th class="m-3 w-2/6">
          Name
        </th>
        <th class="m-3 w-2/6">
          Material Type
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
      v-if="materials"
      :list="materials"
      :options="dragOptions"
      class="bg-gray-100 divide-y divide-gray-300 max-w-full block table-fixed hover:cursor-move"
      tag="tbody"
      item-key="id"
    >
      <template #item="{element, index}">
        <tr 
          class="text-xs whitespace-no-wrap w-full flex hover:bg-gray-200"
          :data-item="JSON.stringify(element)"
          @dragstart="dragStart($event, element)"
        >
          <td scope="row" class="m-2 w-2/6 line-clamp-3">{{ element.name }}</td>
          <td class="m-2 w-2/6">{{ element.subType}}</td>
          <td class="m-2 w-1/6">{{ element.declared_unit }}</td>
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
import type { EPD } from 'lcax'

export default defineComponent({
  name: 'MaterialTable',
  components: {
    Draggable,
  },
  setup() {
    const materialStore = useMaterialStore()
    
    materialStore.materialsFromJson()
    const materials = ref(materialStore.materials)

    const dragOptions = ref({
      animation: 200,
      group: 'materials',
      disabled: false,
      ghostClass: 'ghost',
      handle: '.handle',
    })

    const roundedEmissions = computed(() => {
      return materials.value.map(mat => {
        const value = parseFloat(String(mat.gwp?.a1a3 ?? '0'))
        if (!isNaN(value)) {
          const decimals = (value.toString().split('.')[1] || '').length
          return {
            value: decimals > 2 ? value.toFixed(2) : value.toString(),
            isPositive: value > 0
          }
        } else {
          return {
            value: '0',
            isPositive: false
          }
        }
      })
    })

    const dragStart = (event: DragEvent, material: EPD) => {
      materialStore.setCurrentMapping(material)
    }

    return {
      materials,
      dragOptions,
      roundedEmissions,
      dragStart,
    }
  },
})
</script>