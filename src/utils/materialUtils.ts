import type { Mapping, Product } from '@/models/materialModel'
import type { FilterList, NestedGroup } from '@/models/filterModel'
import type { GeometryObject } from '@/models/geometryModel'
import type { AssemblyList } from '@/models/firebaseModel'

import { useProjectStore } from '@/stores/projectStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useSpeckleStore } from '@/stores/speckleStore'
import { useFirebaseStore } from '@/stores/firebaseStore'

import { setMappingColorGroup, updateProjectGroups } from '@/utils/projectUtils'
import { useSettingsStore } from '@/stores/settingStore'

/**
 * Updates from a selected mapping to a new one, with all materials and objectIds
 * @param mapping Mapping object to update towards project and material store
 */
export function updateMapping(name: string, mapping: Mapping) {
	const projectStore = useProjectStore()
	const materialStore = useMaterialStore()

	// Keep this in memory to avoid unnecessary updates of groups
	let lastId = null
	clearMapping()

	mapping.steps.forEach((step) => {
		if (lastId != step.filterId) {
			//Find the filter from the mapping and apply it to the project
			const filterList = mapping.filters.find(
				(filter) => filter.id == step.filterId
			)
			projectStore.updateRegistryStack(
				filterList.name,
				filterList.callStack,
				filterList.customGeo
			)
			updateProjectGroups()

			lastId = step.filterId
		}
		//Search and find the group that we are updating
		const path = step.nestedGroupId.includes('|')
			? step.nestedGroupId.split('|')
			: [step.nestedGroupId]
		const group = projectStore.getGroupByPath(path)

		if (group == null) {
			return
		} else {
			//Update the material for all objects in the group
			group.elements.forEach((obj) => {
				obj.material = step.material
			})
		}

		materialStore.updateMappingMaterial(step.nestedGroupId, step.material)
	})
	materialStore.setMapping({ name, mapping })
}

export function clearMapping() {
	const projectStore = useProjectStore()
	const materialStore = useMaterialStore()

	// Clear the mapping and update the project
	materialStore.mapping = null

	// Remove all mappings on objects
	projectStore.currProject.geometry.forEach((geo) => {
		geo.material = null
	})

	updateProjectGroups()
}

/**
 * Maps materials and updates the material store mapping with the current filter list and current selected material
 * Also sets the color groups for the speckle store and updates the color groups
 * @param inGroup nested group to map materials on
 */
export async function mapMaterial(inGroup: NestedGroup) {
	const materialStore = useMaterialStore()
	const projectStore = useProjectStore()
	const speckleStore = useSpeckleStore()

	const currFilterList: FilterList = projectStore.filterRegistry.filterList

	// If no mapping exists, create a new one and then add the step
	if (materialStore.mapping.mapping == null) {
		const newMapping: Mapping = {
			id: crypto.randomUUID(),
			name: 'temp',
			filters: [currFilterList],
			steps: []
		}
		materialStore.mapping.mapping = newMapping
		await Promise.all(
			inGroup.objects.map((obj) => {
				obj.material = materialStore.currentMapping
			})
		)
		materialStore.addStep(
			inGroup,
			materialStore.currentMapping,
			currFilterList.id
		)
	} else {
		// If the filter list is not in the mapping, add it
		if (!materialStore.mapping.mapping.filters.includes(currFilterList)) {
			materialStore.mapping.mapping.filters.push(currFilterList)
		}
		await Promise.all(
			inGroup.objects.map((obj) => {
				obj.material = materialStore.currentMapping
			})
		)
		materialStore.addStep(
			inGroup,
			materialStore.currentMapping,
			currFilterList.id
		)
	}

	const mappingColors = setMappingColorGroup()
	speckleStore.setColorGroups(mappingColors)
}

/**
 * Helper function to get nested property value from a string path
 * @param obj The object to extract the value from
 * @param path The path string (e.g., 'metaData.materialType')
 * @returns The value at the specified path or undefined
 */
