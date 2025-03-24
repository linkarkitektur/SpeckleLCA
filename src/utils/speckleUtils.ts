/**
 * This file contains utility functions for working with Speckle, including authentication, data fetching, and object conversion.
 *
 * @packageDocumentation
 */
import type { Project } from '@/models/projectModel'
import type { ResponseObject, ResponseObjectStream, Version } from '@/models/speckleModel'
import type { GeometryObject, Quantity } from '@/models/geometryModel'
import type { QuantityConversionSpec } from '@/models/materialModel'

import { selectedObjectsQuery } from '@/graphql/speckleQueries'
import { speckleSelection } from '@/graphql/speckleVariables'
import {
	latestStreamsQuery,
	projectVersionsQuery,
	streamObjectQuery,
	streamSearchQuery,
	userInfoQuery,
	modelIdQuery
} from '@/graphql/speckleQueries'

import { useSpeckleStore } from '@/stores/speckleStore'
import { useSettingsStore } from '@/stores/settingStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { useProjectStore } from '@/stores/projectStore'

import router from '@/router'

import { getTextAfterLastDot } from './stringUtils'

export const APP_NAME = 'SpeckLCA'

export const TOKEN = `${APP_NAME}.AuthToken`
export const REFRESH_TOKEN = `${APP_NAME}.RefreshToken`
export const CHALLENGE = `${APP_NAME}.Challenge`

// TODO Update all these to Project, Model and Version terminology.

/**
 * Redirects the user to the Speckle authentication page.
 * Generates a random challenge, saves it in localStorage, and redirects the user to the authentication page.
 */
export function navigateToAuthPage() {
	const settingsStore = useSettingsStore()
	// Generate random challenge.
	const challenge =
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)

	// Save challenge in localStorage.
	localStorage.setItem(CHALLENGE, challenge)

	// Send user to auth page.
	window.location.href = `${settingsStore.keySettings.speckleConfig.serverUrl}/authn/verify/${
		settingsStore.keySettings.speckleConfig.id
	}/${challenge}`
}

/**
 * Logs out the user by removing the token and refreshToken from localStorage.
 */
export function speckleLogOut() {
	// Remove both token and refreshToken from localStorage
	localStorage.removeItem(TOKEN)
	localStorage.removeItem(REFRESH_TOKEN)
}

/**
 * Exchanges the access code for a token and refresh token.
 * @param accessCode The access code to exchange.
 * @returns A promise that resolves to the response data.
 */
