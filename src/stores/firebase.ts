import { defineStore } from 'pinia'
import { db } from '@/firebase'
import type {
	FilterRegistry,
  FilterList
} from '@/models/filters'
import { 
  collection, 
  addDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  writeBatch
} from 'firebase/firestore'
import type { 
  Mapping 
} from '@/models/material'
import type { 
  Results 
} from '@/models/project'

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

interface ResultsLog {
  projectId: string
  results: Results
  date: Date
}

export const useFirebaseStore = defineStore('firebase', {
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
    async fetchLatestFilters(projectId: string): Promise<FilterLog[] | null> {
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
     * Returns the last generic filterLogs to be used as standard filters
     * @param resLimit Optional limit of results, default is 20
     * @returns last 20 generic filterLogs
     */
    async fetchGenericFilters(resLimit: number = 20): Promise<FilterLog[]> {
      this.loading = true
      this.error = null
      try {
        const q = query(
          collection(db, 'genericFilters'),
          orderBy('date', 'desc'),
          limit(resLimit)
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
        await addDoc(collection(db, 'projectFilters'), mappingLog)
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
    },

    /**
     * Deletes a mapping from the database
     * @param projectId projectId which usually is the streamID from Speckle
     * @param mappingId mappingId to delete
     */
    async deleteMapping(projectId: string, mappingId: string) {
      this.loading = true
      this.error = null

      try {
        const q = query(
          collection(db, 'mappings'),
          where('projectId', '==', projectId),
          where('mappingId', '==', mappingId)
        )
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const batch = writeBatch(db)
          querySnapshot.forEach(doc => {
            batch.delete(doc.ref)
          })
          await batch.commit()
        } else {
          this.error = 'No matching document found'
        }
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },


    /**
     * Adds results to the firebase DB to save the current results, only saving aggregated results
     * To get object based results reload the mappings and recalculate
     * @param projectId projectId which usually is the streamID from speckle
     * @param results aggregated results from geometry objects
     */
    async addResults(projectId: string, results: Results) {
      this.loading = true
      this.error = null
      try {
        const resultsLog: ResultsLog = {
          projectId: projectId,
          results: results,
          date: new Date(),
        }
        await addDoc(collection(db, 'projectFilters'), resultsLog)
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetches aggregated results for the project, with a optional limit
     * @param projectId projectId which usually is the streamID from speckle
     * @param resLimit Optional limit of results, default is 25
     * @returns 
     */
    async fetchResults(projectId: string, resLimit: number = 25): Promise<ResultsLog[] | null> {
      this.loading = true
      this.error = null
      try {
        const q = query(
          collection(db, 'projectResults'),
          where('projectId', '==', projectId),
          orderBy('date', 'desc'),
          limit(resLimit)
        )
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const results = querySnapshot.docs.map(doc => doc.data()) as ResultsLog[]
          return results
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
     * Deletes a result from the database
     * @param projectId projectId which usually is the streamID from Speckle
     * @param resultsId resultsId to delete
     */
    async deleteResults(projectId: string, resultsId: string) {
      this.loading = true
      this.error = null
    
      try {
        const q = query(
          collection(db, 'projectResults'),
          where('projectId', '==', projectId),
          where('mappingId', '==', resultsId)
        )
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const batch = writeBatch(db)
          querySnapshot.forEach(doc => {
            batch.delete(doc.ref)
          })
          await batch.commit()
        } else {
          this.error = 'No matching document found'
        }
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  },
})