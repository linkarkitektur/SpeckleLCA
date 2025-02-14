import { describe, it, expect, beforeEach } from 'vitest'
import { updateMapping, clearMapping } from '@/utils/material'
import { createTestPinia } from '../setup/testUtils'
import { useProjectStore } from '@/stores/main'
import { useMaterialStore } from '@/stores/material'
import { mockObjects } from '@/tests/setup/testData'

import type { Project } from '@/models/project'
/**
describe('material', () => {
  beforeEach(() => {
    createTestPinia()
    const projectStore = useProjectStore()
    const project: Project = {
      name: 'Test Project',
      description: 'Test Description',
      id: 'test-id',
      geometry: []
    }
    projectStore.currProject = project

    projectStore.addGeometry(mockObjects.simple)
    projectStore.addGeometry(mockObjects.complex)
  })

  describe('updateMapping', () => {
    it('should apply mapping steps in order', () => {
      const mockMapping = {
        id: 'test-mapping',
        name: 'Test Mapping',
        filters: [
          {
            id: 'filter1',
            name: 'equalsFilter',
            callStack: ['material', 'Concrete']
          }
        ],
        steps: [
          {
            filterId: 'filter1',
            nestedGroupId: 'group1',
            material: 'Concrete'
          }
        ]
      }

      updateMapping(mockMapping)
      const materialStore = useMaterialStore()
      const projectStore = useProjectStore()

      console.log(projectStore.currProject)

      expect(projectStore.currProject.geometry[0].material.name).toEqual("Concrete")
    })

    it('should avoid duplicate filter applications', () => {
      const mockMapping = {
        id: 'test-mapping',
        name: 'Test Mapping',
        filters: [
          {
            id: 'filter1',
            name: 'equalsFilter',
            callStack: ['material', 'concrete']
          }
        ],
        steps: [
          {
            filterId: 'filter1',
            nestedGroupId: 'group1',
            material: 'concrete'
          },
          {
            filterId: 'filter1',
            nestedGroupId: 'group2',
            material: 'concrete'
          }
        ]
      }

      updateMapping(mockMapping)
      const projectStore = useProjectStore()
      expect(projectStore.filterCallCount).toBe(1)
    })
  })

  describe('clearMapping', () => {
    it('should reset material mappings', () => {
      const materialStore = useMaterialStore()
      materialStore.addMaterial('test', 'concrete')
      
      clearMapping()
      expect(materialStore.mappedMaterials.size).toBe(0)
    })

    it('should reset project groups', () => {
      const projectStore = useProjectStore()
      projectStore.updateProject({
        id: 'test',
        name: 'Test Project',
        groups: [{ id: 'group1', name: 'Group 1' }]
      })

      clearMapping()
      expect(projectStore.projectGroups).toEqual([])
    })
  })
})
*/