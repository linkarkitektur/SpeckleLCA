import type { EPD } from 'lcax'
import type { Results } from '@/models/project'
import type { FilterList } from './filters'

// Material and Assembly interfaces

export enum Source {
  UserDefined,
  OrganisationStandard,
  Generated,
}

/**
 * Assembly interface, stores all metadata of the assembly.
 * Materials are stored as EPD and thickness.
 * Result is stored as a reference to the results object so it can be accessed directly without calcs.
 */
export interface Assembly {
	id: string
	name: string
	source: Source
	location?: string
	materials: [
		{
			EPD: EPD
			thickness: number
		}
	]
	sqm?: number
	result: Results
}

/**
 * Mapping step used in saving and restoring mappings
 */
export interface MappingStep {
	filterId: string
	nestedGroupId: string
	material: EPD | Assembly
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
	selected: boolean
}

/**
 * Sorting option for material and assembly list.
 */
export interface MaterialSortingOption {
	parameter: string
	direction: string
}
