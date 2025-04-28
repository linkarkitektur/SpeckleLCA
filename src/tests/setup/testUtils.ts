import { createPinia, setActivePinia } from 'pinia'
import { useSpeckleStore } from '@/stores/speckleStore'
import { useProjectStore } from '@/stores/projectStore'
import type { FilterRegistry } from '@/models/filterModel'
import { mockProjectDetails, mockVersion, mockSpeckleStream, mockProducts, mockMapping } from './testData'
import { vi } from 'vitest'
import { useMaterialStore } from '@/stores/materialStore'
import { createStandardFilters } from '@/utils/filterUtils'

/**
 * Create a new Pinia instance and set it as the active Pinia instance.
 */
export function createTestPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Set up Speckle store with mock data for testing
 */
export function setupSpeckleStore() {
  const speckleStore = useSpeckleStore()
  speckleStore.setSelectedVersion(mockVersion)
  speckleStore.setProjectDetails(mockProjectDetails)
  vi.spyOn(speckleStore, 'getObjects').mockResolvedValue(mockSpeckleStream)
  return speckleStore
}

/**
 * Set up filter registry with standard filter stack
 */
export function setupFilterRegistry(registry: FilterRegistry) {
  const projectStore = useProjectStore()
  projectStore.setFilterRegistry(registry)
  createStandardFilters()
  
  const filterStack = [
    {
      advanced: false,
      field: "simpleParameters.category",
      name: "groupBy",
      remove: false,
      value: ""
    },
    {
      advanced: false,
      field: "simpleParameters.type",
      name: "groupBy",
      remove: false,
      value: ""
    },
    {
      advanced: false,
      field: "simpleParameters.materialName",
      name: "groupBy",
      remove: false,
      value: ""
    }
  ]

  projectStore.updateRegistryStack('Standard filter', filterStack, [])
  return projectStore
}

/**
 * Set up material store with mock products and mapping
 */
export function setupMaterialStore() {
  const materialStore = useMaterialStore()
  materialStore.addMaterialList(mockProducts)
  materialStore.setMapping(mockMapping)
  return materialStore
}

/**
 * Setup the mappings with steps and filters
 * @returns defined mapping with steps
 */
export function setupMapping() {
  const projectStore = useProjectStore()
  const materialStore = useMaterialStore()

  mockMapping.filters = [projectStore.filterRegistry.filterList]
  mockMapping.steps = [
    {
      filterId: projectStore.filterRegistry.filterList.id,
      nestedGroupId: "Columns",
      material: materialStore.materials[2] // Wood
    },
    {
      filterId: projectStore.filterRegistry.filterList.id,
      nestedGroupId: "Floors",
      material: materialStore.materials[2] // Wood
    },
    {
      filterId: projectStore.filterRegistry.filterList.id,
      nestedGroupId: "Beams",
      material: materialStore.materials[2] // Wood
    },
    {
      filterId: projectStore.filterRegistry.filterList.id,
      nestedGroupId: "Walls",
      material: materialStore.materials[0] // Concrete
    },
    // It should overwrite these specific mappings over the general ones done above.
    {
      filterId: projectStore.filterRegistry.filterList.id,
      nestedGroupId: "Columns|Square Column",
      material: materialStore.materials[0] // Concrete
    },
    {
      filterId: projectStore.filterRegistry.filterList.id,
      nestedGroupId: "Beams|I-Beam|Steel",
      material: materialStore.materials[1] // Steel
    },
  ]
  return mockMapping
}