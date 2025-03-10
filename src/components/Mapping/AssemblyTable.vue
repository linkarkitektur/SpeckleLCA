<template>
  <BaseTable 
    :data="data"
    @dragStart="handleDragStart"
    @doubleClick="loadAssembly"
  >
    <template #header-columns>
      <th class="m-3 w-2/6">Name</th>
      <th class="m-3 w-2/6">Category</th>
      <th class="m-3 w-1/6">Material</th>
      <th class="m-3 w-1/6">Emission</th>
    </template>

    <template #row-columns="{ element, emissions }">
      <td scope="row" class="m-2 w-2/6 line-clamp-3">{{ element.name }}</td>
      <td class="m-2 w-2/6">{{ element.category }}</td>
      <td v-if="element.metaData.materialType" class="m-2 w-1/6">{{ element.metaData.materialType }}</td>
      <td v-else class="m-2 w-1/6">Other</td>
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

<script setup lang="ts">
import BaseTable from './BaseTable.vue'
import { useMaterialStore } from '@/stores/material'
import type { Assembly } from '@/models/material'

// Define props
defineProps<{
  data: Assembly[]
}>()

const materialStore = useMaterialStore()

const handleDragStart = (assembly: Assembly) => {
  materialStore.setCurrentAssembly(assembly)
}

const loadAssembly = (assembly: Assembly) => {
  materialStore.setCurrentAssembly(assembly)
}
</script>