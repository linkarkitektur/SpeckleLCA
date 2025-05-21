import type { GeometryObject } from '@/models/geometryModel'
import type { Results } from '@/models/resultModel'

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
