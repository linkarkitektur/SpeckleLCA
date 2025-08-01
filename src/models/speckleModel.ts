/**
 * Represents a version of a Speckle object.
 */
export interface Version {
	authorName: string // The name of the author who created the version.
	branchName: string // The name of the model that the version belongs to.
	createdAt: Date // The date and time when the version was created.
	id: string // The unique identifier of the version.
	message: string // A message describing the changes made in the version.
	referencedObject: string // The unique identifier of the object that the version is based on.
	sourceApplication: string // The name of the application used to create the version.
}

/**
 * Represents the details of a Speckle project.
 */
export interface ProjectDetails {
	project: {
		name: string
		updatedAt: Date
		id: string
		models: {
			totalCount: number
			items: {
				id: string
				name: string
				versions: {
					items: {
						id: string
						message: string
						sourceApplication: string
						referencedObject: string
						createdAt: Date
						authorUser: {
							id: string
							name: string
						}
					}[]
				}
			}[]
		}
	}
}

/**
 * Represents a Speckle version identifier.
 */
export interface VersionId {
	id: string // The unique identifier of the version.
	name: string // The name of the version.
}

/**
 * Represents a collection of Speckle models and their versions.
 */
export interface ModelsAndVersions {
	[modelName: string]: Version[] // An object where the keys are model names and the values are arrays of versions of the model.
}

/**
 * Represents a Speckle user.
 */
export interface User {
	name: string // The name of the user.
	id: string // The unique identifier of the user.
	avatar: string // The URL of the user's avatar.
}

/**
 * Represents information about a Speckle server.
 */
export interface ServerInfo {
	name: string // The name of the Speckle server.
	company: string // The name of the company that operates the Speckle server.
}

/**
 * Minimum information needed for project list.
 */
export interface ProjectId {
	name: string // The name of the project
	id: string // The id of the project
	latestModelId?: string // The id of the latest model
	updatedAt: Date // The last update of the project
}

/**
 * Parameter speckle object information
 */
export interface ObjectParameter {
	id: string // Unique id of parameter
	name: string // The name of the parameter
	value?: string // Value of the parameter
	parentId?: string // Unique id of the parameters parent if it has any
}

/**
 * Response from speckle graphql API when getting objects
 */
export interface ResponseObjectStream {
	data: {
		project: {
			object: {
				totalChildrenCount: number
				elements: {
					objects: ResponseObject[]
				}
			}
		}
	}
}

/**
 * Objects that are returned from speckle graphql API
 */
export interface ResponseObject {
	id: string
	data: {
		id: string
		data: any[]
		speckle_type: string
		applicationId: string | null
		totalChildrenCount: number
		[key: string]: any // Flexible key:strings that you can expand with more
	}
}

/**
 * Response from speckle graphql API when getting projects and latest Model
 */
export interface ModelResponseObject {
	data: {
		project: {
			models: {
				items: {
					id: string
				}[]
			}
		}
	}
}

/**
 * Object to use in updating viewer stat bubbles.
 */
export interface ViewerStats {
	names: string[]
	vals: object[]
}

/**
 * Speckle viewer sunLight default Configuration
 */
export interface LightConfiguration {
	enabled?: boolean
	castShadow?: boolean
	intensity?: number
	color?: number
	indirectLightIntensity?: number
}

/**
 * Speckle viewer sunLight Configuration
 */
export interface SunLightConfiguration extends LightConfiguration {
	elevation?: number
	azimuth?: number
	radius?: number
}

/**
 * Speckle viewer ColorGroups for setUserObjectColors
 */
export interface ColorGroup {
	objectIds: string[]
	color: string
}
