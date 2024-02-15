import type { Unit, EPD } from 'lcax'
import type { Assembly, Results } from '@/models/project'

/*
 * Base geometry object.
 */
export interface GeometryObject {
	id: string // UUID
	name: string
	URI?: string // Link to geometry.
	quantity: {
		[k in Unit]: number
	}
	material?: EPD | Assembly
	results?: Results[] // List of results if multiple runs are made.
	parameters: {
		[k: string]: string
	}
}
