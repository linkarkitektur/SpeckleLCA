import type { EPD } from 'lcax'
import type { GeometryObject } from './geometryObject'

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
	source?: string
	location?: string
	results?: Results[]
}

/**
 * Results are stored as Impact Category, Life Cycle Stage then emission value
 * ID and date is just for documentation.
 */
export interface Results {
	id: string // Run ID for results.
	date: Date
	emission: Emissions
}

/**
 * Emission information, stored as Impact Category, Life Cycle Stage then emission value.
 * example, GWP -> A1A3 -> 105 kgCO2e
 */
export interface Emissions {
	[impactCategory: string]: {
		[lifeCycleStage: string]: number
	}
}