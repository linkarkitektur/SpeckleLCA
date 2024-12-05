import { useResultStore } from '@/stores/result'
import { useProjectStore } from '@/stores/main'
import { useSettingsStore } from '@/stores/settings'

import { getNestedPropertyValue } from '@/utils/material'
import { ResultList } from '@/models/result'
import { getTextAfterLastDot } from '@/utils/stringUtils'

import type { MaterialResults, Results } from '@/models/result'
import type { ChartData, NestedChartData } from '@/models/chartModels'
import type { GeometryObject } from '@/models/geometryObject'
import type { Product, Assembly, Emission, LifeCycleStageEmission } from '@/models/material'
import type { ResultItem } from '@/models/result'
import type { ResultsLog } from '@/models/firebase'


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
export function ResultItemToChartData (resultItem: ResultItem): ChartData[] {
  const settingsStore = useSettingsStore()
  const impactCategory = settingsStore.calculationSettings.standardImpactCategory
  const groupedData = new Map<string, ChartData>()

  if (!resultItem?.data) return []
  // Go through each selected object and get aggregated labels and emission data
  for (const groupedResult of resultItem.data) {
    let objectName = groupedResult.parameter
    const emissionData = groupedResult.data.emission

    if (!objectName || !emissionData) continue

    // Fix for Speckletype names
    if ((objectName.split('.').length - 1) > 2 )
      objectName = getTextAfterLastDot(objectName)

    if (!groupedData.has(objectName)) {
      const entry: ChartData = {
        label: objectName,
        value: 0,
        ids: []
      }
      groupedData.set(objectName, entry)
    }

    const materialData = groupedData.get(objectName)!

    for (const lifeCycleStage in groupedResult.data.emission[impactCategory]) {
      materialData.value += groupedResult.data.emission[impactCategory][lifeCycleStage]
    }

    materialData.ids.push(... groupedResult.data.geoId)
  }
  
  const data: ChartData[] = Array.from(groupedData, ([material, { value, ids }]) => ({
    label: material,
    value: Math.round(value),
    ids: ids
  }))

  return data
}

/**
 * Creates a result list from the given objects and then find the relevant parameter and makes it into chart data
 * @param objects Geoobject with reuslts on them
 * @param chartParameter Parameter to convert into chartdata
 * @returns Chartdata for given parameter
 */
export function geometryToChartData(objects: GeometryObject[], chartParameter: string): ChartData[] {
  // Create result aggregator and calculator
  const resCalc = new ResultCalculator(objects)
  resCalc.aggregate(false, true)
  
  const resultItem = resCalc.resultList.find((item) => item.parameter === chartParameter)

  return ResultItemToChartData(resultItem)
}

/**
 * Converter of geometry object results into nested ChartData for all unique materials
 * TODO: Move this to resultList logic
 * @param objects geometry objects to convert
 * @param impactCategory optional impact category to get results for that category
 * @param resultKey optional key to get specific result
 */
export function geometryToMaterialTypeNestedChartData(objects: GeometryObject[], impactCategory: string = 'gwp', resultKey: number = Number.MIN_SAFE_INTEGER): NestedChartData[] {
  const groupedData = new Map<string, Map<string, ChartData>>()

  // Go through each selected object and get aggregated labels and emission data
  for (const obj of objects) {
    const materialType = obj.parameters.category
    const results = obj.results
    if (!results || !materialType) continue

    const result = resultKey === Number.MIN_SAFE_INTEGER ? results[results.length - 1] : results[resultKey]
    if (!result || !result.emission) continue

    if (!groupedData.has(materialType)) {
      groupedData.set(materialType, new Map<string, ChartData>())
    }

    const materialStages = groupedData.get(materialType)!

    for (const lifeCycleStage in result.emission[impactCategory]) {
      if (!materialStages.has(lifeCycleStage)) {
        materialStages.set(lifeCycleStage, {
          label: lifeCycleStage,
          value: 0,
          ids: []
        })
      }

      const stageData = materialStages.get(lifeCycleStage)!
      stageData.value += result.emission[impactCategory][lifeCycleStage]
      stageData.ids.push(obj.id)
    }
  }

  // Convert grouped data into NestedChartData format
  const nestedData: NestedChartData[] = Array.from(groupedData, ([material, stages]) => ({
    label: material,
    value: Array.from(stages.values()).map(({ label, value, ids }) => ({
      label,
      value: Math.round(value),
      ids
    }))
  }))

  return nestedData
}

/**
 * Converter of material results into aggregated ChartData
 * @param materialResult 
 * @param impactCategory 
 * @returns 
 */
