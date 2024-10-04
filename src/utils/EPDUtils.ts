import axios from 'axios'
import type { Product, Emission, LifeCycleStageEmission} from '@/models/material'
import { useProjectStore } from '@/stores/main'
import { EPDSource } from '@/models/settings'
import type { RevaluData } from '@/models/revaluDataSource'
//import { convertIlcd } from 'epdx'

const MAX_EPD_COUNT = 10
// Ilcd reference to GWP total
const GWP_REF_OBJECT_ID = '6a37f984-a4b3-458a-a20a-64418c145fa2'

/**
 * Creates an Axios instance with the necessary headers.
 */
const createApiClient = () => {
  const projectStore = useProjectStore()

  switch (projectStore.appSettings.epdSource) {
    case EPDSource.EcoPortal:
      return axios.create({
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_APP_ECO_PORTAL_API_KEY}`,
        },
      })
    case EPDSource.Revalu:
      return axios.create({
        headers: {
          "x-api-key": import.meta.env.VITE_APP_REVALU_API_KEY,
        },
      })
    default:
      return null
  }
}

const createListUrl = () => {
  const projectStore = useProjectStore()

  switch (projectStore.appSettings.epdSource) {
    case EPDSource.EcoPortal:
      return '/api/eco/resource/processes'
    case EPDSource.Revalu:
      return 'api/revalu/epds/search'
    default:
      return null
  }
}

const createEPDUrl = (epd: any) => {
  const projectStore = useProjectStore()

  switch (projectStore.appSettings.epdSource) {
    case EPDSource.EcoPortal:
      return `/${epd.nodeid}${epd.uuid}`
    case EPDSource.Revalu:
      return `/epd/${epd.uuid}`
    default:
      return null
  }
}

const createListParams = () => {
  const projectStore = useProjectStore()

  switch (projectStore.appSettings.epdSource) {
    case EPDSource.EcoPortal:
      return {
        search: 'true',
        distributed: 'true',
        virtual: 'true',
        metaDataOnly: 'false',
        startIndex: '0',
        pageSize: '100',
        format: 'json',
      }
    case EPDSource.Revalu:
      return {
        search_term: "",
        page_no: 1,
        page_size: 15,
      }
    default:
      return null
  }
}

const createEPDParams = () => {
  const projectStore = useProjectStore()

  switch (projectStore.appSettings.epdSource) {
    case EPDSource.EcoPortal:
      return {
        format: 'json',
        view: 'extended',
      }
    case EPDSource.Revalu:
      return {}
    default:
      return null
  }
}

const updatePageIndex = (params: any) => {
  const projectStore = useProjectStore()

  switch (projectStore.appSettings.epdSource) {
    case EPDSource.EcoPortal: {
      const startIndex = parseInt(params.startIndex) + params.pageSize
      return { ...params, startIndex: startIndex.toString() }
    }
    case EPDSource.Revalu:
      return { ...params, page_no: params.page_no + 1 }
    default:
      return params
  }
}

const extractEPDData = (data: any) => {
  const projectStore = useProjectStore()

  switch (projectStore.appSettings.epdSource) {
    case EPDSource.EcoPortal:
      return extractILCDData(data)
    case EPDSource.Revalu:
      return extractRevaluData(data) 
    default:
      return null
  }
}

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
      emission.gwp['a1a3'] = { amount: totalA1A3 }
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
  }
  return product
}

const extractRevaluData = (data: RevaluData) => {
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
    emission
  }
  return product
}

/**
 * Get all EPDs from the ECO Portal
 * Acording to parameters, check API documentation for more information
 * @param parameters Key value pairs for the API call
 * @returns List of products with emission data
 */
export async function getEPDList( 
  parameters: { [key: string]: string } = {}
): Promise<Product[]> {
  const EPDList: Product[] = []
  const apiClient = createApiClient()
  const baseUrl = createListUrl()
  let params = createListParams()

  params = { ...params, ...parameters }

  async function retreiveResourceList() {
    try {
      while (EPDList.length < MAX_EPD_COUNT) {
        try {
          const response = await apiClient.get(baseUrl, { params })
          const data = response.data

          if (!data || data.length === 0) {
            console.log('No more data to fetch')
            break
          }

          for (const epd of data.data) {
            try {
              const product = await getSpecificEPDEcoPortal(epd)
              EPDList.push(product)
            } catch (error) {
              console.error(error)
            }
          }
          // Update the start index for the next request
          params = updatePageIndex(params)
        } catch (error) {
          console.error(error)
          break
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
  await retreiveResourceList()
  
  return EPDList
}

/**
 * Fetches a specific EPD
 * @param epd The EPD data containing nodeid and uuid.
 * @returns A Product with EPD data or null if an error occurs.
 */
export async function getSpecificEPDEcoPortal(epd: any): Promise<Product | null> {
  const apiClient = createApiClient()
  const baseUrl = createEPDUrl(epd)
  const params = createEPDParams()

  try {
    const response = await apiClient.get(baseUrl, { params: params })
    const data = response.data

    const product = extractEPDData(data)
    return product
  } catch (error) {
    console.error(`Error fetching EPD ${epd.uuid}:`, error)
    return null
  }
}