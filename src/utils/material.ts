import { useProjectStore } from "@/stores/main"
import { useMaterialStore } from "@/stores/material"
import type { Mapping } from "@/models/material"

/**
 * Updates from a selected mapping to a new one, with all materials and objectIds
 * @param mapping Mapping object to update towards project and material store
 */
export function updateMapping(mapping: Mapping) {
  const projectStore = useProjectStore()
  const materialStore = useMaterialStore()
  mapping.materials.forEach(el => {
    const obj = projectStore.getGeometryObjectById(mapping.id)
    obj.material = el.material

    materialStore.updateMappingMaterial(el.objId, el.material)
  })
}