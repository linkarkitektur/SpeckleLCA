import { type Mapping, type Assembly, type Product, APISource } from '@/models/material'
import { defineStore } from 'pinia'
import materialList from '@/tests/objects/materialList.json'
import type { NestedGroup } from "@/models/filters"

export const useMaterialStore = defineStore({
  id: 'materialStore',
  state: () => ({
    materials: [] as Product[],
    assemblies: [] as Assembly[],
    currentMapping: null as Product | Assembly | null,
    currentAssemby: null as Assembly | null,
    EPDMode: true,
    EPDList: [] as Product[],
    assemblyList: [] as Assembly[],
    mapping: null as Mapping | null,
  }),
  actions: {
    /**
     * Add material to store
     * @param material 
     */
    addMaterial(material: Product) {
      this.materials.push(material)
    },
    
    /**
     * Add material list to store
     * @param materials
    */
    addMaterialList(materials: Product[]) {
      this.materials = materials
    },

    /**
     * Remove material from store
     * @param material 
     */
    removeMaterial(material: Product) {
      const index = this.materials.indexOf(material)
      if (index !== -1) {
        this.materials.splice(index, 1)
      }
    },

    /**
     * Add assembly to store
     * @param assembly
     */
    addAssembly(assembly: Assembly) {
      const index = this.assemblies.findIndex((el) => el.id === assembly.id)
      if (index !== -1) {
        this.assemblies[index] = assembly;
      } else {
        this.assemblies.push(assembly);
      }
    },

    /**
     * Remove assembly from store
     * @param assembly
     */
    removeAssembly(assembly: Assembly) {
      const index = this.assemblies.indexOf(assembly)
      if (index !== -1) {
        this.assemblies.splice(index, 1)
      }
    },

    /**
     * Set current mapping material which is being dragged
     * @param mapping either EPD or Assembly
     */
    setCurrentMapping(mapping: Product | Assembly) {
      this.currentMapping = mapping
    },

    /**
     * Set current assembly which is being dragged
     * @param assembly
     */
    setCurrentAssembly(assembly: Assembly) {
      this.currentAssemby = assembly
    },

    /**
     * set filtered EPD list
     */
    setFilteredMaterials(materials: Product[]) {
      this.EPDList = materials
    },

    /**
     * Returns the current mapping
     */
    getCurrentMapping() {
      return this.mapping
    },

    /**
     * Update EPD list from JSON path 
     */
    async materialsFromJson() {
      try {
        this.materials = materialList.map((material: any) => ({
          ...material,
          metaData: {
            materialType: material["materialType"],
            Collection: material?.metaData?.Collection ?? "-",  // Check for metaData.Collection, set to "-" if it doesn't exist
        },
          source: APISource.LCAbyg
        })) as any

        this.EPDList = this.materials
      } catch (error) {
        console.error('Error fetching JSON:', error)
      }
    },

    /**
     * Set Mapping for saving and reloading from firebase
     */
    setMapping(mapping: Mapping) {
      this.mapping = mapping
    },

    /**
     * Update Mapping material for specific nesterGroupId
     * @param nestedGroupId id for the group to update
     * @param material EPD or Assembly cannot be null
     */
    updateMappingMaterial(nestedGroupId: string, material: Product | Assembly) {
      if (!this.mapping) {
        this.mapping = {
          id: crypto.randomUUID(),
          name: 'temp',
          filters: [],
          steps: []
        }
      }
      const index = this.mapping.steps.findIndex((step) => step.nestedGroupId === nestedGroupId)
      if (index !== -1) {
        this.mapping.steps[index].material = material
      }
    },

    /**
     * Remove material for nested group
     * @param nestedGroupId nested Group Id
     */
    removeMappingMaterial(nestedGroupId: string) {
      const index = this.mapping.steps.findIndex((mat) => mat.nestedGroupId === nestedGroupId)
      if (index !== -1) {
        this.mapping.steps.splice(index, 1)
      }
    },

    /**
     * Add step to current mapping
     * @param filterId filter id from current filter list to add to mapping object
     * @param nestedGroup nested group to add mapping towards 
     * @param material material to add to mapping
     */
    addStep(nestedGroup: NestedGroup, material: Product | Assembly, filterId: string) {
      this.mapping?.steps.push({
        filterId: filterId,
        nestedGroupId: nestedGroup.id,
        material
      })
    }
  }
})