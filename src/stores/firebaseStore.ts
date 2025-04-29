import { defineStore } from 'pinia'
import { db } from '@/firebase'
import type {
	FilterRegistry,
  FilterList
} from '@/models/filterModel'
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
} from 'firebase/firestore'
import type { 
  Mapping,
  Assembly
} from '@/models/materialModel'
import type { 
  ResultList
} from '@/models/resultModel'
import type {
  FilterLog,
  MappingLog,
  ResultsLog,
  AssemblyList,
  CalculationSettingsLog,
  ProjectSettingsLog
} from '@/models/firebaseModel'

import { 
  deepToRaw,
  removeUndefinedFields
 } from '@/utils/dataUtils'
import type { CalculationSettings, ProjectSettings } from '@/models/settingModel'

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
          filterList: filterRegistry.filterList,
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
     * If a filter with the same name exists (case-insensitive), it will be overwritten
     * @param projectId projectId which usually is the streamID from speckle
     * @param filterRegistry current loaded filterRegistry
     * @param stackName name of the filter state, eg. Archicad walls 
     */
    async addFilterList(projectId: string ,filterList: FilterList, stackName: string) {
      this.loading = true
      this.error = null
      try {
        // Convert name to lowercase for case-insensitive comparison
        const nameLower = stackName.toLowerCase()

        // Get all filters for the project
        const projectQuery = query(
          collection(db, 'projectFilters'),
          where('projectId', '==', projectId)
        )
        const projectSnapshot = await getDocs(projectQuery)

								// TODO - find filter name
        // Check for existing filter with same name (case-insensitive)
        const existingDoc = projectSnapshot.docs.find(
          doc => doc.data().stackName.toLowerCase() === nameLower
        )

        const newStack: FilterLog = {
          projectId: projectId,
          stackName: stackName,
          filterList: filterList,
          date: new Date(),
        }

        if (existingDoc) {
          // Update existing filter
          await setDoc(existingDoc.ref, newStack)
        } else {
          // Create new filter
          await addDoc(collection(db, 'projectFilters'), newStack)
        }
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
     * If a mapping with the same name exists (case-insensitive), it will be overwritten
     * @param projectId projectId which usually is the streamID from speckle
     * @param mapping mapping to save
     */
    async addMapping(projectId: string, mapping: Mapping, name: string) {
      this.loading = true
      this.error = null

      const rawMapping = deepToRaw(mapping)
      const cleanedMapping = removeUndefinedFields(rawMapping)

      try {
        // Convert name to lowercase for case-insensitive comparison
        const nameLower = name.toLowerCase()

        // First get all mappings for the project
        const projectQuery = query(
          collection(db, 'mappings'),
          where('projectId', '==', projectId)
        )
        const projectSnapshot = await getDocs(projectQuery)

        // Check for existing mapping with same name (case-insensitive)
        const existingDoc = projectSnapshot.docs.find(
          doc => doc.data().name.toLowerCase() === nameLower
        )

        const mappingLog: MappingLog = {
          projectId: projectId,
          mapping: cleanedMapping,
          date: new Date(),
          name: name,
        }

        if (existingDoc) {
          // Update existing mapping
          await setDoc(existingDoc.ref, mappingLog)
        } else {
          // Create new mapping
          await addDoc(collection(db, 'mappings'), mappingLog)
        }
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
     * If a result with the same name exists (case-insensitive), it will be overwritten
     * To get object based results reload the mappings and recalculate
     * @param projectId projectId which usually is the streamID from speckle
     * @param results aggregated results from geometry objects
     */
    async addResultList(projectId: string, resultList: ResultList, name: string) {
      this.loading = true
      this.error = null
      try {
        // Convert name to lowercase for case-insensitive comparison
        const nameLower = name.toLowerCase()

        // Get all results for the project
        const projectQuery = query(
          collection(db, 'resultLists'),
          where('projectId', '==', projectId)
        )
        const projectSnapshot = await getDocs(projectQuery)

        // Check for existing result with same name (case-insensitive)
        const existingDoc = projectSnapshot.docs.find(
          doc => doc.data().name.toLowerCase() === nameLower
        )

        const resultsLog: ResultsLog = {
          name: name,
          projectId: projectId,
          resultList: resultList,
          date: new Date(),
        }

        if (existingDoc) {
          // Update existing result
          await setDoc(existingDoc.ref, resultsLog)
        } else {
          // Create new result
          await addDoc(collection(db, 'resultLists'), resultsLog)
        }
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
     * Fetches project settings, should only return one but if multiple we return the one with the newest date
     * @param projectId 
     * @returns 
     */
    async fetchProjectSettings(projectId: string): Promise<ProjectSettingsLog | null> {
      this.loading = true
      this.error = null

      try {
        const q = query(
          collection(db, 'projectSettings'),
          where('projectId', '==', projectId)
        )

        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
            const settings = snapshot.docs
              .map(doc => doc.data() as ProjectSettingsLog)
              .sort((a, b) => b.date.getTime() - a.date.getTime())[0]
            return settings
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
     * Add new projectsettings for id or overwrite existing with the new ones
     * @param projectId Id for project
     * @param settings settings to update with
     */
    async addProjectSettings(projectId: string, settings: ProjectSettings) {
      this.loading = true
      this.error = null
      try {
        // First we search and see if we find one with the projectId already
        const querySnapshot = await getDocs(
          query(collection(db, 'projectSettings'), 
          where('projectId', '==', projectId))
        )

        const settingsLog: ProjectSettingsLog = {
          projectId: projectId,
          settings: settings,
          date: new Date(),
        }

        // We overwrite it if we found one or add a new
        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref
          await setDoc(docRef, settingsLog)
        } else {
          await addDoc(collection(db, 'projectSettings'), settingsLog)
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
     * If a setting with the same name exists (case-insensitive), it will be overwritten
     * @param projectId projectId which usually is the streamID from speckle
     * @param setting setting to save
     */
    async addCalculationSettings(projectId: string, setting: CalculationSettings, name: string) {
      this.loading = true
      this.error = null
  
      try {
        if (!setting) 
          return null

        // Convert name to lowercase for case-insensitive comparison
        const nameLower = name.toLowerCase()

        // Get all calculation settings for the project
        const projectQuery = query(
          collection(db, 'calculationSettings'),
          where('projectId', '==', projectId)
        )
        const projectSnapshot = await getDocs(projectQuery)

        // Check for existing setting with same name (case-insensitive)
        const existingDoc = projectSnapshot.docs.find(
          doc => doc.data().name.toLowerCase() === nameLower
        )

        const settingLog: CalculationSettingsLog = {
          projectId: projectId,
          settings: setting,
          date: new Date(),
          name: name
        }

        if (existingDoc) {
          // Update existing setting
          await setDoc(existingDoc.ref, settingLog)
        } else {
          // Create new setting
          await addDoc(collection(db, 'calculationSettings'), settingLog)
        }
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
  },
})