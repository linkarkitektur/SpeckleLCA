/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineStore } from "pinia"
import type { GeometryObject } from "@/models/geometryObject"
import type { Project, Results } from "@/models/project"
import type { FilterRegistry, Group, Filter } from "@/models/filters"
import { createNestedObject } from '@/utils/projectUtils'
import { logMessageToSentry } from '@/utils/monitoring'

/**
 * Defines the project store, which contains the current project and its geometry and results.
 */
export const useProjectStore = defineStore({
  id: 'projectStore',
  state: () => {
    return {
      currProject: null as Project | null, // The current project being worked on
      projectGroups: null as Group[] | null, // Groups that have been created for geometry objects
      filterRegistry: null as FilterRegistry | null, // Filterregistry with current filters and filterCallStack
    }
  },

  actions: {
    /**
     * Creates a new project.
     * @param project The project to create.
     */
    createNewProject(project: Project) {
      this.currProject = project
    },

    /**
     * Creates or updated the current groups set on the project
     * @param groups
     */
    updateGroups(groups: Group[]) {
      this.projectGroups = groups
    },

    /**
     * Update a specific group by id with a new name and base path
     * @param name name to change to
     * @param id id of group to change 
     */
    updateGroupName(name: string, id: string) {
      if (this.projectGroups){
        const foundObject = this.projectGroups.find(obj => obj.id === id)
        if (foundObject) {
          foundObject.name = name
          foundObject.path[0] = name
        }
        else {
          console.log("Object with the provided ID not found.")
        }
      }      
    },

    /**
     * Removes a group from the project with id reference
     * @param id if of group to remove
     */
    removeGroup(id: string) {
      if (this.projectGroups) {
        const foundIndex = this.projectGroups.findIndex(obj => obj.id === id)
        if (foundIndex > -1) {
          //Filter used when splicing it doesnt update the watchers
          this.projectGroups = this.projectGroups.filter((element, index) => index != foundIndex)
        } else {
          console.warn("Object with the provided ID not found.")
        }
      }      
    },

    /**
     * Adds a group to the project store
     * @param group group to add to store
     */
    addGroup(group: Group) {
      if (this.projectGroups) {
        this.projectGroups.push(group)
      }
    },

    /**
     * Updates the current project.
     * @param project The project to update.
     */
    updateProject(project: Project) {
      this.currProject = project
    },

    /**
     * Update store with current filter registry
     * @param registry The registry to update to
     */
    setFilterRegistry(registry: FilterRegistry) {
      this.filterRegistry = registry
    },

    /**
     * Update store with new filter callstack with
     * names and values
     * @param callStack list of Filters
     */
    updateRegistryStack(name: string, callStack : Filter[]) {
      if(this.filterRegistry)
        this.filterRegistry.filterCallStack = {
          name: name,
          callStack: callStack
        }
    },

    /**
     * Get current filter registry call stack and returns a array of 
     * filters that are within it
     * @returns Array of filters with keyvalues for the current filtering
     */
    getRegistryStack() : Filter[] {
      if(this.filterRegistry !== null)
        return this.filterRegistry.filterCallStack.callStack
      else
        return [{
          name: "No filters founds",
          field: "No filters founds",
          value: "No filters founds"
        }]
    },

    /**
     * Get current filter names available in active registry
     * @returns array of available filter names
     */
    getFilterNames() {
      if(this.filterRegistry !== null)
        return this.filterRegistry.getFilterNames()
      else
        return ["No filters founds"]
    },

    /**
     * Goes through geometry objects and returns list of parameters available
     * to filter project with
     * @returns array of available parameters
     */
    getAvailableParameterList() {
      if(this.currProject) {
        const parameterSet: Set<string> = new Set()
        this.currProject.geometry.forEach(geo => {
          Object.keys(geo.parameters).forEach((key) => {
            if (typeof geo.parameters[key] === 'string' || typeof geo.parameters[key] === 'number') {
              parameterSet.add(key)
            }
          })
          Object.keys(geo.quantity).forEach((key) => {
            if (geo.quantity[key as keyof typeof geo.quantity] !== 0) {
              parameterSet.add(key)
              geo.parameters[key] = geo.quantity[key as keyof typeof geo.quantity].toString()
            }
          })
        })
        return Array.from(parameterSet)
      } else {
        return ["No parameters found"]
      }
    },

    /**
     * Adds a geometry object to the current project.
     * @param geometryObject The geometry object to add.
     */
    addGeometry(geometryObject: GeometryObject) {
      this.currProject?.geometry.push(geometryObject)
    },

    /**
     * Removes a geometry object from the current project.
     * @param id The ID of the geometry object to remove.
     */
    removeGeometry(id: string) {
      const index = this.findGeometryIndexById(id)

      if (index === -1) return

      if (index != undefined) this.currProject?.geometry.splice(index, 1)
    },

    /**
     * Updates a geometry object in the current project.
     * @param payload The updated geometry object.
     * @param id The ID of the geometry object to update.
     */
    updateGeometry(payload: GeometryObject, id: string) {
      if (!id || !payload || this.currProject === null) return

      const index = this.findGeometryIndexById(id)

      if (index !== -1 && index != undefined)
        this.currProject.geometry[index] = payload
    },

    /**
     * Adds results to the current project.
     * @param result The results to add.
     */
    addResults(result: Results) {
      if (this.currProject?.results != null)
        this.currProject.results.push(result)
      else if (this.currProject != null) this.currProject.results = [result]
    },

    /**
     * Updates results in the current project.
     * @param payload The updated results.
     * @param id The ID of the results to update.
     */
    updateResults(payload: Results, id: string) {
      if (!id || !payload || this.currProject === undefined) return

      const index = this.findResultIndexById(id)

      if (
        index !== -1 &&
        index != undefined &&
        this.currProject?.results != null
      )
        this.currProject.results[index] = payload
    },

    /**
     * Returns tree structure of current filter groupings in the project
     */
    getGroupTree() {
      if (this.projectGroups) {
        const data = this.projectGroups

        // Creating the nested object
        const nestedObject = createNestedObject(data)
        return nestedObject
      } else {
        const msg =
          'No groups found to create tree structure in current project.'
        logMessageToSentry(msg, 'info')
        console.log(msg)
      }
    },

    /**
     * Finds the index of a geometry object in the current project by its ID.
     * @param id The ID of the geometry object to find.
     * @returns The index of the geometry object, or -1 if not found.
     */
    findGeometryIndexById(id: string) {
      return this.currProject?.geometry.findIndex((item) => item.id === id)
    },

    /**
     * Finds the index of results in the current project by its ID.
     * @param id The ID of the results to find.
     * @returns The index of the results, or -1 if not found.
     */
    findResultIndexById(id: string) {
      return this.currProject?.geometry.findIndex((item) => item.id === id)
    },
  },
})

