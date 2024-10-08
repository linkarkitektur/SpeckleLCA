import type { 
	LifeCycleStage, 
	ImpactCategoryKey, 
	Assembly as LcaxAssembly,
	Product as LcaxProduct 
} from 'lcax'
import type { FilterList } from './filters'

// Material and Assembly interfaces

export enum Source {
  UserDefined,
  OrganisationStandard,
  Generated,
}


export type Emission = Partial<{
	[impactCategory in ImpactCategoryKey]: 
		LifeCycleStageEmission
}>

export type LifeCycleStageEmission = {
	[lifecycleStage in LifeCycleStage]: {
		amount: number
	}
}

/**
 * Product interface, extends LcaxProduct and adds emission data
 */
export interface Product extends LcaxProduct {
  emission: Emission
}

/**
 * Assembly interface, extends LcaxAssembly and adds emission data and replaces products with local one
 */
export interface Assembly extends Omit<LcaxAssembly, 'products'> {
	products: Record<string, Product>
	emission: Emission
}

/**
 * Mapping step used in saving and restoring mappings
 */
export interface MappingStep {
	filterId: string
	nestedGroupId: string
	material: Product | Assembly
}

/**
 * Mapping interface, stores all metadata of the mapping.
 * Keeps a list of all filters so we dont have to cross reference with relationships
 */
export interface Mapping {
  id: string
  name: string
	filters: FilterList[]  
	steps: MappingStep[]
}

/**
 * Filter parameters for material and assembly list.
 */
export interface MaterialFilterParam {
	name: string,
	selected: boolean,
	filterParamter: string
}

/**
 * Sorting option for material and assembly list.
 */
export interface MaterialSortingOption {
	parameter: string
	direction: string
}

/**
 * Units for materials and assemblies.
 */
export type MetricUnits = "m" | "m2" | "m3" | "pcs" | "kg" | "l" | "tonnes"