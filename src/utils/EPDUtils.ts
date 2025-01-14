import axios from 'axios'
import type { AxiosInstance } from 'axios'

import { delay } from '@/utils/math'

import { useSettingsStore } from '@/stores/settings'

import { EPDSource } from '@/models/settings'
import type { RevaluData, RevaluCollection, RevaluSingleCollection } from '@/models/revaluDataSource'
import { type Product, type Emission, type LifeCycleStageEmission, type Assembly, Source} from '@/models/material'

//import { convertIlcd } from 'epdx'

const MAX_EPD_COUNT = 15
// Ilcd reference to GWP total
const GWP_REF_OBJECT_ID = '6a37f984-a4b3-458a-a20a-64418c145fa2'

interface EPDService {
  createApiClient(): AxiosInstance
  createListUrl(): string
  createEPDUrl(epd: any): string
  createCollectionUrl(): string
  createCollectionDetailsUrl(collectionId: string): string
  createListParams(): any
  createEPDParams(): any
  updatePageIndex(params: any): any
  extractEPDData(data: any): Product | null
  extractEPDList(data: any): any[]
}

/**
 * Class for fetching data from EcoPortal
 * TODO: This implementation is not done yet, EPD Information is flaky at best
 */
class EcoPortalService implements EPDService {
  createApiClient() {
    const settingsStore = useSettingsStore()
    return axios.create({
      headers: {
        Authorization: `Bearer ${settingsStore.keySettings.materialKeys.ecoPortal}`,
      },
    })
  }
  
  createListUrl() {
    return '/api/eco/resource/processes'
  }

  createEPDUrl(epd: any) {
    return `/${epd.nodeid}${epd.uuid}`
  }

  createCollectionUrl() {
    return null
  }

  createCollectionDetailsUrl(collectionId: string) {
    return null
  }

  createListParams() {
    return {
      search: 'true',
      distributed: 'true',
      virtual: 'true',
      metaDataOnly: 'false',
      startIndex: '0',
      pageSize: MAX_EPD_COUNT,
      format: 'json',
    }
  }

  createEPDParams() {
    return {
      format: 'json',
      view: 'extended',
    }
  }

  updatePageIndex(params: any) {
    const startIndex = parseInt(params.startIndex) + parseInt(params.pageSize)
    return { ...params, startIndex: startIndex.toString() }
  }

  extractEPDData(data: any) {
    return extractILCDData(data)
  }

  extractEPDList(data: any): any[] {
    return data.data;
  }
}

/**
 * Class for fetching data from Revalu
 */
class RevaluService implements EPDService {
  createApiClient() {
    const settingsStore = useSettingsStore()
    return axios.create({
      headers: {
        'x-api-key': settingsStore.keySettings.materialKeys.revalu,
      },
    })
  }
  
  // Create list URL, we check if dev or not and switch the URL
  createListUrl() {
    const apiListUrl = import.meta.env.MODE === 'development' 
      ? '/SpeckleLCA/api/revalu/epds/search' 
      : 'https://api.revalu.io/epds/search'
    return apiListUrl
  }

  // Create EPD URL, we check if dev or not and switch the URL
  createEPDUrl(epd: any) {
    const apiEPDUrl = import.meta.env.MODE === 'development' 
      ? `/SpeckleLCA/api/revalu/epds/${epd.id}` 
      : `https://api.revalu.io/epds/${epd.id}`
    return apiEPDUrl
  }

  // Create collection URL
  createCollectionUrl() {
    const apiCollectionUrl = import.meta.env.MODE === 'development'
      ? '/SpeckleLCA/api/revalu/users/colletions?page_no=0&page_size=20' 
      : 'https://api.revalu.io/users/colletions?page_no=0&page_size=20'
    return apiCollectionUrl
  }

  // Create collection details URL
  createCollectionDetailsUrl(collectionId: string) {
    const apiCollectionDetailsUrl = import.meta.env.MODE === 'development'
      ? `/SpeckleLCA/api/revalu/users/colletions/${collectionId}` 
      : `https://api.revalu.io/users/colletions/${collectionId}`
    return apiCollectionDetailsUrl
  }

  createListParams() {
    return {
      search_term: '',
      page_no: 0,
      page_size: MAX_EPD_COUNT,
    }
  }

  createEPDParams() {
    return {}
  }

  updatePageIndex(params: any) {
    return { ...params, page_no: params.page_no + 1 }
  }

  extractEPDData(data: any) {
    return extractRevaluData(data)
  }

  extractEPDList(data: any): any[] {
    return data.body.search_results
  }
}

/**
 * Extract ILCD data from the response
 * TODO: Implement lcaX conversion already made
 * @param data 
 * @returns 
 */
