import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ResultCalculator } from '@/utils/resultUtils'
import { createTestPinia } from '../setup/testUtils'
import { mockObjects } from '../setup/testData'

/** 
describe('ResultUtils', () => {
  let calculator: ResultCalculator

  beforeEach(() => {
    createTestPinia()
    calculator = new ResultCalculator()
  })

  describe('ResultCalculator', () => {
    it('should initialize with empty results', () => {
      expect(calculator.results).toEqual([])
      expect(calculator.totalEmission).toEqual({})
    })

    it('should calculate results for geometry objects', () => {
      calculator.calculate([mockObjects.simple])
      expect(calculator.results.length).toBeGreaterThan(0)
    })

    it('should handle empty object list', () => {
      calculator.calculate([])
      expect(calculator.results.length).toBe(0)
    })
  })

  describe('Emission Aggregation', () => {
    it('should aggregate total emissions correctly', () => {
      const mockEmission = {
        gwp: {
          A1A3: 100,
          A4: 50
        }
      }
      calculator['aggregateTotalEmissions'](mockEmission)
      expect(calculator.totalEmission.gwp.A1A3).toBe(100)
      expect(calculator.totalEmission.gwp.A4).toBe(50)
    })

    it('should aggregate multiple emissions', () => {
      const emissions = [
        { gwp: { A1A3: 100 } },
        { gwp: { A1A3: 200 } }
      ]
      emissions.forEach(e => calculator['aggregateTotalEmissions'](e))
      expect(calculator.totalEmission.gwp.A1A3).toBe(300)
    })
  })

  describe('Result List Management', () => {
    it('should aggregate emissions for result list', () => {
      const mockGeo = {
        parameters: {
          level: '1',
          emission: { gwp: { A1A3: 100 } }
        }
      }
      calculator.resultList = [{ parameter: 'level', results: [] }]
      calculator['aggregateEmissionsForResultList'](mockGeo)
      expect(calculator.resultList[0].results.length).toBeGreaterThan(0)
    })

    it('should handle missing parameters', () => {
      const mockGeo = { parameters: {} }
      calculator.resultList = [{ parameter: 'nonexistent', results: [] }]
      calculator['aggregateEmissionsForResultList'](mockGeo)
      expect(calculator.resultList[0].results.length).toBe(0)
    })
  })

  describe('File Operations', () => {
    it('should save results', () => {
      const saveSpy = vi.spyOn(calculator, 'saveResults')
      calculator.calculate([mockObjects.simple], true)
      expect(saveSpy).toHaveBeenCalled()
    })

    it('should not save results when save is false', () => {
      const saveSpy = vi.spyOn(calculator, 'saveResults')
      calculator.calculate([mockObjects.simple], false)
      expect(saveSpy).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid emission data', () => {
      const invalidGeo = {
        parameters: {
          emission: 'invalid'
        }
      }
      expect(() => calculator.calculate([invalidGeo])).not.toThrow()
    })

    it('should handle undefined parameters', () => {
      const undefinedGeo = {
        parameters: undefined
      }
      expect(() => calculator.calculate([undefinedGeo])).not.toThrow()
    })
  })
})
*/