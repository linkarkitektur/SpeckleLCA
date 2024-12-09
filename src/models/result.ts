import type { Emission } from '@/models/material'
import type { Quantity } from '@/models/geometryObject'

/**
 * Grouped results interface to store the results grouped by a parameter
 * These are for precalculated aggregated results.
 */
export interface GroupedResults{
  parameter: string
  data: GroupedEmission
  quantity?: Quantity
}

/**
 * Grouped emission interface to store the emission grouped by a parameter
 */
interface GroupedEmission {
  emission: Emission
  geoId: string[]
}

/**
 * Main interface for storing results, this is the main object that is stored in the database.
 * It contains the results for each parameter that is grouped on and the result with correlation to ids.
 */
export interface ResultItem {
  parameter: string
  displayName: string
  data: GroupedResults[]
  nested?: ResultItem
}

export type ResultList = ResultItem[]

/**
 * Predefined list of ResultItem objects for default use
 */
export const DefaultResultList: ResultList = [
  { parameter: 'parameters.category', displayName: 'Category', data: [] },
  { parameter: 'material.name', displayName: 'Material', data: [] },
  { parameter: 'material.metadata.materialType', displayName: 'Material Type', data: [] },
  { parameter: 'BSABCodes', displayName: 'BSAB Codes', data: [] },
  { parameter: 'parameters.speckle_type', displayName: 'Speckle Type', data: [] },
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