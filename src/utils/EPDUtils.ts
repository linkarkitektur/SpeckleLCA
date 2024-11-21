import axios from 'axios'
import type { AxiosInstance } from 'axios'

import { delay } from '@/utils/math'

import { useSettingsStore } from '@/stores/settings'

import { EPDSource } from '@/models/settings'
import type { RevaluData } from '@/models/revaluDataSource'
import { type Product, type Emission, type LifeCycleStageEmission, type Assembly, Source} from '@/models/material'

//import { convertIlcd } from 'epdx'

const MAX_EPD_COUNT = 5
// Ilcd reference to GWP total
const GWP_REF_OBJECT_ID = '6a37f984-a4b3-458a-a20a-64418c145fa2'

interface EPDService {
  createApiClient(): AxiosInstance
  createListUrl(): string
  createEPDUrl(epd: any): string
  createListParams(): any
  createEPDParams(): any
  updatePageIndex(params: any): any
  extractEPDData(data: any): Product | null
  extractEPDList(data: any): any[]
}

/**
 * Class for fetching data from EcoPortal
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
  
  createListUrl() {
    return 'api/revalu/epds/search'
  }

  createEPDUrl(epd: any) {
    return `api/revalu/epds/${epd.id}`
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
const extractRevaluData = (response: { body: RevaluData }) => {
  const data = response.body
  const emission: Emission = {
    gwp: data.gwp,
    //gwp_fossil: data.gwp_fossil,
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
    metaData: {},
    emission,
    source: Source.Revalu,
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
 * Get all EPDs from the ECO Portal
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