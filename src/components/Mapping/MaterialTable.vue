<template>
  <BaseTable 
    :data="data"
    @dragStart="handleDragStart"
    @dragEnd="handleDragEnd"
  >
    <template #header-columns>
      <th class="m-3 w-1/10"><!-- Type ICON --></th>
      <th class="m-3 w-2/6">Name</th>
      <th class="m-3 w-2/6">Material type</th>
      <th class="m-3 w-1/6">Unit</th>
      <th class="m-3 w-1/6">Emission</th>
    </template>

    <template #row-columns="{ element, emissions }">
      <td class="m-2 w-1/10">
        <component 
          :is="isAssembly(element) ? 'Square3Stack3DIcon' : 'StopIcon'" 
          :class="['h-5 w-5', !isAssembly(element) ? 'transform rotate-45 text-green-800' : 'text-orange-600']"
          :title="isAssembly(element) ? 'Assembly' : 'Product'"
        />
      </td>
      <td class="m-2 w-2/6 line-clamp-3 text-sm">{{ element.name }}</td>
      <td v-if="element.metaData.materialType" class="m-2 w-2/6">
        {{ element.metaData.materialType }}
      </td>
      <td v-else class="m-2 w-2/6">Other</td>
      <td class="m-2 w-1/6">{{ element.unit }}</td>
      <td 
        :class="{'text-red-600': emissions.isPositive, 'text-green-600': !emissions.isPositive}"
        class="m-2 w-1/6"
      >
        {{ emissions.value }}
        <br>
        kg/CO<sub>2</sub>
      </td>
    </template>
  </BaseTable>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseTable from './BaseTable.vue'
import { Square3Stack3DIcon, StopIcon } from '@heroicons/vue/24/solid'
import { isAssembly } from '@/utils/EPDUtils'
import { useMaterialStore } from '@/stores/materialStore'
import type { Product, Assembly } from '@/models/materialModel'

export default defineComponent({
  name: 'MaterialTable',
  components: {
    BaseTable,
    Square3Stack3DIcon,
    StopIcon
  },
  props: {
    data: {
      type: Array as () => (Product | Assembly)[],
      required: true
    }
  },
  setup() {
    const materialStore = useMaterialStore()

    const handleDragStart = (material: Product) => {
      materialStore.setCurrentMapping(material)
    }

    const handleDragEnd = () => {
      materialStore.setCurrentMapping(null)
    }

    return {
      handleDragStart,
      handleDragEnd,
      isAssembly
    }
  }
})
</script>