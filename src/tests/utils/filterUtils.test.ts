import { describe, it, expect, beforeEach } from 'vitest'
import { 
  iterativeFieldSearch,
  iterativeValueCheck,
  createComparisonFilter,
  addObjToGroup,
  createStandardFilters,
  addFilter 
} from '@/utils/filterUtils'
import { createTestPinia } from '../setup/testUtils'
import { mockObjects, mockGroups, mockFilterValues } from '../setup/testData'
import { useProjectStore } from '@/stores/main'
import { FilterRegistry } from '@/models/filters'

import type { Group } from '@/models/filters'

describe('filterUtils', () => {
  beforeEach(() => {
    createTestPinia()
  })

  describe('iterativeFieldSearch', () => {
    it('should find field in simple object', () => {
      expect(iterativeFieldSearch(mockObjects.simple, 'material')).toBe('Concrete')
    })

    it('should find field in nested object', () => {
      expect(iterativeFieldSearch(mockObjects.complex, 'level')).toEqual("1")
    })

    it('should handle object with value property', () => {
      expect(iterativeFieldSearch(mockObjects.simple, 'description')).toBe('Ready-mix concrete')
    })

    it('should return null for non-existent field', () => {
      expect(iterativeFieldSearch(mockObjects.simple, 'nonexistent')).toBeNull()
    })

    it('should handle circular references', () => {
      expect(iterativeFieldSearch(mockObjects.withCircular, 'name')).toBe('circular')
    })

    it('should handle null and undefined values', () => {
      expect(iterativeFieldSearch(mockObjects.complex, 'nullValue')).toBeNull()
      expect(iterativeFieldSearch(mockObjects.complex, 'undefinedValue')).toBeNull()
    })

    it('should handle empty objects', () => {
      expect(iterativeFieldSearch(mockObjects.empty, 'any')).toBeNull()
    })

    it('should handle special characters in field names', () => {
      expect(iterativeFieldSearch(mockObjects.withSpecialChars, 'field.with.dots')).toBe('value')
      expect(iterativeFieldSearch(mockObjects.withSpecialChars, 'field-with-dashes')).toBe('value2')
      expect(iterativeFieldSearch(mockObjects.withSpecialChars, 'field with spaces')).toBe('value3')
    })
  })

  describe('iterativeValueCheck', () => {
    it('should compare simple values', () => {
      const result = iterativeValueCheck(
        mockObjects.simple,
        'material',
        (a, b) => a === b,
        "Concrete"
      )
      expect(result).toBe(true)
    })

    it('should handle nested value objects', () => {
      const result = iterativeValueCheck(
        mockObjects.complex,
        'level',
        (a, b) => a === '1',
        '1'
      )
      expect(result).toBe(true)
    })

    it('should handle non-existent fields', () => {
      const result = iterativeValueCheck(
        mockObjects.empty,
        'nonexistent',
        (a, b) => a === b,
        'any'
      )
      expect(result).toBe(false)
    })

    it('should handle circular references', () => {
      const result = iterativeValueCheck(
        mockObjects.withCircular,
        'name',
        (a, b) => a === b,
        'circular'
      )
      expect(result).toBe(true)
    })
  })

  describe('addFilter', () => {
    it('should register filter in registry', () => {
      const projectStore = useProjectStore()
      const registry = new FilterRegistry()
			projectStore.setFilterRegistry(registry)
      addFilter('testFilter', () => [])
      expect(projectStore.filterRegistry.hasFilter('testFilter')).toBe(true)
    })
    
    it('should handle duplicate filter names', () => {
      const projectStore = useProjectStore()
      const registry = new FilterRegistry()
      projectStore.setFilterRegistry(registry)
      addFilter('duplicateFilter', () => [])
      addFilter('duplicateFilter', () => [])
      expect(projectStore.filterRegistry.hasFilter('duplicateFilter')).toBe(true)
    })
  })

  describe('createComparisonFilter', () => {
    it('should create equals filter', () => {
      const projectStore = useProjectStore()
      const registry = new FilterRegistry()
      projectStore.setFilterRegistry(registry)
      createComparisonFilter('testEquals', (a, b) => a === b)
      const groups = [mockGroups.single]
      const result = projectStore.filterRegistry?.callFilter(
        `testEquals`,
        groups,
        `material`,
        `concrete`,
        false
      )
      expect(result[0].elements).toContain(mockObjects.simple)
    })

    it('should handle non matching value and create noData group', () => {
      const projectStore = useProjectStore()
      const registry = new FilterRegistry()
      projectStore.setFilterRegistry(registry)
      createComparisonFilter('testNonMatch', (a, b) => a === b)
      const groups = [mockGroups.single]
      const result = projectStore.filterRegistry?.callFilter(
        `testNonMatch`,
        groups,
        `material`,
        `nonexistent`,
        false
      )
      expect(result).toHaveLength(1)
    })

    it('should handle non matching value and remove them from group', () => {
      const projectStore = useProjectStore()
      const registry = new FilterRegistry()
      projectStore.setFilterRegistry(registry)
      createComparisonFilter('testNonMatch', (a, b) => a === b)
      const groups = [mockGroups.single]
      const result = projectStore.filterRegistry?.callFilter(
        `testNonMatch`,
        groups,
        `material`,
        `nonexistent`,
        true
      )
      expect(result).toHaveLength(0)
    })
  })

  describe('addObjToGroup', () => {
    it('should add object to existing group', () => {
      const outGroups: { [key: string]: Group } = {}
      addObjToGroup(outGroups, mockObjects.simple, true, mockGroups.single, 'testField')
      const groupKey = 'testField' + mockGroups.single.path.join('')
      expect(outGroups[groupKey].elements).toContain(mockObjects.simple)
    })

    it('should create new group with correct path', () => {
      const outGroups: { [key: string]: Group } = {}
      addObjToGroup(outGroups, mockObjects.simple, true, mockGroups.single, 'newGroup')
      const groupKey = 'newGroup' + mockGroups.single.path.join('')
      expect(outGroups[groupKey].path).toEqual([...mockGroups.single.path, 'newGroup'])
    })
  })

  describe('createStandardFilters', () => {
    it('should register all standard filters to registry', () => {
      const projectStore = useProjectStore()
      const registry = new FilterRegistry()
      projectStore.setFilterRegistry(registry)
      createStandardFilters()
      expect(projectStore.filterRegistry.hasFilter('equalsFilter')).toBe(true)
      expect(projectStore.filterRegistry.hasFilter('notEqualsFilter')).toBe(true)
      expect(projectStore.filterRegistry.hasFilter('greaterThan')).toBe(true)
      expect(projectStore.filterRegistry.hasFilter('groupBy')).toBe(true)
    })
  })
})