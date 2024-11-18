import { type Mapping, type MaterialFilterParam, type MaterialSortingOption, type Assembly, type Product, Source } from '@/models/material'
import { defineStore } from 'pinia'
import materialList from '@/tests/objects/materialList.json'
import type { NestedGroup } from "@/models/filters"

import { applyParamFilters } from '@/utils/material'

export const useMaterialStore = defineStore({
  id: 'materialStore',
  state: () => ({
    materials: [] as Product[],
    assemblies: [] as Assembly[],
    currentMapping: null as Product | Assembly | null,
    currentAssemby: null as Assembly | null,
    sorting: { parameter: 'name', direction: 'asc' } as MaterialSortingOption,
    EPDMode: true,
    EPDList: [] as Product[],
    assemblyList: [] as Assembly[],
    //Filters this could be dynamic?
    paramFilters: {
      matParam: [] as MaterialFilterParam[],
      subParam: [] as MaterialFilterParam[],
      unitParam: [] as MaterialFilterParam[],
    },
    sortingParameters: [
      { "filterName": 'name',
        "displayName": "Name",
        "paramName": null 
      },
      { "filterName": 'subType',
        "displayName": "EPD Type",
        "paramName": "subParam"
      },
      { "filterName": 'materialType',
        "displayName": "Material Type",
        "paramName": "matParam"
      },
      { "filterName": 'declared_unit',
        "displayName": "Declared Unit",
        "paramName": "unitParam"
      }
    ],
    mapping: null as Mapping | null,
  }),
  actions: {
    /**
     * Add material to store
     * @param material 
     */
    addMaterial(material: Product) {
      this.materials.push(material)
      this.updateParameters()
    },
    
    /**
     * Add material list to store
     * @param materials
    */
    addMaterialList(materials: Product[]) {
      this.materials = materials
      this.updateParameters()
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
          source: Source.LCAbyg
        })) as any

        this.EPDList = this.materials
        this.updateParameters()
      } catch (error) {
        console.error('Error fetching JSON:', error)
      }
    },

    /**
     * Update filterable parameters from material list
     * DEPRICATED
     */
    updateParameters() {
      const uniqueMaterialTypes = Array.from(
        new Set(this.materials.map((mat) => mat.metaData?.materialType))
      ).filter(Boolean) as string[]
      const uniqueDeclaredUnits = Array.from(
        new Set(this.materials.map((mat) => mat.unit))
      ).filter(Boolean) as string[]

      this.paramFilters.matParam = uniqueMaterialTypes.map((name) => ({ 
        name: name, 
        selected: false,
        filterParamter: 'metaData.materialType'
      }))
      this.paramFilters.unitParam = uniqueDeclaredUnits.map((name) => ({ 
        name: name, 
        selected: false,
        filterParamter: 'unit'
      }))
    },

    /**
     * Set sorting option and sort the list
     * DEPRICATED
     */
    setSorting(parameter: string, direction: string) {
      const sorting = { parameter, direction }
      this.sorting = sorting
      this.sortList()
    },

    /**
     * Filter EPD list based on selected parameters
     * DEPRICATED
     */
    triggerParamSort() {
      if(this.EPDMode === true) {
        // Reset EPDList to all EPDs
        this.EPDList = this.materials
        this.sortList()
        // Go through each paramFilters and check if any are selected
        for (const key in this.paramFilters) {
          // If none of the filters are selected then take all EPDs
          if (!this.paramFilters[key].some((param) => param.selected)) {
            continue
          } else {
            // Update the filtered list
            this.EPDList = applyParamFilters(this.EPDList, this.paramFilters[key])
          }
        }
      } else {
        // Filter assembly list
        this.assemblyList = this.assemblyList.filter((assembly) => {
          // Check if at least one product in the assembly matches the filter
          return Object.values(assembly.products).some((product) => {
            for (const key in this.paramFilters) {
              // If none of the filters are selected, skip this filter
              if (!this.paramFilters[key].some((param) => param.selected)) {
                continue
              }
              // Apply filters to each product in the assembly
              const filteredProducts = applyParamFilters([product], this.paramFilters[key])
              // If any product matches the filters, include the assembly
              if (filteredProducts.length > 0) {
                return true
              }
            }
            return false
          })
        })
      }
    },

    /**
     * Reset sorting to default
     */
    resetSorting() {
      this.sorting = { parameter: 'name', direction: 'asc' }
    },

    /**
     * Sort filteredList by set sorting Option
     */
    sortList() {
      const { parameter, direction } = this.sorting
      this.EPDList.sort((a, b) => {
        if (a[parameter] < b[parameter]) {
          return direction === 'asc' ? -1 : 1
        }
        if (a[parameter] > b[parameter]) {
          return direction === 'asc' ? 1 : -1
        }
        return 0
      })
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