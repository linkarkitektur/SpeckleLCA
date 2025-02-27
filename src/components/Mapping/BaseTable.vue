<template>
  <table class="divide-y divide-gray-200 max-w-full block table-fixed">
    <thead class="w-full block">
      <tr class="w-full flex bg-gray-200 text-gray-700 text-left text-xs leading-4 font-medium uppercase tracking-wider whitespace-nowrap">
        <slot name="header-columns"></slot>
      </tr>
    </thead>
    <Draggable
      v-if="items"
      :list="items"
      :options="dragOptions"
      class="bg-gray-100 divide-y divide-gray-300 max-w-full block table-fixed hover:cursor-move"
      tag="tbody"
      item-key="id"
      :group="{ name: 'materials', pull: 'clone', put: false }"
      :clone="cloneItem"
    >
      <template #item="{ element, index }">
        <tr 
          class="text-xs whitespace-no-wrap w-full flex hover:bg-gray-200"
          :data-item="JSON.stringify(element)"
          @dragstart="onDragStart($event, element)"
          @dragend="onDragEnd($event)"
          @dblclick="onDoubleClick(element)"
        >
          <slot name="row-columns" :element="element" :index="index" :emissions="roundedEmissions[index]"></slot>
        </tr>
      </template>
    </Draggable>
  </table>
</template>

<script lang="ts">
import { defineComponent, ref, computed, type PropType } from 'vue'
import Draggable from 'vuedraggable'
import { useMaterialStore } from '@/stores/material'
import type { Product, Assembly } from '@/models/material'

export default defineComponent({
  name: 'BaseTable',
  components: {
    Draggable
  },
  props: {
    data: {
      type: Array as PropType<(Product | Assembly)[]>,
      required: true
    }
  },
  setup(props, { emit }) {
    const materialStore = useMaterialStore()
    const items = computed(() => props.data)

    const dragOptions = ref({
      animation: 200,
      group: 'materials',
      disabled: false,
      ghostClass: 'ghost',
      handle: '.handle'
    })

    const roundedEmissions = computed(() => {
      if (!items.value) return []
      
      return items.value.map((item: Product | Assembly) => {
        const value = item.emission?.gwp?.a1a3 ?? 0
        const roundedValue = parseFloat((Number(value) || 0).toFixed(2))
        
        return {
          value: roundedValue,
          isPositive: roundedValue > 0
        }
      })
    })

    const cloneItem = (item: Product | Assembly) => ({ ...item })

    const onDragStart = (event: DragEvent, item: Product | Assembly) => {
      emit('dragStart', item)
    }

    const onDragEnd = (event: DragEvent) => {
      emit('dragEnd')
    }

    const onDoubleClick = (item: Product | Assembly) => {
      emit('doubleClick', item)
    }

    return {
      items,
      dragOptions,
      roundedEmissions,
      cloneItem,
      onDragStart,
      onDragEnd,
      onDoubleClick
    }
  }
})
</script>