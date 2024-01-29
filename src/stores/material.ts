import type { EPD } from 'lcax'
import type { Assembly } from '@/models/project'
import { defineStore } from 'pinia'
import materialList from '@/tests/objects/materialList.json'

export const useMaterialStore = defineStore({
  id: 'materialStore',
  state: () => ({
    materials: [] as EPD[],
    assemblies: [] as Assembly[],
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
     * Update material list from JSON path
     * @param material 
     */
    async materialsFromJson() {
      try {
        this.materials = materialList as any;

        console.log(this.materials)
      } catch (error) {
        console.error('Error fetching JSON:', error)
      }
    },
  },
})
