import { useProjectStore } from '@/stores/main'

import type { GeometryObject } from '@/models/geometryObject'
import type { LifeCycleStageEmission, Product, Emission } from '@/models/material'
import type { Results } from '@/models/project'

/**
 * EmissionCalculator class to calculate the emissions of geometry objects if none sent calculate for all
 */
export class EmissionCalculator {
  private geo: GeometryObject[] = []
  private impactCategory: string = 'gwp'

  constructor(geo: GeometryObject[] = []) {
    const projectStore = useProjectStore()
    this.geo = geo
    if (projectStore.currProject) {
      // If no geometry is provided, calculate for all geometry objects in the project.
      if (geo.length === 0) {
        this.geo = projectStore.currProject.geometry
      }
      
      if (projectStore.currProject.results == null)
        projectStore.currProject.results = []
    }
  }

   /**
   * Calculate the emissions of the current geo and attach the results to the geo
   * @param geo
   * @returns
   */
  calculateEmissions(): Results | boolean {
    // Go through each geometry object and calculate the emissions
    for (const geo of this.geo) {
      let result: Results | boolean = false
      if (!geo.material) continue

      const emissions: Emission = { 
        [this.impactCategory]: {} as LifeCycleStageEmission }
      const material = geo.material

      if (this.isAssembly(material)) {
        result = this.processAssembly(material, emissions, geo)
      } else {
        result = this.processEPD(material as Product, emissions, geo)
      }

      if (result) {
        result = this.addEmissionsToGeo(emissions, geo)
      }
    }
    return true
  }

  private isAssembly(material: any): material is { materials?: Product[] } {
    return material instanceof Object && 'isAssembly' in material
  }

  private processAssembly(
    material: { materials?: Product[] },
    emissions: Emission,
    geo: GeometryObject
  ): boolean {
    if (!material.materials) return false

    for (const mat of material.materials) {
      if (mat.emission[this.impactCategory]) {
        this.calculateMaterialEmissions(mat, emissions, geo)
      }
    }
    return true
  }

  private processEPD(
    material: Product,
    emissions: Emission,
    geo: GeometryObject
  ): boolean {
    if (material.emission[this.impactCategory]) {
      this.calculateMaterialEmissions(material, emissions, geo)
      return true
    }
    return false
  }

  // Calculate the emissions of the material and add it to the emissions object
  private calculateMaterialEmissions(
    mat: Product,
    emissions: Emission,
    geo: GeometryObject
  ) {
    for (const phase in mat.emission[this.impactCategory]) {
      const value = mat.emission[this.impactCategory][phase]
      if (value !== null && !isNaN(Number(value))) {
        const emissionValue = parseFloat(value as string) * geo.quantity[mat.unit]
        emissions[this.impactCategory][phase] = (emissions[this.impactCategory][phase] || 0) + emissionValue
      }
    }
  }

  /**
   * Attached emissions to Geo object
   * @param geo 
   * @param emissions 
   */
  private addEmissionsToGeo(
    emissions: Emission,
    geo: GeometryObject
  ) {
    const result: Results = {
      id: crypto.randomUUID(),
      date: new Date(),
      emission: emissions,
    }
    if (geo.results) {
      geo.results.push(result)
    } else {
      geo.results = [result]
    }
    return result
  }
}