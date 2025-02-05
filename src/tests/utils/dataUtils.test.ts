import { describe, it, expect } from 'vitest'
import { ref, reactive } from 'vue'
import { 
  deepToRaw, 
  removeUndefinedFields, 
  getEnumEntries,
  collectParameters 
} from '@/utils/dataUtils'

import { mockObjects } from '@/tests/setup/testData'

describe('dataUtils', () => {
  describe('deepToRaw', () => {
    it('should handle primitive values', () => {
      expect(deepToRaw(42)).toBe(42)
      expect(deepToRaw('test')).toBe('test')
      expect(deepToRaw(null)).toBe(null)
    })

    it('should convert reactive objects', () => {
      const reactive_obj = reactive({ test: 'value' })
      const result = deepToRaw(reactive_obj)
      expect(result).toEqual({ test: 'value' })
    })

    it('should handle nested reactive objects', () => {
      const nested = reactive({
        outer: ref('value'),
        inner: reactive({ deep: ref('nested') })
      })
      const result = deepToRaw(nested)
      expect(result).toEqual({
        outer: 'value',
        inner: { deep: 'nested' }
      })
    })

    it('should handle arrays', () => {
      const array = reactive([ref(1), ref(2)])
      const result = deepToRaw(array)
      expect(result).toEqual([1, 2])
    })
  })

  describe('removeUndefinedFields', () => {
    it('should remove undefined fields', () => {
      const obj = {
        defined: 'value',
        undefined: undefined
      }
      expect(removeUndefinedFields(obj)).toEqual({ defined: 'value' })
    })

    it('should handle nested objects', () => {
      const obj = {
        outer: {
          defined: 'value',
          undefined: undefined
        }
      }
      expect(removeUndefinedFields(obj)).toEqual({
        outer: { defined: 'value' }
      })
    })

    it('should handle arrays', () => {
      const arr = [
        { defined: 'value' },
        { undefined: undefined }
      ]
      expect(removeUndefinedFields(arr)).toEqual([
        { defined: 'value' },
        {}
      ])
    })
  })

  describe('getEnumEntries', () => {
    it('should convert enum to label-value pairs', () => {
      enum TestEnum {
        First = 'FIRST',
        Second = 'SECOND'
      }
      const result = getEnumEntries(TestEnum)
      expect(result).toEqual([
        { label: 'First', value: 'FIRST' },
        { label: 'Second', value: 'SECOND' }
      ])
    })

    it('should handle numeric enums', () => {
      enum TestEnum {
        One = 1,
        Two = 2
      }
      const result = getEnumEntries(TestEnum)
      expect(result).toEqual([
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 }
      ])
    })
  })

  describe('collectParameters', () => {
    it('should collect simple parameters', () => {
      const paramSet = new Set<string>()
      collectParameters(mockObjects.simple, paramSet)
      expect(paramSet.has('name')).toBe(true)
      expect(paramSet.has('id')).toBe(true)
    })

    it('should skip GUID/hex values', () => {
      const paramSet = new Set<string>()
      collectParameters(mockObjects.simple, paramSet)
      expect(paramSet.has('guid')).toBe(false)
      expect(paramSet.has('name')).toBe(true)
    })

    it('should handle nested objects', () => {
      const obj = {
        outer: {
          inner: {
            value: 42
          }
        }
      }
      const paramSet = new Set<string>()
      collectParameters(obj, paramSet)
      expect(paramSet.has('outer')).toBe(true)
      expect(paramSet.has('inner')).toBe(true)
      expect(paramSet.has('value')).toBe(true)
    })

    it('should process arrays', () => {
      const obj = {
        items: [mockObjects.simple, mockObjects.complex]
      }
      const paramSet = new Set<string>()
      collectParameters(obj, paramSet)
      expect(paramSet.has('name')).toBe(true)
      expect(paramSet.has('id')).toBe(true)
    })

    it('should skip empty values', () => {
      const obj = {
        empty: {},
        nullValue: null,
        undefinedValue: undefined,
        emptyArray: []
      }
      const paramSet = new Set<string>()
      collectParameters(obj, paramSet)
      expect(paramSet.size).toBe(0)
    })
  })
})