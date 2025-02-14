import { defineStore } from 'pinia'
import type { GeometryObject } from '@/models/geometryObject'
import type { Project } from '@/models/project'
import type {
	FilterRegistry,
	Group,
	Filter,
	NestedGroup
} from '@/models/filters'
import type { Results } from '@/models/result'

import { createNestedObject } from '@/utils/projectUtils'
import { logMessageToSentry } from '@/utils/monitoring'
import { collectParameters } from '@/utils/dataUtils'


/**
 * Defines the project store, which contains the current project and its geometry and results.
 * TODO: Restructure this and create a seperate speckleViewer store
 */
export const useProjectStore = defineStore({
	id: 'projectStore',
	state: () => {
		return {
			currProject: null as Project | null, // The current project being worked on
			projectGroups: null as Group[] | null, // Groups that have been created for geometry objects
			filterRegistry: null as FilterRegistry | null, // Filterregistry with current filters and filterCallStack
			selectedGroup: null as NestedGroup | null, // NestedGroup that is currently selected
			selectedObjects: [] as GeometryObject[], // GeometryObjects that are currently selected
			highlightedLabel: null as string | null, // Label that is currently highlighted
			hiddenObjects: [] as GeometryObject[], // GeometryObjects that are currently hidden
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
			if (this.projectGroups) {
				const foundObject = this.projectGroups.find((obj) => obj.id === id)
				if (foundObject) {
					foundObject.name = name
					foundObject.path[0] = name
				} else {
					console.log('Object with the provided ID not found.')
				}
			}
		},

		/**
		 * Removes a group from the project with id reference
		 * @param id if of group to remove
		 */
		removeGroup(id: string) {
			if (this.projectGroups) {
				const foundIndex = this.projectGroups.findIndex((obj) => obj.id === id)
				if (foundIndex > -1) {
					//Filter used when splicing it doesnt update the watchers
					this.projectGroups = this.projectGroups.filter(
						(element, index) => index != foundIndex
					)
				} else {
					console.warn('Object with the provided ID not found.')
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
		updateRegistryStack(name: string, callStack: Filter[]) {
			if (this.filterRegistry)
				this.filterRegistry.filterCallStack = {
					id: crypto.randomUUID(),
					name: name,
					callStack: callStack
				}
				
		},

		/**
		 * Get current filter registry call stack and returns a array of
		 * filters that are within it
		 * @returns Array of filters with keyvalues for the current filtering
		 */
		getRegistryStack(): Filter[] {
			if (this.filterRegistry !== null)
				return this.filterRegistry.filterCallStack.callStack
			else
				return [
					{
						name: 'No filters founds',
						field: 'No filters founds',
						value: 'No filters founds'
					}
				]
		},

		/**
		 * Get current filter names available in active registry
		 * @returns array of available filter names
		 */
		getFilterNames() {
			if (this.filterRegistry !== null)
				return this.filterRegistry.getFilterNames()
			else return ['No filters founds']
		},

		/**
		 * Goes through geometry objects and returns list of parameters available
		 * to filter project with
		 * TODO: Run this lazy on load of projects
		 * @returns array of available parameters
		 */
		getAvailableParameterList() {
			if (this.currProject) {
				const parameterSet: Set<string> = new Set()
				this.currProject.geometry.forEach((geo) => {
					collectParameters(geo.parameters, parameterSet)

					Object.keys(geo.quantity).forEach((key) => {
						const quantityKey = key as keyof typeof geo.quantity
						if (geo.quantity[quantityKey] !== 0 && geo.quantity[quantityKey] !== null) {
							parameterSet.add(key)
							geo.parameters[key] =
								geo.quantity[key as keyof typeof geo.quantity].toString()
						}
					})
				})
				return Array.from(parameterSet)
			} else {
				return ['No parameters found']
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
		 * Get the geometry object by ID
		 * @param id The ID of the geometry object to get.
		 * @returns The geometry object with the provided ID.
		 */
		getGeometryObjectById(id: string) {
			if (this.currProject) {
				return this.currProject.geometry.find((obj) => obj.id === id)
			} else {
				return null
			}
		},

		/**
		 * Returns nested group
		 * @param id 
		 * @returns 
		 */
		getGroupById(id: string): Group | null{
			if (this.projectGroups) {
				return this.projectGroups.find((group) => group.id === id)
			} else {
				return null
			}
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
		 * Set the highlighted label in the project
		 * @param label
		 */
		setHighlightedLabel(label: string) {
			this.highlightedLabel = label
		},

		/**
		 * Set the selected group in the project
		 * @param group
		 * @returns
		 */
		setSelectedGroup(group: NestedGroup) {
			this.selectedGroup = group
			this.setObjectsFromGroup()
		},

		/**
		 * set selected objects from the selected group
		 * Can be used to reset selection
		 */
		setObjectsFromGroup() {
			this.selectedObjects = []
			//if null just return
			if (this.selectedGroup === null) return

			const group = this.selectedGroup
			group.objects.forEach(element => {
				this.selectedObjects?.push(element)
			})
		},

		/**
		 * Set the selected objects in the project
		 * @param objects
		 */
		setSelectedObjects(objects: GeometryObject[]) {
			this.selectedObjects = objects
		},

		/**
		 * Set the selected objects in the project by URI
		 * @param uri
		 */
		setObjectsByURI(uri: string[]) {
			const objects = this.currProject.geometry
			const foundObjects = objects?.filter((obj) => {
				return uri.includes(obj.URI as string)
			})
			this.selectedObjects = foundObjects
		},

		/**
		 * Set the selected objects to a subset of current selected objects by ID
		 * Only searching current selected objects but if we need we can expand to whole project
		 * @param id ids of objects to select
		 */
		setObjectsById(id: string[]) {
			const objects = this.currProject.geometry
			const foundObjects = objects?.filter((obj) => {
				return id.includes(obj.id)
			})
			this.selectedObjects = foundObjects
		},

		/**
		 * Clear the selected objects in the project
		 */
		clearSelectedObjects() {
			this.selectedObjects = []
		},

		/**
		 * Clear the selected group and objects in the project
		 */
		clearSelectedGroup() {
			this.selectedGroup = null
			this.selectedObjects = []
		},

		/**
		 * returns only the URI of the selected objects in the project
		 * @returns 
		 */
		getSelectedObjectsURI() {
			if (this.selectedObjects) {
				return this.selectedObjects.map((obj) => obj.URI as string)
			} else {
				return []
			}
		},

		/**
		 * Returns tree structure of current filter groupings in the project
		 */
		getGroupTree() {
			if (this.projectGroups) {
				const data = this.projectGroups

				// Creating the nested object
				const nestedObject = createNestedObject(data)
				// Sorting the nested object by the number of objects in each group
				nestedObject.children.sort((a, b) => b.objects.length - a.objects.length)
				return nestedObject
			} else {
				const msg =
					'No groups found to create tree structure in current project.'
				logMessageToSentry(msg, 'info')
				console.log(msg)
			}

			// Add a return statement here
			return null
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
	}
})
