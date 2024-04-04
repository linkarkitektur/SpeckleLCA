import type { EPD, SubType } from 'lcax'
import type { Assembly, SortingOption, FilterParam } from '@/models/project'
import { defineStore } from 'pinia'
import materialList from '@/tests/objects/materialList.json'

export const useMaterialStore = defineStore({
  id: 'materialStore',
  state: () => ({
    materials: [] as EPD[],
    assemblies: [] as Assembly[],
    currentMapping: null as EPD | Assembly | null,
    sorting: { parameter: 'name', direction: 'asc' } as SortingOption,
    EPDMode: true,
    EPDList: [] as EPD[],
    assemblyList: [] as Assembly[],
    //Filters this could be dynamic?
    paramFilters: {
      matParam: [] as FilterParam[],
      subParam: [] as FilterParam[],
      unitParam: [] as FilterParam[],
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
  }),
  actions: {
    /**
     * Add material to store
     * @param material 
     */
    addMaterial(material: EPD) {
      this.materials.push(material)
    },

    /**
     * Remove material from store
     * @param material 
     */
    removeMaterial(material: EPD) {
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
      this.assemblies.push(assembly)
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
    setCurrentMapping(mapping: EPD | Assembly) {
      this.currentMapping = mapping
    },

    /**
     * set filtered EPD list
     */
    setFilteredMaterials(materials: EPD[]) {
      this.EPDList = materials
    },

    /**
     * Update EPD list from JSON path 
     */
    async materialsFromJson() {
      try {
        this.materials = materialList.map((material: any) => ({
          ...material,
          "meta_data": {
            "materialType": material["materialType"]
          }
        })) as any

        this.EPDList = this.materials
        this.updateParameters()
      } catch (error) {
        console.error('Error fetching JSON:', error)
      }
    },

    /**
     * Update filterable parameters from material list
     */
    updateParameters() {
      const uniqueMaterialTypes = Array.from(
        new Set(this.materials.map((mat) => mat.meta_data?.materialType))
      ).filter(Boolean)
      const uniqueSubtypes = Array.from(
        new Set(this.materials.map((mat) => mat.subType as SubType))
      ).filter(Boolean)
      const uniqueDeclaredUnits = Array.from(
        new Set(this.materials.map((mat) => mat.declared_unit))
      ).filter(Boolean)

      this.paramFilters.matParam = uniqueMaterialTypes.map((name) => ({ name, selected: false }))
      this.paramFilters.subParam = uniqueSubtypes.map((name) => ({ name, selected: false }))
      this.paramFilters.unitParam = uniqueDeclaredUnits.map((name) => ({ name, selected: false }))
    },

    /**
     * Set sorting option and sort the list
     */
    setSorting(parameter: string, direction: string) {
      const sorting = { parameter, direction }
      this.sorting = sorting
      this.sortList()
    },

    /**
     * Filter EPD list based on selected parameters
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
            // Include all EPDs that have the selected filter
            const EPDkeys = this.sortingParameters.map(param => param.filterName)

            const tempList = this.EPDList.filter(
              (epd) => {
                return EPDkeys.some((EPDkey) => {
                  return this.paramFilters[key]
                    .filter((param) => param.selected)
                    .map((param) => param.name)
                    .includes(epd[EPDkey])
                })
              }
            )
            this.EPDList = tempList
          }
        }
      } else {
        // Go through each assembly and check if the selected filter is in the assembly
        this.assemblyList = this.assemblyList.filter(
          (assembly) => {
            return this.paramFilters.matParam
              .filter((param) => param.selected)
              .map((param) => param.name)
              .includes(assembly.materials[0].EPD.meta_data?.materialType)
          }
        )
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
  }
})