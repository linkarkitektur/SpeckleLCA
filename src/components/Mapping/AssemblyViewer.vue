<template>
  <div ref="assemblyViewerRef" class="assembly-viewer flex flex-col w-full h-full justify-center items-center">
    <!-- Top Drop Zone -->
    
    <Draggable
      :list="[]"
      group="materials"
      class="add-bar relative w-11/12 flex items-center justify-center h-10 pr-60 pl-60 mb-2 border-2 border-dashed"
      :class="isDragging ? 'border-green-600' : 'border-gray-400'"
      @change="onDropAtStart"
      :options="{ dropzoneMode: 'single' }"
      tag="div"
    >
      <template #header>
        <div v-if="isDragging" class=" h-9 absolute inset-0 animate-pulse bg-green-100 opacity-20"></div>
        <PlusCircleIcon class="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
      </template>
      <template #item>
        <!-- Empty template -->
      </template>
    </Draggable>

    <!-- Draggable Material Bars -->
    <Draggable
      v-if="localMaterials"
      v-model="localMaterials"
      group="placedMaterials"
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
      class="add-bar relative w-11/12 flex items-center justify-center h-10 mt-2 border-2 border-dashed"
      :class="isDragging ? 'border-green-600' : 'border-gray-400'"
      @change="onDropAtEnd"
      :options="{ dropzoneMode: 'single' }"
      tag="div"
    >
      <template #header>
        <PlusCircleIcon class="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        <div v-if="isDragging" class="h-9 absolute inset-0 animate-pulse bg-green-100 opacity-20"></div>
      </template>
      <template #item>
        <!-- Empty template -->
      </template>
    </Draggable>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue'
import Draggable from 'vuedraggable'
import { PlusCircleIcon } from '@heroicons/vue/20/solid'
import MaterialBar from '@/components/Mapping/MaterialBar.vue'
import { useMaterialStore } from '@/stores/material'
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
    const localMaterials = ref<Product[]>([...props.materials])
    const materialStore = useMaterialStore()
    const isDragging = computed(() => materialStore.currentMapping ? true : false)

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
            material.metaData.height = Math.round(
              parseInt(material.metaData.thickness) * scale
            ).toString()
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
      materialStore.setCurrentMapping(null)
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
      materialStore.setCurrentMapping(null)
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

    watch(() => props.materials, (newMaterials) => {
      localMaterials.value = [...newMaterials]
    })

    return {
      assemblyViewerRef,
      localMaterials,
      isDragging,
      onDropAtStart,
      onDropAtEnd,
      updateMaterialThickness,
      updateMaterialColor,
      deleteMaterial,
    }
  },
})
</script>
