import { useResultStore } from '@/stores/result'
import { useProjectStore } from '@/stores/main'
import { useSettingsStore } from '@/stores/settings'

import { getNestedPropertyValue } from '@/utils/material'
import { DefaultResultList } from '@/models/result'

import type { GroupedResults } from '@/models/result'
import type { ChartData, NestedChartData } from '@/models/chartModels'
import type { GeometryObject, Quantity } from '@/models/geometryObject'
import type { Emission, LifeCycleStageEmission, MetricUnits } from '@/models/material'
import type { ResultItem, ResultList } from '@/models/result'
import type { ResultsLog } from '@/models/firebase'
import { roundNumber } from './math'

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
 * Converts a ResultItem into a list of ChartData with only lifecycle stages information
 * @param resultItem ResultItem to convert
 * @returns ChartData array for use with charts such as stackedBar
 */
export function resultItemToLCSChartData(resultItem: ResultItem): ChartData[] {
  const groupedData = new Map<string, ChartData>()

  if (!resultItem?.data) return []
  // Go through each selected object and get aggregated labels and emission data
  for (const groupedResult of resultItem.data) {
    groupedResultToLCSChartData(groupedResult, groupedData)
  }

  const data: ChartData[] = Array.from(groupedData, ([material, { value, ids }]) => ({
    label: material,
    value: roundNumber(value, 2),
    ids: ids
  }))

  return data
}

/**
 * Converts a ResultItem into a list of ChartData
 * @param resultItem ResultItem to convert
 * @returns ChartData array for use with charts such as pie, bar chart etc
 */
export function resultItemToChartData (resultItem: ResultItem): ChartData[] {
  const groupedData = new Map<string, ChartData>()

  if (!resultItem?.data) return []
  // Go through each selected object and get aggregated labels and emission data
  for (const groupedResult of resultItem.data) {
    groupedResultToChartData(groupedResult, groupedData)
  }
  
  const data: ChartData[] = Array.from(groupedData, ([material, { value, ids }]) => ({
    label: material,
    value: roundNumber(value, 2),
    ids: ids
  }))

  return data
}

/**
 * Converts a ResultItem into a list of NestedChartData
 * The top-level resultItem is transformed into an array of NestedChartData:
 * @param resultItem ResultItem to convert
 * @returns NestedChartData array for use with charts such as diverging stacked bar chart
 */
export function resultItemToNestedChartData (resultItem: ResultItem): NestedChartData[] {
  if (!resultItem?.data) return []

  const nestedChartData: NestedChartData[] = []

  for (const groupedResult of resultItem.data) {
    // For each top-level grouped result, we gather its ChartData
    const topLevelData = new Map<string, ChartData>()
    groupedResultToChartData(groupedResult, topLevelData)

    // If no nested data, we can still return a NestedChartData with just the top-level data
    if (!groupedResult.nested || groupedResult.nested.length === 0) {
      const topLevelArray: ChartData[] = Array.from(topLevelData, ([label, { value, ids }]) => ({
        label: label,
        value: Math.round(value),
        ids: ids
      }))
  
      nestedChartData.push({
        label: groupedResult.parameter,
        value: topLevelArray
      })
      continue
    }
    
    // Add nested results
    const nestedDataArray: ChartData[] = []

    for (const nestedResult of groupedResult.nested) {
      const nestedResultMap = new Map<string, ChartData>()
      groupedResultToChartData(nestedResult, nestedResultMap)

      // Each nested result might have multiple entries, append them:
      for (const [label, data] of nestedResultMap) {
        nestedDataArray.push({
          label,
          value: Math.round(data.value),
          ids: data.ids
        })
      }
    }

    nestedChartData.push({
      label: groupedResult.parameter,
      value: nestedDataArray
    })
  }

  return nestedChartData
}

/**
 * Helper function to convert a single grouped result into a chart data
 * @param groupedResult Grouped result to convert
 * @param groupedData Map to store the grouped data
 */
function groupedResultToChartData(groupedResult: GroupedResults, groupedData: Map<string, ChartData>): void {
  const objectName = groupedResult.parameter
  const emissionData = groupedResult.data.emission

  if (!objectName || !emissionData) return null

  if (!groupedData.has(objectName)) {
    const entry: ChartData = {
      label: objectName,
      value: 0,
      ids: []
    }
    groupedData.set(objectName, entry)
  }

  const materialData = groupedData.get(objectName)!

  materialData.value = emissionToNumber(emissionData)

  materialData.ids.push(... groupedResult.data.geoId) 
}


/**
 * Helper function to convert a single grouped result into a chart data for lifecycle stages
 * @param groupedResult Grouped result to convert
 * @param groupedData Map to store the grouped data
 * @param impactCategory Impact category to get results for
 */
