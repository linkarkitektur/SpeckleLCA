import { useResultStore } from '@/stores/resultStore'
import { useProjectStore } from '@/stores/projectStore'
import { useSettingsStore } from '@/stores/settingStore'

import { getNestedPropertyValue } from '@/utils/materialUtils'
import { roundNumber } from './mathUtils'
import { DefaultResultList } from '@/models/resultModel'

import type { GroupedResults } from '@/models/resultModel'
import type { ChartData, NestedChartData } from '@/models/chartModel'
import type { GeometryObject, Quantity } from '@/models/geometryModel'
import { DanishEmissionFactors, type Emission, type EnergyType, type LifeCycleStageEmission, type MetricUnits } from '@/models/materialModel'
import type { ResultItem, ResultList } from '@/models/resultModel'
import type { ResultsLog } from '@/models/firebaseModel'

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
    value: roundNumber(value, 2)
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
        value: roundNumber(value, 2),
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
          value: roundNumber(data.value, 2),
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
    const lifecycleStage = groupedResult.data.emission[impactCategory][lifeCycleStage]

    // Here we only care about stage, since we are splitting data on stage
    if (settingsStore.projectSettings.emissionPerYear)
      materialData.value += lifecycleStage / area / lifespan
    else
      materialData.value += lifecycleStage / area

    materialData.ids.push(... groupedResult.data.geoId) 
  }
}

/**
 * Creates a result list from the given objects and then find the relevant parameter and makes it into chart data
 * @param objects Geoobject with reuslts on them
 * @param chartParameter Parameter to convert into chartdata
 * @returns Chartdata for given parameter
 */
