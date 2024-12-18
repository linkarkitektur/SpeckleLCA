/**
 * This file contains utility functions for working with Speckle, including authentication, data fetching, and object conversion.
 *
 * @packageDocumentation
 */
import type { Project } from '@/models/project'
import type { ResponseObject, ResponseObjectStream } from '@/models/speckle'
import type { GeometryObject, Quantity } from '@/models/geometryObject'
import type { MetricUnits } from '@/models/material'

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

import { reportErrorToSentry } from './monitoring'

import { useSpeckleStore } from '@/stores/speckle'
import { useSettingsStore } from '@/stores/settings'


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

			reportErrorToSentry(err as Error)
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

export function convertObjects(input: ResponseObjectStream): Project | null {
	const speckleStore = useSpeckleStore()

	const objects: ResponseObject[] = input.data.stream.object.elements.objects

	const modelObjects = objects.filter(
		(obj) => obj.data.speckle_type !== 'Speckle.Core.Models.DataChunk'
	)
	const projectDetails = speckleStore.getProjectDetails
	const version = speckleStore.getSelectedVersion

	if (projectDetails && version) {
		const geoObjects: GeometryObject[] = []

		modelObjects.forEach((el) => {
			const quantity = calculateQuantity(el)

			const name: string = el.data.name ? el.data.name : el.data.speckle_type

			const obj: GeometryObject = {
				id: el.id,
				name: name,
				quantity: quantity,
				parameters: el.data,
				URI: el.id
			}

			geoObjects.push(obj)
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
 * Calculates the quantity of different units in the given ResponseObject.
 *
 * @param obj The ResponseObject containing the data to calculate the quantity from.
 * @returns An object representing the quantity of different units.
 */
export function calculateQuantity(obj: ResponseObject) {
	const quantity: Quantity = {
		m2: 0,
	}

	// Initial parameters we search for, can be added upon should maybe be moved from here to a model file instead
	// TODO create a populated interface for this
	const searchObject = [
		{
			searchValue: 'area',
			metric: 'm2',
			mmConversion: 1000000
		},
		{
			searchValue: 'volume',
			metric: 'm3',
			mmConversion: 1000000000
		},
		{
			searchValue: 'length',
			metric: 'm',
			mmConversion: 1000
		}
	]

	// Recursive search for key values in object properties
	const searchNested = (
		data: { [key: string]: any },
		sObj: { searchValue: string; metric: string; mmConversion: number }
	) => {
		for (const key in data) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				if (typeof data[key] === 'object' && data[key] !== null) {
					// If the current property is an object, recursively search
					searchNested(data[key], sObj)
				} else if (
					typeof data[key] === 'string' &&
					data[key].toLowerCase() == sObj.searchValue
				) {
					// If the property is a string and matches the search value, set the quantity
					let value = data[key]
					if (typeof value === 'string') {
						value = data['value']
					}
					quantity[sObj.metric] = value
				} else if (key == sObj.searchValue) {
					// If the property is a string and matches the search value, set the quantity
					let value = data[key]

					if (typeof value === 'string') {
						value = data['value']
					}
					//TODO Make more conversions
					if (data['units'] == 'mm') {
						value = value / sObj.mmConversion
					}

					quantity[sObj.metric] = value
				}
			}	
		}
	}

	// Start recursive search on the object
	// TODO this should probably be optimized, could become slow on large projects or atleast add a loading bar
	if (obj.data) {
		searchObject.forEach((sObj) => {
			searchNested(obj.data, sObj)
		})
	}
	return quantity
}