export function getNestedPropertyValue(obj: any, path: string): any {
	return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

/**
 * Gets the mapped material and returns a color based on it
 * @param group
 * @returns
 */
export function getMappedMaterial(objects: GeometryObject[]) {
	if (objects) {
		const materialNames = objects.map((obj) => obj.material?.name)
		const uniqueMaterialNames = [...new Set(materialNames)]

		// Check if there are objects without materials to turn the card yellow
		const objectsWithoutMaterials =
			objects.filter((obj) => obj.material == undefined).length > 0

		if (uniqueMaterialNames.length === 1) {
			if (uniqueMaterialNames[0] == undefined) {
				return {
					name: 'No material mapped',
					color: 'red-50'
				}
			} else {
				return {
					name: uniqueMaterialNames[0],
					color: 'green-50'
				}
			}
		} else {
			return {
				name: 'Mixed',
				color: objectsWithoutMaterials ? 'yellow-50' : 'green-50'
			}
		}
	} else {
		return {
			name: 'No material mapped',
			color: 'red-50'
		}
	}
}

/**
 * Creates a geometry object cube from a product for emission calculations
 * @param product
 * @returns geometryObject consitsting of a material cube
 */
export function createGeometryFromProduct(product: Product): GeometryObject {
	// Create base quantity object
	const quantity = {
		m: 1,
		m2: 1,
		m3: 1,
		kg: 1, // TODO: This should be the weight of the product
		pcs: 1,
		tonnes: 0,
		l: 0
	}

	if (product.metaData.thickness) {
		// @ts-expect-error anyvalue issues
		quantity.m3 = parseFloat(product.metaData.thickness) / 1000 // unit is in mm
	}

	const geo: GeometryObject = {
		id: product.id,
		name: 'type',
		quantity: quantity,
		material: product,
		parameters: {
			// Parameters from assembly creatino add more here if we add more to it
			thickness: (product.metaData.thickness
				? product.metaData.thickness
				: '0') as string,
			color: (product.metaData.color
				? product.metaData.color
				: '#ffffff') as string
		},
		simpleParameters: {
			category: '',
			type: '',
			materialName: '',
			code: '',
			m: 0,
			m2: 0,
			m3: 0
		}
	}

	return geo
}

/**
 * Get the assembly list from firebase and update the material store
 */
export async function getAssemblyList() {
	const materialStore = useMaterialStore()
	const projectStore = useProjectStore()
	const firebaseStore = useFirebaseStore()
	const settingsStore = useSettingsStore()

	try {
		// First load project assemblies
		const assemblyList: AssemblyList = await firebaseStore.fetchAssemblyList(
			projectStore.currProject.id
		)
		if (assemblyList) {
			assemblyList.assemblies.forEach((assembly) => {
				materialStore.addAssembly(assembly)
			})
		}
		// Then load global assemblies
		// TODO: Add Global assembly database in firebase
		if (settingsStore.materialSettings.globalAssemblies) {
			const assemblyList: AssemblyList = await firebaseStore.fetchAssemblyList(
				true
			)
			if (assemblyList) {
				assemblyList.assemblies.forEach((assembly) => {
					materialStore.addAssembly(assembly)
				})
			}
		}
	} catch (error) {
		console.error('Error fetching assembly list:', error)
	}
}

export function reduceMapping(mapping: Mapping): Mapping {
	// Create a new mapping object with the same ID and name
	const reducedMapping: Mapping = {
		id: mapping.id,
		name: mapping.name,
		filters: [],
		steps: []
	}

	// For each filter in the mapping, create a reduced version
	// that only contains essential information
	const processedFilters = new Set<string>()
	mapping.steps.forEach((step) => {
		if (!processedFilters.has(step.filterId)) {
			const originalFilter = mapping.filters.find((f) => f.id === step.filterId)
			if (originalFilter) {
				// Create a minimal filter with only necessary information
				const reducedFilter: FilterList = {
					id: originalFilter.id,
					name: originalFilter.name,
					callStack: originalFilter.callStack,
					// Only include customGeo if it exists and is necessary
					customGeo: originalFilter.customGeo?.map((geo) => ({
						geoObj: {
							id: geo.geoObj.id,
							name: geo.geoObj.name,
							quantity: geo.geoObj.quantity,
							parameters: {},
							simpleParameters: {
								category: geo.geoObj.simpleParameters.category,
								type: geo.geoObj.simpleParameters.type,
								materialName: geo.geoObj.simpleParameters.materialName,
								code: geo.geoObj.simpleParameters.code,
								m: 0,
								m2: 0,
								m3: 0
							}
						},
						percentage: geo.percentage,
						linkedQuantId: geo.linkedQuantId,
						linkGeoId: geo.linkGeoId
					}))
				}
				reducedMapping.filters.push(reducedFilter)
				processedFilters.add(step.filterId)
			}
		}
	})

	// Copy steps but ensure we only reference the material name and type
	reducedMapping.steps = mapping.steps.map((step) => ({
		filterId: step.filterId,
		nestedGroupId: step.nestedGroupId,
		material: step.material
	}))

	return reducedMapping
}
