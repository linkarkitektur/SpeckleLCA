import type { MetricUnits, Assembly, Product } from '@/models/material'
import type { Results } from '@/models/project'

/*
 * Base geometry object.
 */
export interface GeometryObject {
	id: string // UUID
	name: string
	URI?: string // Link to geometry.
	quantity: {
		[k in MetricUnits]: number
	}
	material?: Product | Assembly
	results?: Results[] // List of results if multiple runs are made.
	parameters: {
		[k: string]: string
	}
}