function groupedResultToLCSChartData(groupedResult: GroupedResults, groupedData: Map<string, ChartData> ): void {
  const settingsStore = useSettingsStore()
  const impactCategory = settingsStore.calculationSettings.standardImpactCategory

  const area = settingsStore.projectSettings.area
  const lifespan = settingsStore.projectSettings.lifespan
  
  const emissionData = groupedResult.data.emission

  if (!emissionData) return null

  for (const lifeCycleStage in groupedResult.data.emission[impactCategory]) {
    if (!groupedData.has(lifeCycleStage)) {
      const entry: ChartData = {
        label: lifeCycleStage,
        value: 0,
        ids: []
      }
      groupedData.set(lifeCycleStage, entry)
    }

    const materialData = groupedData.get(lifeCycleStage)!

    // Here we only care about stage, since we are splitting data on stage
    if (settingsStore.projectSettings.emissionPerYear)
      materialData.value += groupedResult.data.emission[impactCategory][lifeCycleStage] / area / lifespan
    else
      materialData.value += groupedResult.data.emission[impactCategory][lifeCycleStage] / area

    materialData.ids.push(... groupedResult.data.geoId) 
  }
}

/**
 * Creates a result list from the given objects and then find the relevant parameter and makes it into chart data
 * @param objects Geoobject with reuslts on them
 * @param chartParameter Parameter to convert into chartdata
 * @returns Chartdata for given parameter
 */
export function geometryToChartData(objects: GeometryObject[], chartParameter: string, LCSData: boolean = false): ChartData[] {
  // Create result aggregator and calculator
  const resCalc = new ResultCalculator(objects)
  resCalc.aggregate(false, true)
  
  const resultItem = resCalc.resultList.find((item) => item.parameter === chartParameter)

  // If we are calculating for LCS, we need to convert the data differently
  if (LCSData) 
    return resultItemToLCSChartData(resultItem)
  
  return resultItemToChartData(resultItem)
}

/**
 * Creates a result list from the given objects and then find the relevant parameter and makes it into nested chart data
 * @param objects Geoobject with reuslts on them
 * @param chartParameter Parameter to convert into nested chartdata
 * @returns Nested chartdata for given parameter
 */
export function geometryToNestedChartData(objects: GeometryObject[], chartParameter: string): NestedChartData[] {
  // Create result aggregator and calculator
  const resCalc = new ResultCalculator(objects)
  resCalc.aggregate(false, true)
  
  const resultItem = resCalc.resultList.find((item) => item.parameter === chartParameter)

  return resultItemToNestedChartData(resultItem)
}

/**
 * Returns number of total emission in co2 eq for a given emission object with all relevant phases and categories from settings
 * @param emission Emission object to convert to number
 * @returns Number for category and included phases in settings
 */
