import type { GeometryObject } from './geometryModel'
import type { Emission } from './materialModel'
import type { Results } from './resultModel'

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