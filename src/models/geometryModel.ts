import type { MetricUnits, Assembly, Product } from '@/models/materialModel'
import type { Results } from '@/models/resultModel'

/*
 * Base geometry object.
 */
export interface GeometryObject {
	id: string // UUID
	name: string
	URI?: string[] // Links to geometry.
	quantity: Quantity
	material?: Product | Assembly
	results?: Results[] // List of results if multiple runs are made.
	subPart?: boolean // If this object is the result of either a manual split or a model with modeled material layers
	simpleParameters: SimpleParameters
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

/**
 * Simplified parameter object, used for new users and filtering
 */
export interface SimpleParameters {
	category: string
	type: string
	code: string
	materialName: string
	m: number
	m2: number
	m3: number
}