export function geometryToChartData(objects: GeometryObject[], chartParameter: string, LCSData: boolean = false, newResList: boolean = false): ChartData[] {
  // Create result aggregator and calculator
  const resCalc = new ResultCalculator(objects)

  // If we get a resultItem in we use that parameter and structure to calculate the new resultList
  if (newResList)
    resCalc.setResultListProperties([{ 
    parameter: chartParameter,
    displayName: chartParameter,
    data: []
  }])

  // Calc the results
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
 * Returns number of total emission in co2 eq for a given emission object with all relevant stages and categories from settings
 * @param emission Emission object to convert to number
 * @returns Number for category and included stages in settings
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
    // Find the relevant stage object for the current stage
    const relevantStage = includedStages.relevantStages.find(
      (stageObj) => stageObj.stage === stage
    )
  
    // If the stage exists and is included, add its emission to the total
    if (relevantStage && relevantStage.included) {
      const stageEmission = emission[impactCategory][stage]

      if (perArea) {
        if (settingsStore.projectSettings.emissionPerYear) {
          total += stageEmission / area / lifeSpan
        } else {
          total += stageEmission / area
        }
      } else {
        if (settingsStore.projectSettings.emissionPerYear) {
          total += stageEmission / lifeSpan
        } else {
          total += stageEmission
        }
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

      for (const stage in source[impactCategory]) {
        result[impactCategory][stage] =
          (result[impactCategory][stage] || 0) + (source[impactCategory][stage] || 0)
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
  
  // Add special life cycle stages result item
  private lifeCycleStagesResult: ResultItem = {
    parameter: 'lifeCycleStages',
    displayName: 'Life Cycle Stages',
    data: []
  }
  
  // If provided group results based on a chain of parameters, othersie calc for all parameters in provided resultList
  public groupByChain: string[] | null = null

  /**
   * @param geos Geometry objects to aggregate emissions on.
   *             If left empty it will do it on the whole project.
   */
  constructor(geos: GeometryObject[] = []) {
    this.geos = geos
    if (geos.length === 0) {
      const projectStore = useProjectStore()
      if (projectStore.currProject) {
        this.geos = projectStore.currProject.geometry
      }
    }
  }

  // Setter to specify a grouping chain
  public setGroupingChain(chain: string[]): void {
    this.groupByChain = chain
  }

  // Setter to specifiy resultlist
  public setResultListProperties(resItems: ResultItem[]){
    this.resultList = resItems
  }

  // Main function to aggregate emissions
  public aggregate(save: Boolean = true, calcResultList = true): void {
    // Reset life cycle stages result
    this.lifeCycleStagesResult.data = []
    
    this.geos.forEach(geo => {
      if (geo.results) {
        const lastResult = geo.results[geo.results.length - 1]
        this.aggregateTotalEmissions(lastResult.emission)
        if (calcResultList) {
          // Always aggregate life cycle stages
          this.aggregateLifeCycleStagesResult(geo, lastResult.emission)
          
          if (this.groupByChain && this.groupByChain.length > 0) {
            this.aggregateEmissionsForResultChain(geo)
          } else {
            this.aggregateEmissionsForResultList(geo)
          }
        }
      }
    })

    // Add life cycle stages result to result list if not already present
    this.calculateEnergyEmissions()
    if (!this.resultList.some(item => item.parameter === 'lifeCycleStages')) {
      this.resultList.push(this.lifeCycleStagesResult)
    }

    if (save)
      this.saveResults()
  }

  private aggregateLifeCycleStagesResult(geo: GeometryObject, emission: Emission): void {
    const settingsStore = useSettingsStore()
    const impactCategory = settingsStore.calculationSettings.standardImpactCategory

    for (const stage in emission[impactCategory]) {
      let stageGroup = this.lifeCycleStagesResult.data.find(group => group.parameter === stage)

      if (!stageGroup) {
        // Create new stage group with initial values
        stageGroup = {
          parameter: stage,
          quantity: geo.quantity || {},
          data: {
            emission: {} as Emission,
            geoId: []
          }
        }
        this.lifeCycleStagesResult.data.push(stageGroup)
      }

      // Add emissions and quantities using the standard helper functions
      stageGroup.data.emission = addEmissions(stageGroup.data.emission, {
        [impactCategory]: { [stage]: emission[impactCategory][stage] }
      })
      stageGroup.quantity = addQuantity(stageGroup.quantity, geo.quantity || { m: 0 })

      // Add geoId if not already present
      if (!stageGroup.data.geoId.includes(geo.id)) {
        stageGroup.data.geoId.push(geo.id)
      }
    }
  }

  // Get the total emission
  private aggregateTotalEmissions(emission: Emission): void {
    for (const impactCategory in emission) {
      if (!this.totalEmission[impactCategory]) {
        this.totalEmission[impactCategory] = {} as LifeCycleStageEmission
      }
      for (const stage in emission[impactCategory]) {
        if (!this.totalEmission[impactCategory][stage]) {
          this.totalEmission[impactCategory][stage] = 0
        }
        const emissionAmount = emission[impactCategory][stage] || 0
        const currentTotal = this.totalEmission[impactCategory][stage] || 0
        this.totalEmission[impactCategory][stage] = currentTotal + emissionAmount
      }
    }
  }

  /**
   * aggregate emissions based on an array (chain) of parameters
   * @param geo geo to calc
   */
  private aggregateEmissionsForResultChain(geo: GeometryObject): void {
    const chain = this.groupByChain!
    const geoEmission = geo.results[geo.results.length - 1].emission
    const geoQuantity = geo.quantity

    // Use the chain as the key; for example: "parameters.category -> material.metaData.materialType -> material.name"
    const chainKey = chain.join(' -> ')
    let resultItem = this.resultList.find(item => item.parameter === chainKey)
    if (!resultItem) {
      resultItem = {
        parameter: chainKey,
        displayName: chain[chain.length - 1],
        data: []
      }
      this.resultList.push(resultItem)
    }

    // Recursively aggregate emissions into nested groupings
    this.recursiveAggregate(resultItem.data, chain, geo, geoEmission, geoQuantity)
  }

  // Recursive helper to aggregate emission data along a chain of parameters.
  private recursiveAggregate(
    groupings: GroupedResults[],
    chain: string[],
    geo: GeometryObject,
    geoEmission: Emission,
    geoQuantity: Quantity
  ): void {
    if (chain.length === 0) return

    const currentParam = chain[0]
    const paramValue = getNestedPropertyValue(geo, currentParam) || 'undefined'

    // Find or create a grouping at this level
    let grouping = groupings.find(grp => grp.parameter === paramValue)
    if (!grouping) {
      grouping = {
        parameter: paramValue,
        quantity: geoQuantity,
        data: {
          emission: {} as Emission,
          geoId: []
        },
        nested: []
      }
      groupings.push(grouping)
    }

    // Aggregate emissions and quantities at the current level:
    grouping.data.emission = addEmissions(grouping.data.emission, geoEmission)
    grouping.quantity = addQuantity(grouping.quantity, geoQuantity)
    if (!grouping.data.geoId.includes(geo.id)) {
      grouping.data.geoId.push(geo.id)
    }

    // Recurse to next parameter in the chain, if any
    if (chain.length > 1) {
      if (!grouping.nested) {
        grouping.nested = []
      }
      this.recursiveAggregate(grouping.nested!, chain.slice(1), geo, geoEmission, geoQuantity)
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
   * Interpolates emission factor for a specific energy type based on current year
   */
  private interpolateEmissionFactor(energyType: EnergyType): number {
    const currentYear = new Date().getFullYear()
    const factors = DanishEmissionFactors

    // Find the two closest years
    let lowerBound = factors[0]
    let upperBound = factors[factors.length - 1]

    for (let i = 0; i < factors.length - 1; i++) {
      if (factors[i].year <= currentYear && factors[i + 1].year > currentYear) {
        lowerBound = factors[i]
        upperBound = factors[i + 1]
        break
      }
    }

    // If current year is before first year or after last year, use the closest value
    if (currentYear <= lowerBound.year) return lowerBound.factors[energyType]
    if (currentYear >= upperBound.year) return upperBound.factors[energyType]

    // Linear interpolation
    const yearDiff = upperBound.year - lowerBound.year
    const valueDiff = upperBound.factors[energyType] - lowerBound.factors[energyType]
    const ratio = (currentYear - lowerBound.year) / yearDiff

    return lowerBound.factors[energyType] + (valueDiff * ratio)
  }

  /**
   * Calculate energy consumption emissions
   */
  private calculateEnergyEmissions(): void {
    const settingsStore = useSettingsStore()
    const settings = settingsStore.projectSettings
    if (!settings) return 

    const energyType = settings.energyType
    const consumption = settings.electricityConsumption

    // Skip calculation if either value is null/undefined
    if (!energyType || consumption === null || consumption === undefined) return 

    const emissionFactor = this.interpolateEmissionFactor(energyType)
    if (emissionFactor === null || emissionFactor === undefined) return 

    const area = settings.area || 0
    const totalEmissions = consumption * emissionFactor * area * settings.lifespan // kWh/m²/year * kg CO2/kWh * m² * lifespan = kg CO2/year

    const impactCategory = settingsStore.calculationSettings.standardImpactCategory

    // Add to life cycle stages result
    const b6Group = this.lifeCycleStagesResult.data.find(group => group.parameter === 'b6')
    if (!b6Group) {
      this.lifeCycleStagesResult.data.push({
        parameter: 'b6',
        quantity: {},
        data: {
          emission: {
            [impactCategory]: { b6: totalEmissions }
          },
          geoId: []
        }
      })
    } else {
      if (!b6Group.data.emission[impactCategory]) {
        b6Group.data.emission[impactCategory] = {} as LifeCycleStageEmission
      }
      b6Group.data.emission[impactCategory].b6 = totalEmissions
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
      const categoryEmission: LifeCycleStageEmission = aggregatedEmission[impactCategoryKey]
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
