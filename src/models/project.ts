import type { GeometryObject } from './geometryObject'
import type { Emission } from './material'
import type { Results } from './result'

/**
 * Project interface, stores all geometry and metadata of the project.
 */
export interface Project {
	name: string
	description: string
	id: string
	geometry: GeometryObject[]
	sqm?: number
	projectType?: string
	softwareSource?: string
	location?: string
	results?: Results[]
}