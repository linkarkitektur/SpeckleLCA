import { defineStore } from 'pinia'

import type { 
  ResultList,
} from '@/models/result'

import { DefaultResultList } from '@/models/result'

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
      resultList: DefaultResultList,
      activeParameter: 'parameters.category', // Default active parameter for result filtering in resultLists TODO: Is this needed?
      reloadChartData: true, // Boolean to reload the chart data
		}
	},
  actions: {
    /**
     * Updates resultList
     * @param resultList resultList to update with
     */
    setResultList(resultList: ResultList) {
      this.resultList = resultList
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
    },

    /**
     * Toggle the reloadChartData boolean
     */
    toggleReloadData() {
      this.reloadChartData = !this.reloadChartData
    },

    /**
     * Set the reloadChartData boolean
     * @param reload 
     */
    setReloadData(reload: boolean) {
      this.reloadChartData = reload
    },
  }
  
})