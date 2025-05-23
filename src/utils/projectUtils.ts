import type { NestedGroup, Filter, Group } from '@/models/filterModel'
import type { GeometryObject } from '@/models/geometryModel'

import { useProjectStore } from '@/stores/projectStore'
import {
	baseColors,
	getValueColorFromGradient,
	ColorManager
} from '@/utils/colorUtils'
import {
	ResultCalculator,
	extractEmissionsFromResultItem,
	sumEmissions,
	emissionToNumber
} from '@/utils/resultUtils'
import { calculateLinkedGeo, calculateLinkedQuantities } from './filterUtils'

/**
 * Creates a nested object from an array of Group objects.
 * Each Group object represents a path, and the function creates a nested structure based on the paths.
 * The resulting nested object contains the total number of objects at each level of the hierarchy.
 *
 * @param data An array of Group objects representing the paths.
 * @returns A NestedGroup object representing the nested structure.
 */
export function createNestedObject(data: Group[]): NestedGroup {
	const PATH_SEPARATOR = '|' // Using pipe character as it's unlikely to appear in level names

	const root: NestedGroup = {
		name: 'root',
		objects: [],
		id: 'root',
		children: []
	}

	// Use a Map to cache nodes by their full path for O(1) lookups
	const nodeMap = new Map<string, NestedGroup>()
	nodeMap.set('root', root)

	data.forEach((entry) => {
		let fullPath = ''

		entry.path.forEach((level) => {
			// Build the full path for this level using the safe separator
			fullPath = fullPath ? `${fullPath}${PATH_SEPARATOR}${level}` : level

			// If we haven't seen this path before, create a new node
			if (!nodeMap.has(fullPath)) {
				const newNode: NestedGroup = {
					color: entry.color,
					name: level,
					objects: [],
					id: fullPath,
					children: []
				}

				// Add to parent's children
				const lastSeparatorIndex = fullPath.lastIndexOf(PATH_SEPARATOR)
				const parentPath =
					lastSeparatorIndex !== -1
						? fullPath.substring(0, lastSeparatorIndex)
						: ''
				const parent = parentPath ? nodeMap.get(parentPath) : root

				// Safety check to ensure parent exists
				if (!parent) {
					console.warn(`Parent node not found for path: ${fullPath}`)
					nodeMap.set(fullPath, newNode)
					root.children.push(newNode)
				}

				parent.children.push(newNode)
				nodeMap.set(fullPath, newNode)
			}

			// Add elements to this level's objects
			const currentNode = nodeMap.get(fullPath)
			if (currentNode) {
				currentNode.objects.push(...entry.elements)
			}
		})
	})

	return root
}

/**
 * Finds a node in the tree by following a path of IDs separated by '|'
 * @param tree The root node to start searching from
 * @param path The path string with IDs separated by '|'
 * @returns The found NestedGroup or undefined if not found
 */
function findNodeByPath(
	tree: NestedGroup,
	path: string
): NestedGroup | undefined {
	const pathParts = path.split('|')
	let currentNode: NestedGroup | undefined = tree
	let currentPath = null

	for (const part of pathParts) {
		currentPath = currentPath ? currentPath + '|' + part : part
		if (!currentNode?.children) return undefined
		currentNode = currentNode.children.find((child) => child.id === currentPath)
		if (!currentNode) return undefined
	}

	return currentNode
}

/**
 * Calculate the groups based on the filters and the project
 * @param reCalc
 */
export function updateProjectGroups() {
	const projectStore = useProjectStore()
	let groups: Group[] = []

	//Create geometry objects from the project
	const geo = projectStore.currProject.geometry

	//Root for the group, this should not be needed
	groups = [
		{
			id: 'test',
			name: 'root',
			path: ['root'],
			elements: geo,
			color: 'hsl(151, 100%, 50%)'
		}
	]
	//Go through each filter and iterate over them
	let reverseStack: Filter[] = []
	if (projectStore.filterRegistry)
		reverseStack = projectStore.filterRegistry.filterList.callStack

	reverseStack.forEach((el) => {
		if (el.value) {
			groups = projectStore.filterRegistry?.callFilter(
				`${el.name}`,
				groups,
				`${el.field}`,
				`${el.value}`,
				el.remove
			)
		} else {
			groups = projectStore.filterRegistry?.callFilter(
				`${el.name}`,
				groups,
				`${el.field}`
			)
		}

		//Remove root in path since we had to add it
		groups.forEach((element) => {
			if (element.path[0] === 'root') element.path.splice(0, 1)
		})
	})

	groups.sort((a, b) => b.elements.length - a.elements.length)

	//Update groups
	projectStore.updateGroups(groups)

	// Load in and link all custom geometries now that we have tree structure
	const customGeoList = projectStore.filterRegistry?.filterList.customGeo
	if (customGeoList) {
		const tree = projectStore.getGroupTree()
		if (!tree) return

		for (const customGeo of customGeoList) {
			// Skip if geometry already exists
			if (
				projectStore.currProject.geometry.some(
					(geo) => geo.id === customGeo.geoObj.id
				)
			)
				continue

			// Get quantities - traverse the full path
			if (customGeo.linkedQuantId) {
				const quantMatch = findNodeByPath(tree, customGeo.linkedQuantId)
				if (quantMatch) {
					customGeo.geoObj.quantity = calculateLinkedQuantities(
						quantMatch,
						customGeo.percentage
					)
				}
			}

			// Get related object URIs - traverse the full path
			if (customGeo.linkGeoId) {
				const geoMatch = findNodeByPath(tree, customGeo.linkGeoId)
				if (geoMatch) {
					customGeo.geoObj.URI = calculateLinkedGeo(geoMatch)
				}
			}

			projectStore.addGeometry(customGeo.geoObj)
		}
	}
}

