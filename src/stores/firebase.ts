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
import type { Mapping } from '@/models/material'

interface FilterLog {
  projectId: string
  stackName: string
  filterCallStack: FilterList
  date: Date
}

interface MappingLog {
  projectId: string
  mapping: Mapping
  date: Date
}

export const useLogStore = defineStore('log', {
  state: () => ({
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
    async addFilterState(projectId: string ,filterRegistry: FilterRegistry, stackName: string) {
      this.loading = true
      this.error = null
      try {
        const newStack: FilterLog = {
          projectId: projectId,
          stackName: stackName,
          filterCallStack: filterRegistry.filterCallStack,
          date: new Date(),
        }
        await addDoc(collection(db, 'projectFilters'), newStack)
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetches the last 5 filterLogs for a project
     * @param projectId projectId which usually is the streamID from speckle
     * @returns last 5 filterLogs, or null if none found
     */
    async fetchLatestFilterLogs(projectId: string): Promise<FilterLog[] | null> {
      this.loading = true
      this.error = null
      try {
        const q = query(
          collection(db, 'projectFilters'),
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

    /**
     * Returns the last 20 generic filterLogs to be used as standard filters
     * @returns last 20 generic filterLogs
     */
    async fetchGenericFilters(): Promise<FilterLog[]> {
      this.loading = true
      this.error = null
      try {
        const q = query(
          collection(db, 'genericFilters'),
          orderBy('date', 'desc'),
          limit(20)
        )
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          // Get the 20 latest generic filterstates
          const filterStates = querySnapshot.docs.map(doc => doc.data().filterCallStack) as FilterLog[]
          return filterStates
        } else {
          return []
        }
      } catch (error: any) {
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Adds mapping to the firebase DB to save the current mapping progress
     * @param projectId projectId which usually is the streamID from speckle
     * @param mapping mapping to save
     */
    async addMapping(projectId: string, mapping: Mapping) {
      this.loading = true
      this.error = null
      try {
        const mappingLog: MappingLog = {
          projectId: projectId,
          mapping: mapping,
          date: new Date(),
        }
        await addDoc(collection(db, 'mappings'), mappingLog)
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Gets mappings for the project, with a optional limit
     * @param projectId projectId which usually is the streamID from speckle
     * @param resLimit Optional limit of results, default is 25
     * @returns 
     */
    async fetchMappings(projectId: string, resLimit: number = 25): Promise<MappingLog[] | null> {
      this.loading = true
      this.error = null
      try {
        const q = query(
          collection(db, 'mappings'),
          where('projectId', '==', projectId),
          orderBy('date', 'desc'),
          limit(resLimit)
        )
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const mappings = querySnapshot.docs.map(doc => doc.data()) as MappingLog[]
          return mappings
        } else {
          return []
        }
      } catch (error: any) {
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    }
  },
})