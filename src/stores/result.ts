import { defineStore } from 'pinia'

import type { 
  MaterialResults,
  GroupedResults,
} from '@/models/result'

import { ResultList } from '@/models/result'

import type { Results } from '@/models/result'

/**
 * Defines the result store, which is used to store the results of the calculations
 * Aggregates and provides some chartdata for use
 */
export const useResultStore = defineStore({
	id: 'resultStore',
	state: () => {
		return {
      aggregatedResults: [] as Results[],
      materialResults: {} as MaterialResults,
      resultList: ResultList,
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

    /**
     * Update the resultlist with the grouped results
     * @param groupedResult Results to update with
     * @param id to update, e.g. category, material, materialType, BSABCodes, speckleType
     */
    updateGroupedResults(groupedResult: GroupedResults[], id: string) {
      if (!this.resultList[id]) {
        this.resultList[id] = []
      }
      this.resultList[id] = groupedResult 
    },

    /**
     * Returns the grouped results for a specific id or all if empty
     * @param id 
     * @returns 
     */
    getGroupedResults(id: string = 'all') {
      if (id === 'all') {
        return this.resultList
      }
      if (this.resultList[id]) {
        return { [id]: this.resultList[id] }
      }
      return {}
    
    }
  }
  
})