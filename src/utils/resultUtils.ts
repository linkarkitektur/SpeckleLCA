import { useResultStore } from '@/stores/result'
import { useProjectStore } from '@/stores/main'

import type { ChartData } from '@/models/chartModels'
import type { GeometryObject } from '@/models/geometryObject'
import type { Emission } from '@/models/material'

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
 * Aggregates a series of emissions
 * @param emissions that you want aggregated
 * @returns emission object with aggregated values
 */
export function aggregateResults(emissions: Emission[]) {
  const aggregatedResults: Emission = {}

  for (const emission of emissions) {
    for (const impactCategory in emission) {
      if (!aggregatedResults[impactCategory]) {
        aggregatedResults[impactCategory] = {}
      }

      for (const lifeCycleStage in emission[impactCategory]) {
        const currentValue = aggregatedResults[impactCategory][lifeCycleStage] || 0
        aggregatedResults[impactCategory][lifeCycleStage] = currentValue + emission[impactCategory][lifeCycleStage]
      }
    }
  }

  return aggregatedResults
}

/**
 * Calculates results for whole project
 */
export function triggerCalculateResults() {
  const projectStore = useProjectStore()

  projectStore.calculateResults()
}

export function resultsPerMaterial() {
  const projectStore = useProjectStore()
  const resultStore = useResultStore()

  
  const objects = projectStore.projectGroups.flatMap(group => group.elements)
  const emissions = objects.flatMap(obj => obj.results?.map(result => result.emission) || [])

  const aggregatedResults = aggregateResults(emissions)
  resultStore.setAggregatedResults(aggregatedResults)
}