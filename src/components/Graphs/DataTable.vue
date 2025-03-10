<template>
  <!-- Table -->
  <table class="divide-y divide-gray-200 max-w-full block table-fixed">
    <thead class="w-full block">
      <tr class="w-full flex bg-gray-200 text-gray-700 text-left text-xs leading-4 font-medium uppercase tracking-wider whitespace-nowrap">
        <th class="m-3 w-3/6">
          {{ resultItem.displayName }}
        </th>
        <th class="m-3 w-1/6">
          Amount
        </th>
        <th class="m-3 w-2/6">
          Emission
        </th>
      </tr>
    </thead>
    <tr 
      v-for="(groupedResult) in resultItem.data"
      :key="groupedResult.parameter"
      class="text-xs whitespace-no-wrap w-full flex hover:bg-gray-200"
      :class="{ 'bg-green-100': isHighlighted(groupedResult) }"
      @click="onRowClicked(groupedResult)"
    >
      <td scope="row" class="m-2 w-3/6 line-clamp-3">
        {{ groupedResult.parameter }}
      </td>
      <td class="m-2 w-1/6">
        {{ getAmountWithUnit(groupedResult) }}
      </td>
      <td 
        :class="{ 'text-red-600': getRoundedEmissions(groupedResult) >= 100, 'text-green-600': getRoundedEmissions(groupedResult) < 100 }"
        class="m-2 w-2/6"
      >
        {{ getRoundedEmissions(groupedResult) }}
        <br>
        kg/CO<sub>2</sub>
      </td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { emissionToNumber } from '@/utils/resultUtils'
import { useProjectStore } from '@/stores/main'
import type { PropType } from 'vue'
import type { ResultItem, GroupedResults } from '@/models/result'

const props = defineProps({
  resultItem: {
    type: Object as PropType<ResultItem>,
    required: true,
  },
})

const projectStore = useProjectStore()

const isHighlighted = (res: GroupedResults) => 
  projectStore.highlightedLabel === res.parameter

const onRowClicked = (res: GroupedResults) => {
  projectStore.setHighlightedLabel(res.parameter)
  projectStore.setObjectsById(res.data.geoId)
}

const getAmountWithUnit = (groupedResult: GroupedResults) => {
  const quantity = groupedResult.quantity
  if (quantity?.m3) return `${Math.round(quantity.m3 * 1e2) / 1e2 } m3`
  if (quantity?.m2) return `${Math.round(quantity.m2 * 1e2) / 1e2 } m2`
  if (quantity?.m) return `${Math.round(quantity.m * 1e2) / 1e2 } m`
  if (quantity?.pcs) return `${quantity.pcs} pcs`
  return '0'
}

const getRoundedEmissions = (groupedResult: GroupedResults) => 
  Math.round(emissionToNumber(groupedResult.data.emission) * 1e2) / 1e2
</script>