export function emissionToNumber(emission: Emission, perArea: boolean = true): number {
  const settingsStore = useSettingsStore()

  const impactCategory = settingsStore.calculationSettings.standardImpactCategory
  const includedStages = settingsStore.calculationSettings.includedStages
  const area = settingsStore.projectSettings.area
  const lifeSpan = settingsStore.projectSettings.lifespan
  
  let total = 0

  // Only go through relevant ImpactCategory
  for (const stage in emission[impactCategory]) {
    // Find the relevant stage object for the current phase
    const relevantStage = includedStages.relevantStages.find(
      (stageObj) => stageObj.stage === stage
    )
  
    // If the stage exists and is included, add its emission to the total
    if (relevantStage && relevantStage.included) {
      if (perArea) {
        if (settingsStore.projectSettings.emissionPerYear)
          total += emission[impactCategory][stage] / area / lifeSpan
        else
          total += emission[impactCategory][stage] / area
      } else {
        if (settingsStore.projectSettings.emissionPerYear)
          total += emission[impactCategory][stage] / lifeSpan
        else
          total += emission[impactCategory][stage]
      }
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

export function extractEmissionsFromResultItem(resultItem: ResultItem): Emission[] {
  return resultItem.data.map(groupedResult => groupedResult.data.emission)
}

export function sumEmissions(emissions: Emission[]): Emission {
  return emissions.reduce((accumulatedEmission, currentEmission) => {
    return addEmissions(accumulatedEmission, currentEmission)
  }, {})
}

export function resultLogToAdjustedEmission(
  resultLog: ResultsLog,
  parameter: string
) : number {
  const emission = getResultLogEmissions(resultLog, parameter)
  return roundNumber(emissionToNumber(emission), 2) 
}

/**
 * Simple function to add two emissions together
 * @param a Emission to add to
 * @param b Emission to add from
 * @returns Emission with added values
 */
export function addEmissions(a: Emission, b: Emission): Emission {
  const result: Emission = {}

  const mergeIntoResult = (source: Emission) => {
    for (const impactCategory in source) {
      if (!result[impactCategory]) {
        result[impactCategory] = {}
      }

      for (const phase in source[impactCategory]) {
        result[impactCategory][phase] =
          (result[impactCategory][phase] || 0) + (source[impactCategory][phase] || 0)
      }
    }
  }
  mergeIntoResult(a)
  mergeIntoResult(b)

  return result
}

/**
 * Simple function to add two quantities together
 * @param a Quantity to add to
 * @param b Quantity to add from
 * @returns Quantity with added values
 */
export function addQuantity(a: Quantity, b: Quantity): Quantity {
  const result: Quantity = {}
  // Find unique keys in a and b
  const allKeys = new Set<MetricUnits>([...Object.keys(a || {}) as MetricUnits[], ...Object.keys(b || {}) as MetricUnits[]])
  
  for (const key of allKeys) {
    result[key] = (a[key] || 0) + (b[key] || 0)
  }
  return result
}

/**
 * Aggregates a series of emissions on either whole project or just selection
 */
export class ResultCalculator {
  private geos: GeometryObject[] = []
  private resultStore = useResultStore()
  public totalEmission: Emission = {}
  // Decouple from original list
  public resultList: ResultList = DefaultResultList.map(item => ({
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
          this.totalEmission[impactCategory][phase] = 0
        }
        const emissionAmount = emission[impactCategory][phase] || 0
        const currentTotal = this.totalEmission[impactCategory][phase] || 0
        this.totalEmission[impactCategory][phase] = currentTotal + emissionAmount
      }
    }
  }

  private aggregateEmissionsForResultList(geo: GeometryObject): void {
    for (const index in this.resultList) {
      // Parameter to aggregate on
      const parameter = this.resultList[index].parameter
      const paramValue = getNestedPropertyValue(geo, parameter)
      if (paramValue) {
        // Get latest result
        const geoEmission = geo.results[geo.results.length - 1].emission
        const geoQuantity = geo.quantity

        const paramItem = this.resultList[index]

        if (!paramItem.data) {
          paramItem.data = []
        }

        // Find the parameter in the list
        let groupedResult = paramItem.data.find((result) => result.parameter === paramValue)

        if (!groupedResult) {
          groupedResult = {
            parameter: paramValue,
            quantity: geoQuantity,
            data: {
              emission: {} as Emission,
              geoId: [],
            }
          }
          paramItem.data.push(groupedResult)
        }

        // Add emissions together
        groupedResult.data.emission = addEmissions(
          groupedResult.data.emission,
          geoEmission
        )

        // Add quantities together
        groupedResult.quantity = addQuantity(
          groupedResult.quantity, 
          geoQuantity
        )

        // Add geoId to list if not already there
        if (!groupedResult.data.geoId.includes(geo.id)) {
          groupedResult.data.geoId.push(geo.id)
        }

        this.aggregateLifeCycleStages(groupedResult)
      }
    }
  }

  /**
   * Aggregate emissions into a nested ResultItem by life cycle stages.
   */
  private aggregateLifeCycleStages(
    groupedResult: GroupedResults,
  ): void {
    // Ensure nested structure exists
    if (!groupedResult.nested) {
      groupedResult.nested = []
    }

    const aggregatedEmission = groupedResult.data.emission
    // Iterate through each impact category in the aggregated emission
    for (const impactCategoryKey in aggregatedEmission) {
      const categoryEmission = aggregatedEmission[impactCategoryKey]
      if (!categoryEmission) continue

      // For each life cycle stage in this category
      for (const stageKey in categoryEmission) {
        const stageValue = categoryEmission[stageKey]

        let stageGrouped = groupedResult.nested.find(
          (group) => group.parameter === stageKey
        )

        if (!stageGrouped) {
          stageGrouped = {
            parameter: stageKey,
            quantity: { m:0 }, 
            data: {
              emission: {} as Emission,
              geoId: []
            }
          }
          groupedResult.nested.push(stageGrouped)
        }

        // Initialize this category and stage if it doesn't exist
        if (!stageGrouped.data.emission[impactCategoryKey]) {
          stageGrouped.data.emission[impactCategoryKey] = {}
        }

        // Aggregate the emission for this stage
        stageGrouped.data.emission[impactCategoryKey][stageKey] =
          (stageGrouped.data.emission[impactCategoryKey][stageKey] ?? 0) + stageValue

        // Add geoId to list if not already there
        if (groupedResult.data.geoId.length === 0) {
          groupedResult.data.geoId.push(... groupedResult.data.geoId)
        }
      }
    }
  }
  
  private saveResults(): void {
    this.resultStore.setResultList(this.resultList)
  }
}