const extractILCDData = (data: any) => {
  // Extract metaData
  const metaData: Record<string, string> = {}
  const classifications =
    data?.processInformation?.dataSetInformation?.classificationInformation
      ?.classification || []

  classifications.forEach((classification: any) => {
    classification.class.forEach((cls: any) => {
      metaData[cls.classId] = cls.value
    })
  })

  // Extract GWP emissions
  const lciaResults = data?.LCIAResults?.LCIAResult || []
  const gwpResult = lciaResults.find(
    (result: any) =>
      result.referenceToLCIAMethodDataSet.refObjectId === GWP_REF_OBJECT_ID
  )

  const emission = {} as Emission
  let totalA1A3 = 0

  if (gwpResult?.other?.anies) {
    gwpResult.other.anies.forEach((entry: any) => {
      const module = entry.module?.toLowerCase().replace(/-/g, '') as string
      const amount = parseFloat(entry.value)

      if (['a1', 'a2', 'a3'].includes(module)) {
        totalA1A3 += amount
      } else {
        emission.gwp = emission.gwp || {} as LifeCycleStageEmission
        emission.gwp[module] = { amount }
      }
    })

    if (totalA1A3 > 0) {
      emission.gwp = emission.gwp || {} as LifeCycleStageEmission
      emission.gwp['a1a3'] = totalA1A3 
    }
  }

  // Extract unit and quantity
  const exchange = data?.exchanges?.exchange?.[0]
  const flowProperties = exchange?.flowProperties || []
  const referenceProperty = flowProperties.find(
    (prop: any) => prop.referenceUnit
  )
  const unit = referenceProperty?.referenceUnit || ''
  const quantity = parseFloat(referenceProperty?.meanValue || '0')

  // Build the product object
  const product: Product = {
    id: data.processInformation.dataSetInformation.UUID,
    name:
      data.processInformation.dataSetInformation.name.baseName[0]?.value ||
      '',
    description:
      data.processInformation.technology
        .technologyDescriptionAndIncludedProcesses[0]?.value || '',
    referenceServiceLife: 50,
    impactData: null,
    quantity,
    unit,
    transport: null,
    results: null,
    metaData,
    emission,
    source: Source.ECOPortal,
  }
  return product
}

/**
 * Extracts data from Revalu and their different data structure
 * @param data 
 * @returns 
 */
const extractRevaluData = (response: { body: RevaluData }, collection: string = "") => {
  const data = response.body
  const emission: Emission = {
    gwp: data.gwp,
    gwp_fossil: data.gwp_fossil,
    //gwp_biogenic: data.gwp_biogenic,
    //gwp_luluc: data.gwp_luluc,
    fw: data.fw,
    pert: data.pert,
    penrt: data.penrt,
    //energy_mix_percentage: data.energy_mix_percentage,
  }
  const product: Product = {
    id: data.id,
    name: data.name,
    description: data.manufacturer,
    referenceServiceLife: 50,
    impactData: null,
    quantity: 1,
    unit: data.declared_unit,
    transport: null,
    results: null,
    emission,
    source: Source.Revalu,
    metaData: { Collection: collection },
  }
  return product
}

/**
 * Checks projectstore and gets the relevant EPD service
 * @returns 
 */
function getEPDService(): EPDService {
  const settingsStore = useSettingsStore()

  switch (settingsStore.materialSettings.epdSource) {
    case EPDSource.EcoPortal:
      return new EcoPortalService()
    case EPDSource.Revalu:
      return new RevaluService()
    default:
      throw new Error('Unsupported EPD source')
  }
}

/**
 * Get all EPDs from chosen API
 * Acording to parameters, check API documentation for more information
 * @param parameters Key value pairs for the API call
 * @returns List of products with emission data
 */
export async function getEPDList(parameters: { [key: string]: string | string[] } = {}): Promise<Product[]> {
  const epdService = getEPDService()
  const EPDList: Product[] = []
  const apiClient = epdService.createApiClient()
  const baseUrl = epdService.createListUrl()
  let params = epdService.createListParams()

  params = { ...params, ...parameters }

  await delay(1000)

  while (EPDList.length < MAX_EPD_COUNT) {
    try {
      const response = await apiClient.get(baseUrl, { params })
      const data = response.data

      const epdListData = epdService.extractEPDList(data)

      if (!epdListData || epdListData.length === 0) {
        console.log('No more data to fetch')
        break
      }

      for (const epd of epdListData) {
        const product = await getSpecificEPD(epd)
        if (product) {
          EPDList.push(product)
        }
      }

      params = epdService.updatePageIndex(params)
    } catch (error) {
      console.error('Error fetching EPD list:', error)
      break
    }
  }

  return EPDList
}

/**
 * Fetches a specific EPD
 * @param epd The EPD data containing uuid and nodeid for ecoportal.
 * @returns A Product with EPD data or null if an error occurs.
 */
export async function getSpecificEPD(epd: any): Promise<Product | null> {
  const epdService = getEPDService()
  const apiClient = epdService.createApiClient()
  const url = epdService.createEPDUrl(epd)
  const params = epdService.createEPDParams()

  try {
    const response = await apiClient.get(url, { params })
    const data = response.data

    return epdService.extractEPDData(data)
  } catch (error) {
    console.error(`Error fetching EPD ${epd.uuid}:`, error)
    return null
  }
}

export function isAssembly(val: any): val is Assembly {
  return val && typeof val === 'object' && 'products' in val && 'id' in val;
}

/**
 * Gets all collections from Revalu, and fetches all EPDs from them
 * Only available for Revalu for now, not sure if ECOportal has collections
 * @returns Products from collections converted to EPDx format
 */
export async function getCollection(): Promise<Product[]> {
  const epdService = getEPDService()
  const apiClient = epdService.createApiClient()
  const url = epdService.createCollectionUrl()

  try {
    const collectionEpds: Product[] = []
    const response = await apiClient.get(url)
    const data = response.data as RevaluCollection[]

    for (const collection of data) {
      const collectionDetailsUrl = epdService.createCollectionDetailsUrl(collection.collection_id)
      const collectionResponse = await apiClient.get(collectionDetailsUrl)

      const collectionData = collectionResponse.data as RevaluSingleCollection

      for (const product of collectionData.materials) {
        collectionEpds.push(extractRevaluData({ body: product }, collection.collection_name))
      }
    }
    
    return collectionEpds
  } catch (error) {
    console.error(`Error fetching Collections:`, error)
    return null
  }
}