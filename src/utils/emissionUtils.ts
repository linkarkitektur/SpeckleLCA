import { useProjectStore } from '@/stores/main'
import { useSettingsStore } from '@/stores/settings'
import { isAssembly } from '@/utils/EPDUtils'

import type { GeometryObject } from '@/models/geometryObject'
import type { LifeCycleStageEmission, Product, Emission, Assembly } from '@/models/material'
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
        result = this.processAssembly(material as Assembly, emissions, geo)
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
    assembly: Assembly,
    emissions: Emission,
    geo: GeometryObject
  ): boolean {
    const products = assembly.products
    for (const [_, product] of Object.entries(products)) {
      if (product.emission) {
        this.calculateMaterialEmissions(product, emissions, geo)
      }
    }
    return true
  }

  private processEPD(
    material: Product,
    emissions: Emission,
    geo: GeometryObject
  ): boolean {
    if (material.emission) {
      if (this.calculateMaterialEmissions(material, emissions, geo))
        return true
      else 
        return false
    }
    return false
  }

  // Calculate the emissions of the material and add it to the emissions object
  // TODO this should calculate for all impact categories and then just show the relevant one, its other way around now.
  private calculateMaterialEmissions(
    product: Product,
    emissions: Emission,
    geo: GeometryObject
  ): boolean {
    const impactCategory = this.settingsStore.calculationSettings.standardImpactCategory
    let matEmission: LifeCycleStageEmission = product.emission[impactCategory]
    // Check if we have the emission for the selected impact category, if not use gwp as fallback
    if (!product.emission[impactCategory]) {
      if (!product.emission['gwp'])
        return false
      matEmission = product.emission['gwp']
    }

    // Check if we have the emission else add it as empty object
    if (!emissions[impactCategory]) {
      emissions[impactCategory] = {} as LifeCycleStageEmission
    }

    for (const phase in matEmission) {
      // Check if the phase is included in the calculation settings, if not skip it
      if (this.settingsStore.calculationSettings.includedStages.relevantStages.some(
        (stage) => phase === stage.stage && stage.included)
      ){
        let value = matEmission[phase]
        if (value === undefined) value = matEmission[phase]
        if (value !== null && !isNaN(Number(value))) {
          const emissionValue = parseFloat(value as string) * geo.quantity[product.unit]
  
          if (!emissions[impactCategory][phase]) {
            emissions[impactCategory][phase] = 0
          }
  
          const currentAmount = emissions[impactCategory][phase] || 0
          emissions[impactCategory][phase] = currentAmount + emissionValue
        }
      }
    }
    return true
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