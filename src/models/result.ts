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