/**
 * A store for managing material-related data.
 */
export const useMaterialStore = defineStore({
  id: 'materialStore',
  state: () => {
    return {
      currProject: null as Project | null,
    }
  },

  actions: {
    /**
     * Creates a new project and sets it as the current project.
     * @param project The project to be created.
     */
    createNewProject(project: Project) {
      this.currProject = project
    },
  },
})

/**
 * Navigation store that is used by the navigation bar in the application view
 */
/**
 * Defines a store for managing navigation state.
 */
export const useNavigationStore = defineStore({
  id: 'navigationStore',
  state: () => {
    return {
      activePage: "Projects" as string, // The current page
      slideoverOpen: false,
      groupModalOpen: false,
      loading: false,
    }
  },
  actions: {
    /**
     * Set the application that is being used in the application view
     * @param page page that is currently active in the application view
     */
    setActivePage(page: string) {
      this.activePage = page
    },

    /**
     * Toggle slideover where its present on the app
     */
    toggleSlideover() {
      this.slideoverOpen = !this.slideoverOpen
    },

    /**
     * Toggle loading state on the app
     */
    toggleLoading() {
      this.loading = !this.loading
    },

    /**
     * Toggle new group modal interface
     */
    toggleGroupModal() {
      this.groupModalOpen = !this.groupModalOpen
    },
  },
  getters: {
    getActivePage: (state) => state.activePage,
    getSlideoverOpen: (state) => state.slideoverOpen,
  },
})

/**
 * Represents a nested object with names and numbers of objects.
 */
interface NestedObject {
  name: string
  objects: number
  children: { [key: string]: NestedObject }
}
