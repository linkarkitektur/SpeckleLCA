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
      >
        <td scope="row" class="m-2 w-3/6 line-clamp-3">
          {{ groupedResult.parameter }}
        </td>
        <td class="m-2 w-1/6">
          {{ getAmountWithUnit(groupedResult) }}
        </td>
        <!-- Arbitrary numbers for red vs green, this needs to be threshold or dynamic and-->
        <td 
          :class="{'text-red-600' : getRoundedEmissions(groupedResult) >= 100, 'text-green-600' : getRoundedEmissions(groupedResult) < 100 }"
          class="m-2 w-2/6"
        >
            {{ getRoundedEmissions(groupedResult) }} 
          <br>
            kg/CO<sub>2</sub>
        </td>
      </tr>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { emissionToNumber } from '@/utils/resultUtils'

import type { ResultItem, GroupedResults } from '@/models/result'
import { useResultStore } from '@/stores/result'
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: 'ResultTable',
  components: {
  },
  props: {
    resultItem: {
      type: Object as PropType<ResultItem>,
      required: true,
    },
  },
  methods: {
    /**
     * Return formated and rounded amount of the grouped result
     * Order is m3 -> m2 -> m -> pcs
     * @param groupedResult 
     */
    getAmountWithUnit(groupedResult: GroupedResults) {
      const quantity = groupedResult.quantity;
      if (quantity?.m3) return `${Math.round(quantity.m3 * 1e2) / 1e2 } m3`
      if (quantity?.m2) return `${Math.round(quantity.m2 * 1e2) / 1e2 } m2`
      if (quantity?.m) return `${Math.round(quantity.m * 1e2) / 1e2 } m`
      if (quantity?.pcs) return `${quantity.pcs} pcs`
      return '0'
    },
    /**
     * Gets rounded emission for a grouped result
     * TODO: This should be a threshold or dynamic and atleast noramlized to sqm
     * @param groupedResult 
     */
    getRoundedEmissions(groupedResult: GroupedResults) {
      return Math.round(emissionToNumber(groupedResult.data.emission) * 1e2) / 1e2 
    },
  },
  setup() {
    return {
    }
  },
})
</script>