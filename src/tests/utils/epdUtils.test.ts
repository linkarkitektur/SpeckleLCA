import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import { 
  extractRevaluData, 
  extractILCDData,
  getCollection,
  getEPDList,
  getSpecificEPD
} from '@/utils/EPDUtils'
import { createTestPinia } from '../setup/testUtils'
import { useSettingsStore } from '@/stores/settings'
import { APISource } from '@/models/material'

// Mock axios
/**
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn()
    }))
  }
}))

describe('EPDUtils', () => {
  beforeEach(() => {
    createTestPinia()
    vi.clearAllMocks()
  })

  describe('Revalu Service', () => {
    beforeEach(() => {
      const settingsStore = useSettingsStore()
      settingsStore.keySettings.materialKeys.revalu = 'test-key'
    })

    it('should extract Revalu EPD data', () => {
      const mockRevaluData = {
        body: {
          id: 'test-id',
          name: 'Test Product',
          manufacturer: 'Test Manufacturer',
          declared_unit: 'kg',
          gwp: { a1a3: 1.5 },
          gwp_fossil: { a1a3: 1.2 },
          fw: { a1a3: 0.5 },
          pert: { a1a3: 2.0 },
          penrt: { a1a3: 3.0 }
        }
      }

      const result = 
      extractRevaluData(mockRevaluData, 'TestCollection')
      expect(result.id).toBe('test-id')
      expect(result.source).toBe(APISource.Revalu)
      expect(result.metaData.Collection).toBe('TestCollection')
    })

    it('should fetch EPD list', async () => {
      const mockResponse = {
        data: {
          body: {
            search_results: [
              { id: 'epd1' },
              { id: 'epd2' }
            ]
          }
        }
      }

      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse)
      
      const result = await getEPDList()
      expect(result).toBeDefined()
    })

    it('should fetch collections', async () => {
      const mockCollectionResponse = {
        data: {
          body: {
            data: [
              { 
                collection_id: 'col1',
                collection_name: 'Collection 1'
              }
            ]
          }
        }
      }

      const mockCollectionDetails = {
        data: {
          body: {
            materials: [
              {
                id: 'mat1',
                name: 'Material 1',
                manufacturer: 'Manufacturer',
                declared_unit: 'kg',
                gwp: { a1a3: 1.0 }
              }
            ]
          }
        }
      }

      const axiosInstance = axios.create()
      axiosInstance.get
        .mockResolvedValueOnce(mockCollectionResponse)
        .mockResolvedValueOnce(mockCollectionDetails)

      const result = await getCollection()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('mat1')
    })
  })

  describe('ECOPortal Service', () => {
    beforeEach(() => {
      const settingsStore = useSettingsStore()
      settingsStore.materialSettings.APISource = {
        [APISource.Revalu]: true,
        [APISource.Boverket]: true,
        [APISource.ECOPortal]: false,
        [APISource.LCAbyg]: true,
        [APISource.Organisation]: false,
      }
      settingsStore.keySettings.materialKeys.ecoPortal = 'test-key'
    })

    it('should extract ILCD data', () => {
      const mockILCDData = {
        processInformation: {
          dataSetInformation: {
            UUID: 'test-uuid',
            name: { baseName: [{ value: 'Test Product' }] }
          }
        },
        exchanges: {
          exchange: [{
            flowProperties: [{
              referenceUnit: 'kg',
              meanValue: '1.0'
            }]
          }]
        }
      }

      const result = extractILCDData(mockILCDData)
      expect(result.id).toBe('test-uuid')
      expect(result.source).toBe(APISource.ECOPortal)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid EPD service', async () => {
      const settingsStore = useSettingsStore()
      settingsStore.materialSettings.APISource = 'invalid' as APISource
      
      await expect(getEPDList()).rejects.toThrow('Unsupported EPD source')
    })

    it('should handle API errors', async () => {
      axios.create().get.mockRejectedValue(new Error('API Error'))
      
      const result = await getEPDList()
      expect(result).toEqual([])
    })
  })
})
*/