import { useResultStore } from '@/stores/result'
import { useProjectStore } from '@/stores/main'

import type { ChartData } from '@/models/chartModels'
import type { GeometryObject } from '@/models/geometryObject'
import type { Product, Assembly, Emission } from '@/models/material'
import type { MaterialResults } from '@/models/result'
import { Results } from '@/models/project'

/**
 * Converter of geometry object results into aggregated ChartData for specific LifeCycleStages (LCS)
 * @param objects geometry objects to convert
 * @param impactCategory optional impact category to get results for that category
 * @param resultKey optional key to get specific result
 */
export function geometryToLCSChartData(objects: GeometryObject[], impactCategory: string = 'gwp', resultKey: number = Number.MIN_SAFE_INTEGER): ChartData[] {
  const groupedData = new Map<string, number>()

  // Go through each selected object and get aggregated labels and emission data
  for (const obj of objects) {
    const results = obj.results
    if (!results) continue

    // Check if we got any resultKey otherwise just take the last one
    const result = resultKey === Number.MIN_SAFE_INTEGER ? results[results.length - 1] : results[resultKey]
    if (!result || !result.emission) continue

    for (const lifeCycleStage in result.emission[impactCategory]) {
      const currentValue = groupedData.get(lifeCycleStage) || 0
      groupedData.set(lifeCycleStage, currentValue + result.emission[impactCategory][lifeCycleStage])
    }
  }

  const data: ChartData[] = Array.from(groupedData, ([lifeCycleStage, value]) => ({
    label: lifeCycleStage,
    value: Math.round(value)
  }))

  return data
}

/**
 * Converter of geometry object results into aggregated ChartData for all unique materials
 * @param objects geometry objects to convert
 * @param impactCategory optional impact category to get results for that category
 * @param resultKey optional key to get specific result
 */
export function geometryToMaterialChartData(objects: GeometryObject[], impactCategory: string = 'gwp', resultKey: number = Number.MIN_SAFE_INTEGER): ChartData[] {
  const groupedData = new Map<string, { value: number, ids: Set<string> }>()

  // Go through each selected object and get aggregated labels and emission data
  for (const obj of objects) {
    const materialName = obj.material?.name
    const results = obj.results
    if (!results || !materialName) continue

    const result = resultKey === Number.MIN_SAFE_INTEGER ? results[results.length - 1] : results[resultKey]
    if (!result || !result.emission) continue

    if (!groupedData.has(materialName)) {
      groupedData.set(materialName, { value: 0, ids: new Set<string>() })
    }

    const materialData = groupedData.get(materialName)!

    for (const lifeCycleStage in result.emission[impactCategory]) {
      materialData.value += result.emission[impactCategory][lifeCycleStage]
    }
    materialData.ids.add(obj.id)
  }

  const data: ChartData[] = Array.from(groupedData, ([material, { value, ids }]) => ({
    label: material,
    value: Math.round(value),
    ids: Array.from(ids)
  }))

  return data
}

/**
 * Converter of material results into aggregated ChartData
 * @param materialResult 
 * @param impactCategory 
 * @returns 
 */
export function materialResultsToChartData(materialResult: MaterialResults, impactCategory: string = 'gwp'): ChartData[] {
  const data: ChartData[] = []
  for (const materialId in materialResult) {
    const material = materialResult[materialId]
    let totalValue = 0
    for (const phase in material.emission[impactCategory]) {
      totalValue += material.emission[impactCategory][phase]
    }
    data.push({
      label: material.material.name,
      value: Math.round(totalValue),
      ids: material.geoId
    })
  }
  return data
}

/**
 * Aggregates a series of emissions on either whole project or just selection
 */
export class EmissionAggregator {
  private geos: GeometryObject[] = []
  private totalEmission: Emission = {}
  private emissionsPerMaterial: MaterialResults = {}

  /**
   * @param geos Geometry objects to aggregate emissions on if left empty it will do it on whole project
   */
  constructor(geos: GeometryObject[] = []) {
    this.geos = geos
    // If no geometry sent do it on whole project
    if (geos.length === 0) {
      const projectStore = useProjectStore()
      if (projectStore.currProject) {
        this.geos = projectStore.currProject.geometry
      }
    }
  }

  // Main function to aggregate emissions
  public aggregate(): void {
    this.geos.forEach(geo => {
      if (geo.results) {
        this.aggregateTotalEmissions(geo.results[geo.results.length - 1].emission)
        if (geo.material) {
          this.aggregateEmissionsPerMaterial(
            geo.id,
            geo.material.id, 
            geo.material, 
            geo.results[geo.results.length - 1].emission
          )
        }
      }
    })

    this.saveResults()
  }

  // Get the total emission
  private aggregateTotalEmissions(emission: Emission): void {
    for (const impactCategory in emission) {
      if (!this.totalEmission[impactCategory]) {
        this.totalEmission[impactCategory] = {} 
      }
      for (const phase in emission[impactCategory]) {
        this.totalEmission[impactCategory][phase] =
          (this.totalEmission[impactCategory][phase] || 0) +
          emission[impactCategory][phase] 
      }
    }
  }

  // Get the emission per material
  private aggregateEmissionsPerMaterial(
    geoId: string,
    materialId: string,
    material: Product | Assembly,
    emission: Emission
  ): void {
    if (!this.emissionsPerMaterial[materialId]) {
      this.emissionsPerMaterial[materialId] = {
        material: material,
        emission: {},
        geoId: []
      } 
    }

    //Checks the ID and adds that as key to the emission object
    const materialEmission = this.emissionsPerMaterial[materialId].emission 
    this.emissionsPerMaterial[materialId].geoId.push(geoId)

    for (const impactCategory in emission) {
      if (!materialEmission[impactCategory]) {
        materialEmission[impactCategory] = {} 
      }
      for (const phase in emission[impactCategory]) {
        materialEmission[impactCategory][phase] =
          (materialEmission[impactCategory][phase] || 0) +
          emission[impactCategory][phase] 
      }
    }
  }
  
  private saveResults(): void {
    const resultStore = useResultStore()
    const result: Results = {
      id: crypto.randomUUID(),
      date: new Date(),
      emission: this.totalEmission,
    }
    resultStore.setAggregatedResults(result, this.emissionsPerMaterial)
  }
}
