import { defineStore } from 'pinia'
import { db } from '@/firebase'
import type {
	FilterRegistry,
  FilterList
} from '@/models/filters'
import { 
  collection, 
  addDoc,
  setDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  writeBatch,
  doc
} from 'firebase/firestore'
import type { 
  Mapping,
  Assembly
} from '@/models/material'
import type { 
  Results, 
  ResultList
} from '@/models/result'
import type {
  FilterLog,
  MappingLog,
  ResultsLog,
  AssemblyList,
  CalculationSettingsLog
} from '@/models/firebase'

import { 
  deepToRaw,
  removeUndefinedFields
 } from '@/utils/dataUtils'
import type { CalculationSettings } from '@/models/settings'

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
    async addFilterRegistry(projectId: string ,filterRegistry: FilterRegistry, stackName: string) {
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
     * Saves the current filter state to the database, with a timestamp
     * @param projectId projectId which usually is the streamID from speckle
     * @param filterRegistry current loaded filterRegistry
     * @param stackName name of the filter state, eg. Archicad walls 
     */
    async addFilterList(projectId: string ,filterList: FilterList, stackName: string) {
      this.loading = true
      this.error = null
      try {
        const newStack: FilterLog = {
          projectId: projectId,
          stackName: stackName,
          filterCallStack: filterList,
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
          const filterStates = querySnapshot.docs.map(doc => doc.data()) as FilterLog[]
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
          const filterStates = querySnapshot.docs.map(doc => doc.data()) as FilterLog[]
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
    async addMapping(projectId: string, mapping: Mapping, name: string) {
      this.loading = true
      this.error = null

      const rawMapping = deepToRaw(mapping)
      const cleanedMapping = removeUndefinedFields(rawMapping)

      try {
        const mappingLog: MappingLog = {
          projectId: projectId,
          mapping: cleanedMapping,
          date: new Date(),
          name: name,
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
    async addResultList(projectId: string, resultList: ResultList, name: string) {
      this.loading = true
      this.error = null
      try {
        const resultsLog: ResultsLog = {
          name: name,
          projectId: projectId,
          resultList: resultList,
          date: new Date(),
        }
        await addDoc(collection(db, 'resultLists'), resultsLog)
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
          collection(db, 'resultLists'),
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
    },

    /**
     * Fetches the whole assembly list for a project
     * @param projectId optional projectId to filter on if omitted gets all assemblies
     * @returns list of assemblies
     */
    async fetchAssemblyList(projectId: string | boolean): Promise<AssemblyList | null> {
      this.loading = true
      this.error = null
      try {
        let q
        if (projectId === true) {
          q = query(
            collection(db, 'projectAssemblies')
          )
        } else {
          q = query(
            collection(db, 'projectAssemblies'),
            where('projectId', '==', projectId)
          )
        }

        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const assemblyList: AssemblyList = {
            projectId: projectId as string,
            assemblies: []
          }
          querySnapshot.forEach(doc => {
            const data = doc.data() as AssemblyList
            assemblyList.assemblies.push(... data.assemblies)
          })
          return assemblyList
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
     * Updates the assembly list for a project
     * Overwrites the current list
     * @param projectId 
     * @param assemblies 
     */
    async addAssemblyList(projectId: string, assemblies: Assembly[]) {
      this.loading = true
      this.error = null

      try {
        const querySnapshot = await getDocs(
          query(collection(db, 'projectAssemblies'), 
          where('projectId', '==', projectId))
        )

        const assemblyList: AssemblyList = {
          projectId: projectId,
          assemblies: assemblies,
        }

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref
          await setDoc(docRef, assemblyList)
        } else {
          await addDoc(collection(db, 'projectAssemblies'), assemblyList);
        }
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetches the calculation settings for a project and all generic ones
     * @param projectId 
     * @param settings 
     * @returns CalculationSettings[] or null if none found
     */
    async fetchCalculationSettings(projectId: string): Promise<CalculationSettingsLog[] | null> {
      this.loading = true
      this.error = null

      try {
        const specificQuery = query(
          collection(db, 'calculationSettings'),
          where('projectId', '==', projectId)
        )
        const genericQuery = query(
          collection(db, 'calculationSettings'),
          where('projectId', '==', 'generic')
        )

        const [specificSnapshot, genericSnapshot] = await Promise.all([
          getDocs(specificQuery),
          getDocs(genericQuery)
        ])
        
        if (!specificSnapshot.empty || !genericSnapshot.empty) {
          const combinedSettings: CalculationSettingsLog[] = [...specificSnapshot.docs, ...genericSnapshot.docs].map(doc => ({
            ...doc.data()
          })) as CalculationSettingsLog[]
          return combinedSettings
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
     * Adds a calculation setting to the database
     * @param projectId 
     * @param setting 
     */
    async addCalculationSettings(projectId: string, setting: CalculationSettings, name: string) {
      this.loading = true
      this.error = null
  
      try {
        if (!setting) 
          return null

        const settingLog: CalculationSettingsLog = {
          projectId: projectId,
          settings: setting,
          date: new Date(),
          name: name
        }
        await addDoc(collection(db, 'calculationSettings'), settingLog);
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
  },
})