/**
 * Updates the colors of the groups in the project
 * Autmatically setting all colors, optional to change specific ones
 * @param id Optional: Ids of groups to change
 * @param color Optional: colors to change to
 */
export function updateGroupColors(
	tree: NestedGroup[],
	id: string[] = [],
	color: string[] = []
): void {
	const colorMngr = new ColorManager()
	const colors = colorMngr.getMostDistinctColors(
		tree.length > 0 ? tree.length : 1
	)
	tree.map((group, index) => {
		if (id.includes(group.id)) {
			tree[index].color = color[id.indexOf(group.id)]
		} else {
			tree[index].color = colors[index]
		}
	})
}

/**
 * Set the color based on results, if no object is provided it will set all objects in the project
 * @param objects optional for specfic material updates
 * @param colorRange optional number of steps of colors in the gradient
 * @returns gradient groups with increments for results
 */

export function setResultsColorGroup(
	objects: GeometryObject[] = null,
	// eslint-disable-next-line
	colorRange: number = 10
) {
	const projectStore = useProjectStore()
	const groups: { objectIds: string[]; color: string }[] = []

	//Create all colorRange groups including no results
	const neutralGroup: { objectIds: string[]; color: string } = {
		objectIds: [],
		color: baseColors.primaryGrey
	}

	if (!objects) {
		//Get all objects from the project
		const groups = projectStore.projectGroups
		if (groups) {
			groups.forEach((group) => {
				group.elements.forEach((element) => {
					assignColorGroup(element)
				})
			})
		}
	} else {
		objects.forEach((element) => {
			assignColorGroup(element)
		})
	}

	//Add groups to main
	groups.push(neutralGroup)

	return groups

	function assignColorGroup(object: GeometryObject) {
		if (object && object.results) {
			// Calculate the resultlist for the object
			// TODO: Check if this is super inefficient nice to have it gathered into one function for all results
			const resCalc = new ResultCalculator([object])
			resCalc.aggregate(false)

			// Find the result for the active parameter
			const resItem = resCalc.resultList.find(
				(item) => item.parameter === 'material.name'
			)

			// Extract emissions from the result
			const emissionList = extractEmissionsFromResultItem(resItem)
			const emission = sumEmissions(emissionList)

			// We use a log10 scale, I think it makes sense
			// TODO: Remake this since we are using emission based on BTA and lifespan now so need to recalculate this to work
			const sizeFactor = object ? Math.log10(object.quantity.m2 + 1) : 1
			const normalisedEmissions =
				(emissionToNumber(emission) / object.quantity.m2) * sizeFactor
			//Calculate the color based on the gwp value
			const color = getValueColorFromGradient(
				normalisedEmissions,
				0,
				0.1,
				baseColors.modelGreen,
				baseColors.modelYellow,
				baseColors.modelRed
			)
			groups.push({ objectIds: [object.id], color: color })
		} else {
			//No result mapped set color to grey
			neutralGroup.objectIds.push(object.id)
		}
	}
}

/**
 * Set the color of the material based on if it is mapped or not, if no object is provided it will set all objects in the project
 * @param object optional for specifik material updates
 * @returns greenGroup and redGroup with objectIds and color
 */
export function setMappingColorGroup(objects: GeometryObject[] = null) {
	const projectStore = useProjectStore()
	//Create two groups for the mapping colors, one red and one green and move objects between them to match if mapped materials or not
	const greenGroup: { objectIds: string[]; color: string } = {
		objectIds: [],
		color: baseColors.modelGreen
	}
	const redGroup: { objectIds: string[]; color: string } = {
		objectIds: [],
		color: baseColors.modelRed
	}

	if (!objects) {
		//Get all objects from the project
		const groups = projectStore.projectGroups
		if (groups) {
			groups.forEach((group) => {
				group.elements.forEach((element) => {
					assignColorGroup(element)
				})
			})
		}
	} else {
		objects.forEach((element) => {
			assignColorGroup(element)
		})
	}

	return [greenGroup, redGroup]

	function assignColorGroup(object: GeometryObject) {
		//Check if we have a material to map
		if (object && object.material) {
			//Add the object to the green group
			greenGroup.objectIds.push(object.id)
		} else if (!greenGroup.objectIds.includes(object.id)) {
			//No material mapped
			redGroup.objectIds.push(object.id)
		}
	}
}
