import type { Emission, Product, Assembly } from '@/models/material'

/**
 * Results interface per material to store the material and its total emissions
 */
export interface MaterialResults {
  [id: string] : MaterialEmission 
}

/**
 * Material emission interface to store the material and its total emissions
 */
export interface MaterialEmission {
  material: Product | Assembly
  emission: Emission
  geoId: string[]
}

/**
 * Grouped results interface to store the results grouped by a parameter
 * These are for precalculated aggregated results.
 */
export interface GroupedResults{
  parameter: string
  data: GroupedEmission
}[]

/**
 * Grouped emission interface to store the emission grouped by a parameter
 */
export interface GroupedEmission {
  emission: Emission
  geoId: string[]
}

interface ResultItem {
  parameter: string
  displayName: string
  data: GroupedResults[] 
}

export type ResultList = ResultItem[]

/**
 * List for storing groupedEmissions in, we include the most common 
 */
export const ResultList: ResultList = [
  { parameter: 'parameters.category', displayName: 'Category', data: [] as GroupedResults[] },
  { parameter: 'material.name', displayName: 'Material', data: [] as GroupedResults[] },
  { parameter: 'material.metadata.materialType', displayName: 'Material Type', data: [] as GroupedResults[] },
  { parameter: 'BSABCodes', displayName: 'BSAB Codes', data: [] as GroupedResults[] },
  { parameter: 'parameters.speckle_type', displayName: 'Speckle Type', data: [] as GroupedResults[] },
]

/**
 * Results are stored as Impact Category, Life Cycle Stage then emission value.
 * Optional parameter for aggregated results and what parameter is grouped on.
 * ID and date is just for documentation.
 */
export interface Results {
	id: string // Run ID for results.
	date: Date
	emission: Emission
}