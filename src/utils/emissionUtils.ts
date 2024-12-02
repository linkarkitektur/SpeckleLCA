import { useProjectStore } from '@/stores/main'
import { useSettingsStore } from '@/stores/settings'
import { isAssembly } from '@/utils/EPDUtils'

import type { GeometryObject } from '@/models/geometryObject'
import type { LifeCycleStageEmission, Product, Emission } from '@/models/material'
import type { Results } from '@/models/result'

/**
 * EmissionCalculator class to calculate the emissions of geometry objects if none sent calculate for all
 */
export class EmissionCalculator {
  private geo: GeometryObject[] = []
  private settingsStore = useSettingsStore()

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
        [this.settingsStore.calculationSettings.standardImpactCategory]: {} as LifeCycleStageEmission }
      const material = geo.material

      if (isAssembly(material)) {
        const products = material.products
        result = this.processAssembly(products, emissions, geo)
      } else {
        result = this.processEPD(material as Product, emissions, geo)
      }

      if (result) {
        result = this.addEmissionsToGeo(emissions, geo)
      }
    }
    return true
  }

  private processAssembly(
    material: { materials?: Product[] },
    emissions: Emission,
    geo: GeometryObject
  ): boolean {
    if (!material.materials) return false

    for (const mat of material.materials) {
      if (mat.emission[this.settingsStore.calculationSettings.standardImpactCategory]) {
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
    if (material.emission[this.settingsStore.calculationSettings.standardImpactCategory]) {
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
    const impactCategory = this.settingsStore.calculationSettings.standardImpactCategory
    const matEmission = mat.emission[impactCategory]

    if (!emissions[impactCategory]) {
      emissions[impactCategory] = {} as LifeCycleStageEmission
    }
    

    for (const phase in matEmission) {
      // Check if the phase is included in the calculation settings, if not skip it
      if (this.settingsStore.calculationSettings.includedStages.relevantStages.some(
        (stage) => phase === stage.stage)
      ){
        let value = matEmission[phase]
        if (value === undefined) value = matEmission[phase]
        if (value !== null && !isNaN(Number(value))) {
          const emissionValue = parseFloat(value as string) * geo.quantity[mat.unit]
  
          if (!emissions[impactCategory][phase]) {
            emissions[impactCategory][phase] = 0
          }
  
          const currentAmount = emissions[impactCategory][phase] || 0
          emissions[impactCategory][phase] = currentAmount + emissionValue
        }
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