import type { EPD } from 'lcax'
import type { Results } from '@/models/project'

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
	isAssembly: boolean
}

/**
 * Mapping interface, stores all metadata of the mapping.
 * TODO: This is on object basis now, might be to much to store? Maybe make a similar approach as to filterings?
 */
export interface Mapping {
  id: string
  name: string
  materials: [{
    objId: string
    material: EPD | Assembly
  }]
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
