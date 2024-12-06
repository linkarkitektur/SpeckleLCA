import type { MetricUnits, Assembly, Product } from '@/models/material'
import type { Results } from '@/models/result'

/*
 * Base geometry object.
 */
export interface GeometryObject {
	id: string // UUID
	name: string
	URI?: string // Link to geometry.
	quantity: Quantity
	material?: Product | Assembly
	results?: Results[] // List of results if multiple runs are made.
	parameters: {
		[k: string]: string
	}
}

/**
 * Base quantity object, used for geo, results or materials
 */
export type Quantity = Partial<{
  [unit in MetricUnits]: number
}>