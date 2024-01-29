import type { EPD } from 'lcax'
import type { GeometryObject } from './geometryObject'

enum Source {
  UserDefined,
  OrganisationStandard,
  Generated,
}

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
  emission: {
    [impactCategory: string]: {
      [lifeCycleStage: string]: number
    }
  } // GWP -> A1A3 -> Co2
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
  materials: [{
    EPD: EPD
    thickness: number
  }]
  sqm?: number
  result: Results
}