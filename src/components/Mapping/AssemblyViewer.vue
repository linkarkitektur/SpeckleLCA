<template>
  <div div ref="assemblyViewerRef" class="assembly-viewer flex flex-col w-full h-full justify-center items-center">
    <!-- Top Drop Zone -->
    <Draggable
      :list="[]"
      group="materials"
      class="add-bar w-11/12 flex items-center justify-center h-10 border-2 border-dashed border-gray-400 pr-60 pl-60 mb-2"
      @change="onDropAtStart"
      :options="{ dropzoneMode: 'single' }"
      tag="div"
    >
      <template #header>
        <PlusCircleIcon
          class="-mr-1 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </template>
      <template #item>
        <!-- Empty template since the drop zone does not display items -->
      </template>
    </Draggable>

    <!-- Draggable material bars -->
    <Draggable
			v-if="materials"
			:list="materials"
			:group="materials"
			item-key="metaData.appId"
			ghost-class="ghost"
			:animation="200"
      tag="div"
      class="flex flex-col justify-center w-full"
		>
      <template #item="{element, index}">
        <MaterialBar
          :key="element.metaData.appId"
          class="hover:cursor-move" 
          :product="element" 
          @update:thickness="updateMaterialThickness"
          @update:color="updateMaterialColor"
          @delete="deleteMaterial(index)"
        />
      </template>
    </Draggable>

    <!-- Bottom Drop Zone -->
    <Draggable
      :list="[]"
      group="materials"
      class="add-bar w-11/12 relative flex items-center justify-center h-10 border-2 border-dashed border-gray-400 mt-2"
      @change="onDropAtEnd"
      :options="{ dropzoneMode: 'single' }"
      tag="div"
    >
      <template #header>
        <PlusCircleIcon
        class="-mr-1 h-5 w-5 text-gray-400 "
        aria-hidden="true"
      />
      </template>
      <template #item>
        <!-- Empty template since the drop zone does not display items -->
      </template>
    </Draggable>
    <button @click="saveAssembly" class="save-button">
      Save Assembly
    </button>
  </div>
</template>

<script lang="ts">
import Draggable from 'vuedraggable'
import { defineComponent, ref } from 'vue'
import { PlusCircleIcon } from '@heroicons/vue/20/solid'

import MaterialBar from '@/components/Mapping/MaterialBar.vue'

import type { Product, Assembly } from '@/models/material'
import type { GeometryObject } from '@/models/geometryObject'

import { EmissionAggregator } from '@/utils/resultUtils'
import { EmissionCalculator } from '@/utils/emissionUtils'
import { createGeometryFromProduct } from '@/utils/material'

export default defineComponent({
  components: { 
    Draggable,
    MaterialBar,
    PlusCircleIcon
   },
  setup() {
    const materials = ref<Product[]>([])
    const assemblyViewerRef = ref<HTMLElement | null>(null)
    const nextId = ref(100)

    const normalizeHeight = () => {
      if (assemblyViewerRef.value) {
        const containerHeight = assemblyViewerRef.value.clientHeight
        const halfContainerHeight = containerHeight / 2

        const totalHeight = materials.value.reduce((sum, material) => sum + parseInt(material.metaData.thickness), 0)

        if (totalHeight > halfContainerHeight) {
          const scale = halfContainerHeight / totalHeight

          materials.value.forEach((material) => {
            material.metaData.height = Math.round(parseInt(material.metaData.thickness) * scale).toString()
          })
        } else {
          materials.value.forEach((material) => {
            material.metaData.height = material.metaData.thickness
          })
        }
      }
    }

    const onDropAtStart = (event: any) => {
      const newItem = { ...event.added.element }

      newItem.metaData.appId = nextId.value++
      newItem.metaData.thickness = 50
      newItem.metaData.height = newItem.metaData.thickness
      newItem.metaData.color = newItem.metaData.color || '#718096'

      materials.value.unshift(newItem)

      normalizeHeight() 
    }

    const onDropAtEnd = (event: any) => {
      const newItem = { ...event.added.element }

      newItem.metaData.appId = nextId.value++
      newItem.metaData.thickness = 50
      newItem.metaData.height = newItem.metaData.thickness
      newItem.metaData.color = '#718096'

      materials.value.push(newItem)

      normalizeHeight() 
    }

    const updateMaterialThickness = ({ appId, thickness }: { appId: string; thickness: number}) => {
      const material = materials.value.find((m) => m.metaData.appId === appId)
      if (material) {
        material.metaData.thickness = thickness.toString()
        normalizeHeight() 
      }
    }

    const updateMaterialColor = ({ appId, color }: { appId: string; color: string }) => {
      const material = materials.value.find((m) => m.metaData.appId === appId)
      if (material) {
        material.metaData.color = color
      }
    }

    const deleteMaterial = (index: number) => {
      materials.value.splice(index, 1)
      normalizeHeight() 
    }

    const saveAssembly = () => {
      const products: Record<string, Product> = materials.value.reduce((acc, product) => {
        acc[product.id] = product
        return acc
      }, {} as Record<string, Product>)
      const tempGeos: GeometryObject[] = []

      materials.value.forEach(product => {
        tempGeos.push(createGeometryFromProduct(product))
      })

      const calculator = new EmissionCalculator(tempGeos)
      calculator.calculateEmissions()

      const aggregator = new EmissionAggregator(tempGeos)
      aggregator.aggregate(false)
      
      const name = "Set this from the UI"
      const description = "Set this from the UI"
      const category = "Set this from the UI" // This should be BSAB avgränsning
      const materialType = "Set this from the UI"

      const assembly: Assembly = {
        id: crypto.randomUUID(),
        name:name,
        description: description,
        products: products,
        emission: aggregator.totalEmission,
        comment: '',
        quantity: 1,
        unit: 'm2',
        category: category,
        classification: null,
        results: [],
        metaData: { materialType: materialType },
      }

      console.log('Saving assembly:', assembly)
    }

    return { 
      materials, 
      assemblyViewerRef,
      onDropAtStart, 
      onDropAtEnd,
      updateMaterialThickness,
      updateMaterialColor,
      deleteMaterial,
      saveAssembly,
    }
  },
})


</script>