import { describe, it, expect, beforeEach } from 'vitest'
import { 
  createNestedObject,
  updateProjectGroups,
  updateGroupColors 
} from '@/utils/projectUtils'
import { createTestPinia } from '../setup/testUtils'
import { mockGroups, mockObjects } from '../setup/testData'
import { useProjectStore } from '@/stores/main'
import { FilterRegistry } from '@/models/filters'

describe('projectUtils', () => {
  beforeEach(() => {
    createTestPinia()
  })

  describe('createNestedObject', () => {
    it('should create nested structure from flat groups', () => {
      const result = createNestedObject([mockGroups.single])
      expect(result.name).toBe('root')
      expect(result.children[0].name).toBe(mockGroups.single.path[0])
    })

    it('should handle empty groups array', () => {
      const result = createNestedObject([])
      expect(result.children).toHaveLength(0)
    })

    it('should merge groups with same path', () => {
      const groups = [mockGroups.single, mockGroups.single]
      const result = createNestedObject(groups)
      expect(result.children).toHaveLength(1)
    })
  })

  describe('updateProjectGroups', () => {
    it('should update groups based on current filters', () => {
      const projectStore = useProjectStore()
      const registry = new FilterRegistry()
      projectStore.setFilterRegistry(registry)
      projectStore.updateProject({
        id: '1',
        name: 'test',
        description: '',
        geometry: [mockObjects.simple]
      })

      updateProjectGroups(true)
      expect(projectStore.projectGroups).toBeDefined()
    })
  })
  /**
  describe('updateGroupColors', () => {
    it('should assign colors to groups', () => {
      const tree = [mockGroups.single]
      updateGroupColors(tree)
      expect(tree[0].color).toBeDefined()
    })

    it('should use provided colors for specific groups', () => {
      const tree = [mockGroups.single]
      const testColor = '#ff0000'
      updateGroupColors(tree, [mockGroups.single.id], [testColor])
      expect(tree[0].color).toBe(testColor)
    })
  })
  */
})