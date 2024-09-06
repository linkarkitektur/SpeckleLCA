import { useProjectStore } from "@/stores/main"
import { useMaterialStore } from "@/stores/material"
import { useSpeckleStore } from "@/stores/speckle"

import { setMappingColorGroup } from "@/utils/projectUtils"

import type { Mapping } from "@/models/material"
import type { FilterList, NestedGroup } from "@/models/filters"

/**
 * Updates from a selected mapping to a new one, with all materials and objectIds
 * @param mapping Mapping object to update towards project and material store
 */
export function updateMapping(mapping: Mapping) {
  const projectStore = useProjectStore()
  const materialStore = useMaterialStore()

  mapping.steps.forEach(step => {
    const group = projectStore.getGroupById(step.nestedGroupId)
    
    if (group == null) {
      return
    } else {
      group.elements.forEach(obj => {
        obj.material = step.material
      })
    }

    materialStore.updateMappingMaterial(step.nestedGroupId, step.material)
  })
}

/**
 * Maps materials and updates the material store mapping with the current filter list and current selected material
 * Also sets the color groups for the speckle store and updates the color groups
 * @param inGroup nested group to map materials on
 */
export function mapMaterial(inGroup: NestedGroup) {
  const materialStore = useMaterialStore()
  const projectStore = useProjectStore()
  const speckleStore = useSpeckleStore()

  const currFilterList: FilterList = projectStore.filterRegistry.filterCallStack

  // If no mapping exists, create a new one and then add the step
  if (materialStore.mapping == null) {
    const newMapping: Mapping = {
      id: crypto.randomUUID(),
      name: 'temp',
      filters: [currFilterList],
      steps: []
    }
    materialStore.mapping = newMapping
    materialStore.addStep(inGroup, materialStore.currentMapping, currFilterList.id)
  } else {
    materialStore.addStep(inGroup, materialStore.currentMapping, currFilterList.id)
  }

  // Apply materials to all objects in the group
  inGroup.objects.forEach(obj => {
    if (materialStore.currentMapping != null) {
      obj.material = materialStore.currentMapping
      materialStore.updateMappingMaterial(obj.URI, materialStore.currentMapping)
    }
  })

  const mappingColors = setMappingColorGroup()
  speckleStore.setColorGroups(mappingColors)
}