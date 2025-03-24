import { describe, it, expect, beforeEach, vi } from 'vitest'
import { preloadDashboardData } from '@/services/preLoader'
import { createTestPinia } from '../setup/testUtils'
import { useProjectStore } from '@/stores/projectStore'
import { useMaterialStore } from '@/stores/materialStore'
import { getAssemblyList } from '@/utils/materialUtils'
import { getRevaluCollections } from '@/models/revaluModel'

// Mock external functions
vi.mock('@/utils/material', () => ({
  getAssemblyList: vi.fn()
}))

vi.mock('@/models/revaluDataSource', () => ({
  getRevaluCollections: vi.fn()
}))

describe('preLoader', () => {
  beforeEach(() => {
    createTestPinia()
    vi.clearAllMocks()
  })

  describe('preloadDashboardData', () => {
    it('should load all required data successfully', async () => {
      const projectStore = useProjectStore()
      const materialStore = useMaterialStore()
      
      // Mock store methods
      projectStore.getAvailableParameterList = vi.fn().mockResolvedValue(['param1'])
      materialStore.materialsFromJson = vi.fn()

      await preloadDashboardData()

      expect(projectStore.getAvailableParameterList).toHaveBeenCalled()
      expect(materialStore.materialsFromJson).toHaveBeenCalled()
      expect(getAssemblyList).toHaveBeenCalled()
      expect(getRevaluCollections).toHaveBeenCalled()
    })

    it('should handle errors during preload', async () => {
      const projectStore = useProjectStore()
      const consoleSpy = vi.spyOn(console, 'error')
      
      // Mock error
      projectStore.getAvailableParameterList = vi.fn().mockRejectedValue(new Error('Test error'))

      await preloadDashboardData()

      expect(consoleSpy).toHaveBeenCalledWith('Error preloading dashboard data:', expect.any(Error))
    })

    it('should continue loading other data if one call fails', async () => {
      const projectStore = useProjectStore()
      const materialStore = useMaterialStore()
      
      projectStore.getAvailableParameterList = vi.fn().mockRejectedValue(new Error())
      materialStore.materialsFromJson = vi.fn()

      await preloadDashboardData()

      expect(materialStore.materialsFromJson).toHaveBeenCalled()
      expect(getAssemblyList).toHaveBeenCalled()
    })
  })
})