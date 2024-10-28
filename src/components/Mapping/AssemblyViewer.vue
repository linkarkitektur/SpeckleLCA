<template>
  <div ref="assemblyViewerRef" class="assembly-viewer flex flex-col w-full h-full justify-center items-center">
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

    <!-- Draggable Material Bars -->
    <Draggable
      v-if="localMaterials"
      v-model="localMaterials"
      group="materials"
      item-key="metaData.appId"
      ghost-class="ghost"
      :animation="200"
      tag="div"
      class="flex flex-col justify-center w-full"
    >
      <template #item="{ element, index }">
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
          class="-mr-1 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </template>
      <template #item>
        <!-- Empty template since the drop zone does not display items -->
      </template>
    </Draggable>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import Draggable from 'vuedraggable'
import { PlusCircleIcon } from '@heroicons/vue/20/solid'

import MaterialBar from '@/components/Mapping/MaterialBar.vue'

import type { Product } from '@/models/material'

export default defineComponent({
  components: {
    Draggable,
    MaterialBar,
    PlusCircleIcon,
  },
  props: {
    materials: {
      type: Array as () => Product[],
      required: true,
    },
  },
  emits: ['update:materials'],
  setup(props, { emit }) {
    const assemblyViewerRef = ref<HTMLElement | null>(null)
    const nextId = ref(100)

    // Create a local copy of materials to work with
    const localMaterials = ref<Product[]>([...props.materials])

    const normalizeHeight = () => {
      if (assemblyViewerRef.value) {
        const containerHeight = assemblyViewerRef.value.clientHeight
        const halfContainerHeight = containerHeight / 2

        const totalHeight = localMaterials.value.reduce(
          (sum, material) => sum + parseInt(material.metaData.thickness),
          0
        )

        if (totalHeight > halfContainerHeight) {
          const scale = halfContainerHeight / totalHeight

          localMaterials.value.forEach((material) => {
            material.metaData.height = Math.round(parseInt(material.metaData.thickness) * scale).toString()
          })
        } else {
          localMaterials.value.forEach((material) => {
            material.metaData.height = material.metaData.thickness
          })
        }
      }
    }

    const onDropAtStart = (event: any) => {
      const newItem = JSON.parse(JSON.stringify(event.added.element))

      newItem.metaData.appId = nextId.value++
      newItem.metaData.thickness = '50'
      newItem.metaData.height = newItem.metaData.thickness
      newItem.metaData.color = newItem.metaData.color || '#718096'

      localMaterials.value.unshift(newItem)

      normalizeHeight()
      emit('update:materials', localMaterials.value)
    }

    const onDropAtEnd = (event: any) => {
      const newItem = JSON.parse(JSON.stringify(event.added.element))

      newItem.metaData.appId = nextId.value++
      newItem.metaData.thickness = '50'
      newItem.metaData.height = newItem.metaData.thickness
      newItem.metaData.color = '#718096'

      localMaterials.value.push(newItem)

      normalizeHeight()
      emit('update:materials', localMaterials.value)
    }

    const updateMaterialThickness = ({ appId, thickness }: { appId: string; thickness: number }) => {
      const material = localMaterials.value.find((m) => m.metaData.appId === appId)
      if (material) {
        material.metaData.thickness = thickness.toString()
        normalizeHeight()
        emit('update:materials', localMaterials.value)
      }
    }

    const updateMaterialColor = ({ appId, color }: { appId: string; color: string }) => {
      const material = localMaterials.value.find((m) => m.metaData.appId === appId)
      if (material) {
        material.metaData.color = color
        emit('update:materials', localMaterials.value)
      }
    }

    const deleteMaterial = (index: number) => {
      localMaterials.value.splice(index, 1)
      normalizeHeight()
      emit('update:materials', localMaterials.value)
    }

    // Watch for changes in props.materials to update localMaterials
    watch(
      () => props.materials,
      (newMaterials) => {
        localMaterials.value = [...newMaterials]
      },
      { deep: true }
    )

    return {
      assemblyViewerRef,
      localMaterials,
      onDropAtStart,
      onDropAtEnd,
      updateMaterialThickness,
      updateMaterialColor,
      deleteMaterial,
    }
  },
})
</script>
