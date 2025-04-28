import { useProjectStore } from '@/stores/projectStore'
import { useSettingsStore } from '@/stores/settingStore'
import { isAssembly } from '@/utils/EPDUtils'

import type { GeometryObject } from '@/models/geometryModel'
import type { LifeCycleStageEmission, Product, Emission, Assembly } from '@/models/materialModel'
import type { Results } from '@/models/resultModel'

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
   * @returns true if calculation was successful
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
    for (const product of Object.values(products)) {
      // Create a deep copy of the geometry object for this calculation
      const tempGeo: GeometryObject = {
        ...geo,
        quantity: { ...geo.quantity },
        parameters: { ...geo.parameters },
        simpleParameters: { ...geo.simpleParameters }
      }
      
      // Calculate m3 from m2 and thickness for this assembly product
					// @ts-expect-error issue with anyvalue
      tempGeo.quantity.m3 = tempGeo.quantity.m2 * (parseFloat(product.metaData.thickness) / 1000)

      if (product.emission) {
        this.calculateMaterialEmissions(product, emissions, tempGeo)
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

    // Get material fraction or default to 100%
    const materialFraction = product.materialFraction ? product.materialFraction / 100 : 1
    
    // Calculate number of replacements needed during project lifespan
    const projectLifespan = this.settingsStore.projectSettings.lifespan
    const replacements = product.lifespan ? Math.max(0, Math.ceil(projectLifespan / product.lifespan) - 1) : 0

    // First calculate base emissions for all stages
    for (const stage in matEmission) {
      // Check if the stage is included in the calculation settings, if not skip it
      if (this.settingsStore.calculationSettings.includedStages.relevantStages.some(
        (relStage) => relStage.stage === stage && relStage.included)
      ){
        let value = matEmission[stage]
        if (value === undefined) value = matEmission[stage]
        
        // Take the emissions, quantity of the unit and material fraction and multiply them
        if (value !== null && !isNaN(Number(value))) {
          const emissionValue = parseFloat(value as string) * geo.quantity[product.unit] * materialFraction

          if (!emissions[impactCategory][stage]) {
            emissions[impactCategory][stage] = 0
          }
  
          const currentAmount = emissions[impactCategory][stage] || 0
          emissions[impactCategory][stage] = currentAmount + emissionValue
        }
      }
    }

    // Danish adaptations, replace B4 for now
    if (replacements > 0 && this.settingsStore.calculationSettings.replaceB4WithProductionStages) {
      // Determine B4 emission based on setting
      const b4Emission = (emissions[impactCategory]['a1a3'] || 0) + 
      (emissions[impactCategory]['a4'] || 0) + 
      (emissions[impactCategory]['a5'] || 0)
     
      if (b4Emission > 0) {
        const totalB4Emission = b4Emission * replacements
        if (!emissions[impactCategory]['b4']) {
          emissions[impactCategory]['b4'] = 0
        }
        emissions[impactCategory]['b4'] += totalB4Emission
      }
    }

    return true
  }

  /**
   * Attached emissions to Geo object
   * @param emissions The emissions to attach
   * @param geo The geometry object to attach to
   */
  private addEmissionsToGeo(
    emissions: Emission,
    geo: GeometryObject
  ): Results {
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