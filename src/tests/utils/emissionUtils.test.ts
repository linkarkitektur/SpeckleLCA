import { describe, it, expect, beforeEach } from 'vitest'
import { EmissionCalculator } from '@/utils/emissionUtils'
import { createTestPinia } from '../setup/testUtils'
import { mockObjects } from '../setup/testData'
import { useSettingsStore } from '@/stores/settingStore'

describe('emissionUtils', () => {
  beforeEach(() => {
    createTestPinia()
  })

  describe('EmissionCalculator', () => {
    let calculator: EmissionCalculator

    beforeEach(() => {
      calculator = new EmissionCalculator([mockObjects.simple])
    })

    it('should calculate emissions for simple object', () => {
      const result = calculator.calculateEmissions()
      expect(result).toBe(true)
      expect(mockObjects.simple.results).toBeDefined()
      expect(mockObjects.simple.results![0].emission).toBeDefined()
    })

    it('should calculate emissions for complex assembly', () => {
      calculator = new EmissionCalculator([mockObjects.complex])
      const result = calculator.calculateEmissions()
      expect(result).toBe(true)
      expect(mockObjects.complex.results).toBeDefined()
      expect(mockObjects.complex.results![0].emission).toBeDefined()
    })

    it('should handle empty object list', () => {
      calculator = new EmissionCalculator([])
      const result = calculator.calculateEmissions()
      expect(result).toBe(true)
    })

    it('should handle objects without materials', () => {
      calculator = new EmissionCalculator([mockObjects.empty])
      const result = calculator.calculateEmissions()
      expect(result).toBe(true)
      expect(mockObjects.empty.results).toBeUndefined()
    })

    it('should respect calculation settings', () => {
      const settingsStore = useSettingsStore()
      settingsStore.calculationSettings.standardImpactCategory = 'gwp_total'
      settingsStore.calculationSettings.includedStages.relevantStages = [
        { stage: 'a1a3', included: true },
        { stage: 'a4', included: false }
      ]

      const result = calculator.calculateEmissions()
      expect(result).toBe(true)
      const emissions = mockObjects.simple.results![0].emission
      expect(emissions.gwp_total.a1a3).toBeDefined()
      expect(emissions.gwp_total.a4).toBeUndefined()
    })

    it('should handle fallback to gwp when impact category not found', () => {
      const settingsStore = useSettingsStore()
      settingsStore.calculationSettings.standardImpactCategory = 'ap'
      
      const result = calculator.calculateEmissions()
      expect(result).toBe(true)
      expect(mockObjects.simple.results![0].emission).toBeDefined()
    })
  })
})