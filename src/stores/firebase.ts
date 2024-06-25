import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { 
  collection, 
  addDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore'
import type {
	FilterRegistry,
  FilterList
} from '@/models/filters'

interface FilterLog {
  projectId: string
  stackName: string
  filterCallStack: FilterList
  date: Date
}

export const useLogStore = defineStore('log', {
  state: () => ({
    logs: [],
    loading: false,
    error: null,
  }),
  actions: {
    /**
     * Saves the current filter state to the database, with a timestamp
     * @param projectId projectId which usually is the streamID from speckle
     * @param filterRegistry current loaded filterRegistry
     * @param stackName name of the filter state, eg. Archicad walls 
     */
    async saveFilterState(projectId: string ,filterRegistry: FilterRegistry, stackName: string) {
      this.loading = true
      this.error = null
      try {
        const newStack: FilterLog = {
          projectId: projectId,
          stackName: stackName,
          filterCallStack: filterRegistry.filterCallStack,
          date: new Date(),
        }
        await addDoc(collection(db, 'filterCallStacks'), newStack)
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetches the last 5 filterLogs for a project
     * @param projectId 
     * @returns last 5 filterLogs, or null if none found
     */
    async fetchLatestFilterLogs(projectId: string): Promise<FilterLog[] | null> {
      this.loading = true
      this.error = null
      try {
        const q = query(
          collection(db, 'filterCallStacks'),
          where('projectId', '==', projectId),
          orderBy('date', 'desc'),
          limit(5)
        )
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          // Get the 5 latest filterstates
          const filterStates = querySnapshot.docs.map(doc => doc.data().filterCallStack) as FilterLog[]
          return filterStates
        } else {
          return null
        }
      } catch (error: any) {
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    },

  },
})