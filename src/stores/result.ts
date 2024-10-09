import { defineStore } from 'pinia'

import { resultsPerMaterial } from '@/utils/resultUtils'

import type { Emission } from '@/models/material'
import type { MaterialResults } from '@/models/result'

/**
 * Defines the result store, which is used to store the results of the calculations
 * Aggregates and provides some chartdata for use
 */
export const useResultStore = defineStore({
	id: 'resultStore',
	state: () => {
		return {
      aggregatedResults: {} as Emission,
      materialResults: [] as MaterialResults[]
		}
	},
  actions: {
    setAggregatedResults(emission: Emission) {
      this.aggregatedResults = emission

      //Trigger the results per material calculation
      resultsPerMaterial()
    },

    getAggregatedResults() {
      return this.aggregatedResults
    }
  }
  
})