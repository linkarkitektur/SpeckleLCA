import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  speckleFetch, 
  calculateQuantity,
  getUserData 
} from '@/utils/speckleUtils'
import { createTestPinia } from '../setup/testUtils'
import { useSpeckleStore } from '@/stores/speckle'

/** 
describe('speckleUtils', () => {
  beforeEach(() => {
    createTestPinia()
    vi.clearAllMocks()
  })

  describe('speckleFetch', () => {
    it('should make successful API call', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      })

      const result = await speckleFetch('query { test }')
      expect(result).toEqual({ data: 'test' })
    })

    it('should handle API errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400
      })

      await expect(speckleFetch('query')).rejects.toThrow()
    })
  })

  describe('calculateQuantity', () => {
    it('should calculate area correctly', () => {
      const obj = {
        area: 1000000, // 1m2 in mm2
        speckle_type: 'Objects.BuiltElements.Floor'
      }
      const result = calculateQuantity(obj)
      expect(result.m2).toBe(1)
    })

    it('should handle multiple units', () => {
      const obj = {
        area: 2000000,
        volume: 3000000000,
        length: 4000
      }
      const result = calculateQuantity(obj)
      expect(result.m2).toBe(2)
      expect(result.m3).toBe(3)
      expect(result.m).toBe(4)
    })

    it('should handle missing properties', () => {
      const obj = {
        speckle_type: 'Objects.BuiltElements.Floor'
      }
      const result = calculateQuantity(obj)
      expect(result.m2).toBe(0)
    })
  })


  describe('getUserData', () => {
    it('should fetch user data when authenticated', async () => {
      const speckleStore = useSpeckleStore()
      speckleStore.isAuthenticated = true
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { user: { name: 'Test' } } })
      })

      const result = await getUserData()
      expect(result.name).toBe('Test')
    })

    it('should handle unauthenticated state', async () => {
      const speckleStore = useSpeckleStore()
      speckleStore.isAuthenticated = false
      
      const result = await getUserData()
      expect(result).toBeNull()
    })
  })
})
*/