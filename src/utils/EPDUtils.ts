import axios from 'axios'
import type { LifeCycleStage } from 'lcax'
import type { Product, Emission} from '@/models/material'
//import { convertIlcd } from 'epdx'

/**
 * Get all EPDs from the ECO Portal
 * Acording to parameters, check API documentation for more information
 * @param parameters Key value pairs for the API call
 * @returns List of products with emission data
 */
export async function getEPDListEcoPortal( 
  parameters: { [key: string]: string } = {}
): Promise<Product[]> {
  const EPDList: Product[] = []
  const apiClient = axios.create({
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_APP_ECO_PORTAL_API_KEY}`
    }
  })
  
  const baseUrl = '/api/eco/resource/processes'

  let params = {
    search: 'true',
    distributed: 'true',
    virtual: 'true',
    metaDataOnly: 'false',
    startIndex: '0',
    pageSize: '100',
    format: 'json',
  }

  params = { ...params, ...parameters }

  async function retreiveResourceList() {
    try {
      while (EPDList.length < 10) {
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
          params.startIndex = String(parseInt(params.startIndex) + data.length)
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
 * Get specific EPD from the ECO Portal
 * @param id ID of the EPD
 * @returns Product with EPD data
 */
export async function getSpecificEPDEcoPortal(epd: any): Promise<Product> {
  const apiClient = axios.create({
    headers: {
      Authorization: 'Bearer ' + import.meta.env.VITE_APP_ECO_PORTAL_API_KEY
    }
  })
  const baseUrl = epd.nodeid
  const urlData = epd.uuid
  const url = '/' + baseUrl + urlData
  const datasetParams = {
    format: 'json',
    view: 'extended'
  }

  try {
    const response = await apiClient.get(url, { params: datasetParams })
    const data = response.data
    const metaData = {}
    data.processInformation.dataSetInformation.classificationInformation.classification.forEach(classification => {
      classification.class.forEach(cls => {
        metaData[cls.classId] = cls.value
      })
    })

    const gwpToT = data.LCIAResults.LCIAResult.find(result => result.referenceToLCIAMethodDataSet.refObjectId === '6a37f984-a4b3-458a-a20a-64418c145fa2')
    const emission: Emission = {} as Emission
    let A1A3 = 0

    gwpToT.other.anies.forEach(anies => {
      if (["A1", "A2", "A3"].includes(anies.module)) {
        A1A3 += parseFloat(anies.value)
      } else {
        if (!emission["gwp"]) {
          emission["gwp"] = {}
        }
        emission["gwp"][anies.module?.toLowerCase().replace(/-/g, '') as LifeCycleStage] = { amount: parseFloat(anies.value) }
      }

      if (A1A3 > 0) {
        if (!emission["gwp"]) {
          emission["gwp"] = {}
        }
        emission["gwp"]["a1a3"] = { amount: A1A3 }
      }
    })

    const flowProps = data.exchanges.exchange[0].flowProperties
    const { unit, index } = flowProps.reduce(
      (acc, prop, idx) => {
        if (!acc.referenceUnit && prop.referenceUnit) {
          return { unit: prop.referenceUnit, index: idx }
        }
        return acc
      },
      { unit: "", index: -1 }
    )
    const quantity = parseFloat(data.exchanges.exchange[0].flowProperties[index].meanValue)

    const product: Product = {
      id: data.processInformation.dataSetInformation.UUID,
      name: data.processInformation.dataSetInformation.name.baseName[0].value,
      description: data.processInformation.technology.technologyDescriptionAndIncludedProcesses[0].value,
      referenceServiceLife: 50,
      impactData: null,
      quantity: quantity,
      unit: unit,
      transport: null,
      results: null,
      metaData: metaData,
      emission: emission
    }
  
    return product
  } catch (error) {
    //console.error(error)
    return null
  }
}