import type { Emission, Product, Assembly } from '@/models/material'

/**
 * Results interface per material to store the material and its total emissions
 */
export interface MaterialResults {
  material: Product | Assembly
  emission: Emission
}