export function materialResultsToMaterialChartData(materialResult: MaterialResults, impactCategory: string = 'gwp'): ChartData[] {
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
 * Returns number of total emission in co2 eq for a given emission object with all relevant phases and categories from settings
 * @param emission Emission object to convert to number
 * @returns Number for category and included phases in settings
 */
export function emissionToNumber(emission: Emission): number {
  const settingsStore = useSettingsStore()
  const impactCategory = settingsStore.calculationSettings.standardImpactCategory
  const includedPhases = settingsStore.calculationSettings.includedStages
  
  let total = 0

  // Only go through relevant ImpactCategory
  for (const phase in emission[impactCategory]) {
    // Find the relevant stage object for the current phase
    const relevantStage = includedPhases.relevantStages.find(
      (stageObj) => stageObj.stage === phase
    )
  
    // If the stage exists and is included, add its emission to the total
    if (relevantStage && relevantStage.included) {
      total += emission[impactCategory][phase]
    }
  }  

  return total
}

/**
 * Returns emission object from a resultLog
 * @param resultLog ResultLog to get emission from, this comes from Firebase
 * @param parameter Paramater to get emissions for, e.g. 'parameter.category', 'parameter.speckleType'
 * @returns returns summed up emissions for the parameter
 */
export function getResultLogEmissions(resultLog: ResultsLog, parameter: string): Emission {
  const resItem = resultLog.resultList.find((item: ResultItem) => item.parameter === parameter)

  const emissionList = extractEmissionsFromResultItem(resItem)
  
  return sumEmissions(emissionList)
}

function extractEmissionsFromResultItem(resultItem: ResultItem): Emission[] {
  return resultItem.data.map(groupedResult => groupedResult.data.emission)
}

function sumEmissions(emissions: Emission[]): Emission {
  return emissions.reduce((accumulatedEmission, currentEmission) => {
    return addEmissions(accumulatedEmission, currentEmission)
  }, {})
}

export function addEmissions(a: Emission, b: Emission): Emission {
  const result: Emission = {}

  const mergeIntoResult = (source: Emission) => {
    for (const impactCategory in source) {
      if (!result[impactCategory]) {
        result[impactCategory] = {}
      }

      for (const phase in source[impactCategory]) {
        result[impactCategory][phase] =
          (result[impactCategory][phase] || 0) + source[impactCategory][phase]
      }
    }
  }
  mergeIntoResult(a)
  mergeIntoResult(b)

  return result
}

/**
 * Aggregates a series of emissions on either whole project or just selection
 */
export class ResultCalculator {
  private geos: GeometryObject[] = []
  private resultStore = useResultStore()
  public totalEmission: Emission = {}
  private emissionsPerMaterial: MaterialResults = {}
  // Decouple from original list
  public resultList: ResultList = ResultList.map(item => ({
    ...item,
    data: [],
  }))

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
  public aggregate(save: Boolean = true, calcResultList = true): void {
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
        if (calcResultList) {
          this.aggregateEmissionsForResultList(geo)
        }
      }
    })

    if (save)
      this.saveResults()
  }

  // Get the total emission
  private aggregateTotalEmissions(emission: Emission): void {
    for (const impactCategory in emission) {
      if (!this.totalEmission[impactCategory]) {
        this.totalEmission[impactCategory] = {} as LifeCycleStageEmission
      }
      for (const phase in emission[impactCategory]) {
        if (!this.totalEmission[impactCategory][phase]) {
          this.totalEmission[impactCategory][phase] = { amount: 0 }
        }
        const emissionAmount = emission[impactCategory][phase] || 0
        const currentTotal = this.totalEmission[impactCategory][phase] || 0
        this.totalEmission[impactCategory][phase] = currentTotal + emissionAmount
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

  private aggregateEmissionsForResultList(geo: GeometryObject): void {
    for (const index in this.resultList) {
      const parameter = this.resultList[index].parameter
      const paramValue = getNestedPropertyValue(geo, parameter)
      if (paramValue) {
        const geoEmission = geo.results[geo.results.length - 1].emission

        const paramList = this.resultList[index]

        if (!paramList.data) {
          paramList.data = []
        }

        let groupedResult = paramList.data.find((result) => result.parameter === paramValue)

        if (!groupedResult) {
          groupedResult = {
            parameter: paramValue,
            data: {
              emission: {} as Emission,
              geoId: [],
            }
          }
          paramList.data.push(groupedResult)
        }

        groupedResult.data.emission = addEmissions(
          groupedResult.data.emission,
          geoEmission
        )

        if (!groupedResult.data.geoId.includes(geo.id)) {
          groupedResult.data.geoId.push(geo.id)
        }
      }
    }
  }
  
  private saveResults(): void {

    const result: Results = {
      id: crypto.randomUUID(),
      date: new Date(),
      emission: this.totalEmission,
    }
    this.resultStore.setAggregatedResults(result, this.emissionsPerMaterial)

    this.resultStore.setResultList(this.resultList)
  }
}
