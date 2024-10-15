import { defineStore } from 'pinia'

import type { MaterialResults } from '@/models/result'
import type { Results } from '@/models/project'

/**
 * Defines the result store, which is used to store the results of the calculations
 * Aggregates and provides some chartdata for use
 */
export const useResultStore = defineStore({
	id: 'resultStore',
	state: () => {
		return {
      aggregatedResults: [] as Results[],
      materialResults: {} as MaterialResults
		}
	},
  actions: {
    /**
     * Sets results for the project with option material results
     * @param result 
     * @param materialResults 
     */
    setAggregatedResults(result: Results, materialResults: MaterialResults = {}) {
      if (!this.aggregatedResults || this.aggregatedResults.length === 0) {
        this.aggregatedResults = []
      }
      this.aggregatedResults.push(result)

      if (Object.keys(materialResults).length > 0) {
        this.materialResults = materialResults
      }
    },
  }
  
})