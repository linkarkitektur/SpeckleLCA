import type { Mapping, MaterialFilterParam, Product } from "@/models/material"
import type { FilterList, NestedGroup } from "@/models/filters"
import type { GeometryObject } from "@/models/geometryObject"

import { useProjectStore } from "@/stores/main"
import { useMaterialStore } from "@/stores/material"
import { useSpeckleStore } from "@/stores/speckle"

import { setMappingColorGroup, updateProjectGroups } from "@/utils/projectUtils"


/**
 * Updates from a selected mapping to a new one, with all materials and objectIds
 * TODO: This needs a redo and optimisation
 * @param mapping Mapping object to update towards project and material store
 */
export function updateMapping(mapping: Mapping) {
  const projectStore = useProjectStore()
  const materialStore = useMaterialStore()

  // Keep this in memory to avoid unnecessary updates of groups
  let lastId = null

  mapping.steps.forEach(step => {
    if (lastId != step.filterId) {
      //Find the filter from the mapping and apply it to the project
      const filterList = mapping.filters.find(filter => filter.id == step.filterId);
      projectStore.updateRegistryStack(filterList.name, filterList.callStack)
      updateProjectGroups(true)

      lastId = step.filterId
    }
    //Search and find the group that we are updating
    const group = projectStore.getGroupById(step.nestedGroupId)
    
    if (group == null) {
      return
    } else {
      //Update the material for all objects in the group
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
    // If the filter list is not in the mapping, add it
    if (!materialStore.mapping.filters.includes(currFilterList)) {
      materialStore.mapping.filters.push(currFilterList)
    }
    materialStore.addStep(inGroup, materialStore.currentMapping, currFilterList.id)
  }

  // Apply materials to all objects in the group
  // TODO: I think this should be an automated function from the Step we added or moved to addStep instead
  inGroup.objects.forEach(obj => {
    if (materialStore.currentMapping != null) {
      obj.material = materialStore.currentMapping
      materialStore.updateMappingMaterial(obj.URI, materialStore.currentMapping)
    }
  })

  const mappingColors = setMappingColorGroup()
  speckleStore.setColorGroups(mappingColors)
}

/**
 * Function to sort through materials and only return relevant based on param List
 * @param materials Materials to sort through
 * @param paramFilters Filters to apply
 * @returns List of products matching filtering criteria
 */
export function applyParamFilters(materials: Product[], paramFilters: MaterialFilterParam) {
  let filteredList = materials
  // Go through each paramFilters and check if any are selected
  for (const key in paramFilters) {
    // If none of the filters are selected, skip this filter
    if (!paramFilters[key].some((param) => param.selected)) {
      continue
    }

    // Get the selected filter names (e.g., materialType, impactCategory)
    const selectedFilterNames = paramFilters[key]
      .filter((param) => param.selected)
      .map((param) => param.name)

    // Apply the filter based on the selected criteria
    filteredList = filteredList.filter((item) => {
      const materialType = item.metaData?.materialType
      // Check if materialType exists and is in the selected filters
      return materialType && selectedFilterNames.includes(materialType)
    })
  }

  return filteredList
}

/**
 * Gets the mapped material and returns a color based on it
 * @param group 
 * @returns 
 */
export function getMappedMaterial(objects: GeometryObject[]) {
  if (objects) {
    const materialNames = objects.map(obj => obj.material?.name)
    const uniqueMaterialNames = [...new Set(materialNames)]
    
    // Check if there are objects without materials to turn the card yellow
    const objectsWithoutMaterials = objects.filter(obj => obj.material == undefined).length > 0

    if (uniqueMaterialNames.length === 1) {
      if (uniqueMaterialNames[0] == undefined) {
        return {
          name: "No material mapped",
          color: "red-50"
        }
      } else {
        return {
          name: uniqueMaterialNames[0],
          color: "green-50"
        }
      }
    } else {
      return {
        name: "Mixed",
        color: objectsWithoutMaterials? "yellow-50" : "green-50"
      }
    }
  } else {
    return {
          name: "No material mapped",
          color: "red-50"
        }
  }
}