export async function exchangeAccessCode(accessCode: string) {
	const settingsStore = useSettingsStore()
	const res = await fetch(`${settingsStore.keySettings.speckleConfig.serverUrl}/auth/token/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			accessCode: accessCode,
			appId: settingsStore.keySettings.speckleConfig.id,
			appSecret: settingsStore.keySettings.speckleConfig.secret,
			challenge: localStorage.getItem(CHALLENGE)
		})
	})

	/**
	 * Try retrieving the token.
	 * If successful, remove challenge and set the new token and refresh token.
	 * */
	const data = await res.json()
	if (data.token) {
		localStorage.removeItem(CHALLENGE)
		localStorage.setItem(TOKEN, data.token)
		localStorage.setItem(REFRESH_TOKEN, data.refreshToken)
	}
	return data
}

/**
 * Fetches data from the Speckle server using GraphQL.
 * @param query - The GraphQL query string.
 * @param vars - Optional variables to be passed with the query.
 * @returns A Promise that resolves to the fetched data.
 * @throws If the API call fails or the user is not logged in.
 */
export async function speckleFetch(
	query: string,
	vars?: { [key: string]: any }
) {
	const settingsStore = useSettingsStore()
	const token = localStorage.getItem(TOKEN)
	if (token)
		try {
			const res = await fetch(`${settingsStore.keySettings.speckleConfig.serverUrl}/graphql`, {
				method: 'POST',
				headers: {
					Authorization: 'Bearer ' + token,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query: query,
					variables: vars || null
				})
			})
			const data = await res.json()
			return data
		} catch (err) {
			const msg = 'API call failed!'

			console.error(msg, err)

			return Promise.reject(msg)
		}
	else return Promise.reject('You are not logged in. (Token does not exist.)')
}

// Fetch the current user data using the userInfoQuery
export const getUserData = () => speckleFetch(userInfoQuery)

// Fetch for streams matching the specified text using the streamSearchQuery
export function searchStreams(variables: string) {
	const vars = { var: variables }
	speckleFetch(streamSearchQuery, vars)
}

// Get versions related to a specific project, allows for pagination by passing a cursor
export function getProjectVersions(
	projectId: string,
	itemsPerPage: number,
	cursor: Date | null
) {
	return speckleFetch(projectVersionsQuery, {
		id: projectId,
		cursor,
		limit: itemsPerPage
	})
}

// Get a specific object from a specific stream
export function getObject(streamId: string, objectId: string) {
	return speckleFetch(streamObjectQuery, { streamId, objectId })
}

// Get the latest projects
export function getProjectsData() {
	return speckleFetch(latestStreamsQuery)
}

// Get the latest model for a specific project
export function getLatestModel(projectId: string) {
	return speckleFetch(modelIdQuery, { projectId })
}

/**
 * Get object parameters for a stream and specific referenced object.
 * The parameters will be dynamic for the sourceapplication that was used when sending to Speckle
 * @param streamId
 * @param objectId
 * @param sourceApplication
 */
export async function getObjectParameters(
	streamId: string,
	objectId: string,
	sourceApplication: string
) {
	const selection = speckleSelection(sourceApplication)
	return await speckleFetch(selectedObjectsQuery, {
		streamId: streamId,
		objectId: objectId,
		selection: selection
	})
}

/**
 * Load selected or most recent version into the project store and navigating to dashboard view
 * @param reRoute If we should reroute to the dashboard page or not, set to false for lazyload
 */
export async function loadProject(reRoute: boolean) {
	const speckleStore = useSpeckleStore()
	const navStore = useNavigationStore()
	const projectStore = useProjectStore()

  let version: Version
	if (reRoute)
		navStore.toggleLoading()

  if (speckleStore.getProjectDetails) {
    // Try to find the project version in the store.
    const versionFound =
      speckleStore.getProjectDetails.stream.commits.items.find(
        (obj) => obj.id === speckleStore.getSelectedVersion?.id
      )

    // If the version was found, set the version and update the store.
    if (versionFound) {
      version = versionFound
      speckleStore.setSelectedVersion(version)
    } else {
      const latestVersion = speckleStore.getProjectDetails.stream.commits.items[0]
      speckleStore.setSelectedVersion(latestVersion)
    }
  } else {
    console.error('Project store object is undefined.')
  }

 // Attempt to get project objects from Speckle and then convert them.
  const objects: ResponseObjectStream = await speckleStore.getObjects()
  const project: Project | null = convertObjects(objects)

  // If project is not null, create it in the project store.
  if (project) {
    projectStore.createNewProject(project)
  } else {
    console.error('Could not create project from Speckle.')
  }

	// Switch to dashboard view
	if (reRoute) {
		navStore.setActivePage('Filtering')
		navStore.toggleLoading()
		router.push('/dashboard')
	}
}

/**
 * Main conversion and import function
 * @param input 
 * @returns 
 */
export function convertObjects(input: ResponseObjectStream): Project | null {
	const speckleStore = useSpeckleStore()

	const objects: ResponseObject[] = input.data.stream.object.elements.objects

	const materialObjects = objects
		.filter((obj) => obj.data.speckle_type.includes('Objects.Other.Material') 
			&& obj.data.speckle_type !== 'Objects.Other.MaterialQuantity')

	// Filter out some common support objects which we never want to filter
	// Expand this list if needed
	const modelObjects = objects.filter((obj) => {
		// Remove the displayValue key if it exists as an array
		if (Array.isArray(obj.data.displayValue)) {
			delete obj.data.displayValue
		}
		// Remove closure
		if (obj.data.__closure)
			delete obj.data.__closure
		
		// Apply your filtering criteria
		return obj.data.speckle_type !== 'Speckle.Core.Models.DataChunk'
			&& obj.data.speckle_type !== 'Speckle.Core.Models.Collection'
			&& !obj.data.speckle_type.includes('Objects.Other.Material')
	})

	const projectDetails = speckleStore.getProjectDetails
	const version = speckleStore.getSelectedVersion

	if (projectDetails && version) {
		const geoObjects: GeometryObject[] = []

		modelObjects.forEach((el) => {
			let quantity: Quantity
			// If this is a composite we split it into its parts and create new objects from them
			if (el.data.materialQuantities) {
				el.data.materialQuantities.forEach((mat) => {
					quantity = quantityFromComposite(mat)
					const name: string = el.data.name ? el.data.name : el.data.speckle_type

					const matName = materialObjects.find((obj) => obj.id === mat.material?.referencedId)?.data.name

					const parameters = { ...el.data }

					// Sanitize speckle_type
					if (parameters.speckle_type) {
						const sanitizedType = getTextAfterLastDot(parameters.speckle_type)
						parameters.speckle_type = sanitizedType
					}

					parameters.buildingMaterialName = matName

					const obj: GeometryObject = {
						id: el.id,
						name: name,
						quantity: quantity,
						parameters: parameters,
						URI: el.id,
						subPart: true
					}

					geoObjects.push(obj)
				})
			} else {
				quantity = calculateQuantity(el)
				const name: string = el.data.name ? el.data.name : el.data.speckle_type

				const parameters = { ...el.data }
				
				// Sanitize speckle_type
				if (parameters.speckle_type) {
					const sanitizedType = getTextAfterLastDot(parameters.speckle_type)
					parameters.speckle_type = sanitizedType
				}

				const obj: GeometryObject = {
					id: el.id,
					name: name,
					quantity: quantity,
					parameters: parameters,
					URI: el.id,
					subPart: false
				}
	
				geoObjects.push(obj)
			}
		})

		const project: Project = {
			name: projectDetails.stream.name,
			id: projectDetails.stream.id,
			description: version.message,
			geometry: geoObjects
		}
		return project
	}
	return null
}

/** 
 * Field map for the different units we care about.
 * TODO: Move this to model and make a type of it
 */
const FIELD_MAP: Record<string, QuantityConversionSpec> = {
	area: { metric: 'm2', mmConversion: 1_000_000 },
	surfaceArea: { metric: 'm2', mmConversion: 1_000_000 },
	volume: { metric: 'm3', mmConversion: 1_000_000_000 },
	length: { metric: 'm', mmConversion: 1_000 },
}

/**
 * Updates the provided quantity object for a given field.
 *
 * @param obj The current object containing the value and possibly a units property.
 * @param quantity The quantity object to update.
 * @param field The field name (or its value) indicating what is being measured.
 * @param value The raw value to convert and assign.
 */
function updateQuantityForField(obj: any, quantity: Quantity, field: string, value: any) {
	const fieldSpec = FIELD_MAP[field.toLowerCase()]
	if (!fieldSpec) return

	let numericValue = extractValue(obj, value)
	if (obj.units === 'mm') {
		numericValue = numericValue / fieldSpec.mmConversion
	}
	quantity[fieldSpec.metric] = numericValue
}

/**
 * Processes a single key-value entry in an object.
 *
 * It checks:
 * 1. If the key itself matches a field name we care about.
 * 2. If the value (when it is a string) matches a field name.
 *
 * @param obj The object containing the entry.
 * @param key The key from the entry.
 * @param value The value from the entry.
 * @param quantity The quantity object to update.
 */
function processEntry(
	obj: any, 
	key: string, 
	value: any, 
	quantity: Quantity,
	processed: Set<string>
) {
	// 1) Check if the key is something we care about.
	const fieldSpecKey = FIELD_MAP[key.toLowerCase()]
	if (fieldSpecKey && !processed.has(fieldSpecKey.metric)) {
		updateQuantityForField(obj, quantity, key, value)
		processed.add(fieldSpecKey.metric)
	}

	// 2) Check if the value (when it's a string) is a field we care about.
	if (typeof value === 'string') {
		if (FIELD_MAP[value.toLowerCase()]) {
			const fieldSpecVal = FIELD_MAP[value.toLowerCase()]
			if (fieldSpecVal || !processed.has(fieldSpecVal.metric)) {
				// Here, we assume the numeric value is stored in obj.value.
				updateQuantityForField(obj, quantity, value, obj.value)
				processed.add(fieldSpecVal.metric)
			}
		}
	}
}

/**
 * Recursively traverses an object to process all entries for quantity calculation.
 *
 * @param data The object (or sub-object) to traverse.
 * @param quantity The quantity object to update.
 */
function traverseObject(data: any, quantity: Quantity, processed: Set<string>) {
	if (!data || typeof data !== 'object') return

	for (const [key, value] of Object.entries(data)) {
		// If the value is an object, traverse it recursively.
		if (value && typeof value === 'object') {
			traverseObject(value, quantity, processed)
		} else {
			processEntry(data, key, value, quantity, processed)
		}
	}
}

/**
 * A small helper to safely extract a numeric value.
 *
 * @param obj The object from which the value comes.
 * @param val The value to attempt conversion on.
 * @returns A number extracted from val or a fallback from obj.value.
 */
function extractValue(obj: any, val: any): number {
	if (typeof val === 'number') return val

	// If we see a string but expect a number, try parsing it.
	if (typeof val === 'string') {
		const num = parseFloat(val)
		if (!isNaN(num)) return num

		// Fallback to obj.value if that’s how your data is structured.
		if (typeof obj.value === 'number') {
			return obj.value
		}
	}

	// Fallback if nothing matched.
	return 0
}

/**
 * Calculates the quantity of different units in the given ResponseObject.
 *
 * @param obj The ResponseObject containing the data to calculate the quantity from.
 * @returns An object representing the quantity of different units.
 */
export function calculateQuantity(obj: ResponseObject) {
	const quantity: Quantity = {
		m2: 0,
	}

	// If no data, return the empty quantity.
	if (!obj.data) return quantity

	const processed = new Set<string>()
	traverseObject(obj.data, quantity, processed)
	return quantity
}

/**
 * Calculates the quantity from a composite material object.
 *
 * This version only processes the top-level keys (no recursion).
 *
 * @param mat The composite material object.
 * @returns An object representing the quantity of different units.
 */
export function quantityFromComposite(mat: any): Quantity {
	const quantity: Quantity = {
		m2: 0,
	}

	const processed = new Set<string>()

	for (const [key, value] of Object.entries(mat)) {
		processEntry(mat, key, value, quantity, processed)
	}

	return quantity
}
