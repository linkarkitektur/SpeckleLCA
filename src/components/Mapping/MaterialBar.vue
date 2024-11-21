<template>
  <div 
    :key="product.metaData.appId"
    class="material-bar flex items-center justify-center flex-none"
  >
    <input
      type="number"
      v-model.number="thickness"
      class="w-1/12 h-min border-none p-0 text-center focus:outline-none focus:ring-0 focus:ring-offset-0"
    />
    <span class="mr-2 text-xs">mm</span>
    <div
      class="bar-content flex flex-col flex-none justify-center items-center text-white m-1 w-2/3 "
      :style="barStyle"
    >
      <span>{{ product.name }}</span>
      <span>{{ product.metaData.materialType }}</span>
    </div>
    <div class="bar-paint flex flex-col justify-center items-center relative hover:cursor-pointer">
      <button @click="toggleColorPicker">
        <PaintBrushIcon class="h-5 w-5 text-gray-400 hover:text-gray-700" />
      </button>
      <!-- Color Picker -->
      <div
        v-if="showColorPicker"
        class="absolute z-[9999] mt-2"
        v-click-outside="toggleColorPicker"
      >
        <Sketch
          v-model="color"
        />
      </div>
      <button @click="$emit('delete')">
        <MinusCircleIcon class="h-5 w-5 text-red-500 hover:text-red-700"/>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, Ref } from 'vue'
import { PaintBrushIcon, MinusCircleIcon } from '@heroicons/vue/20/solid'
import { Sketch } from '@ckpack/vue-color'
import type { ColorInput } from '@ctrl/tinycolor'

import type { Product } from '@/models/material'

export default defineComponent({
  name: 'MaterialBar',
  components: {
    PaintBrushIcon,
    MinusCircleIcon,
    Sketch
  },
  props: {
    product: {
      type: Object as () => Product,
      required: true,
    },
  },
  emits: ['update:thickness', 'update:color', 'delete'],
  setup(props, { emit }) {
    const showColorPicker = ref(false)
    const color: Ref<ColorInput> = ref(props.product.metaData.color)

    const thickness = computed({
      get() {
        return parseInt(props.product.metaData.thickness)
      },
      set(value) {
        emit('update:thickness', {
          appId: props.product.metaData.appId,
          thickness: value,
        })
      },
    })

    const barStyle = computed(() => {
      let backgroundColor: string
      
      if (typeof color.value === 'string') {
        backgroundColor = color.value
      } else if (typeof color.value === 'object' && color.value !== null) {
        if ('hex' in color.value && typeof color.value === 'string') {
          backgroundColor = color.value
        } else {
          backgroundColor = props.product.metaData.color
        }
      } else {
        backgroundColor = props.product.metaData.color
      }

      return {
        height: `${props.product.metaData.height}px`,
        backgroundColor,
      }
    })

    const toggleColorPicker = () => {
      showColorPicker.value = !showColorPicker.value
    }

    watch(
      () => props.product.metaData.color,
      (newColor) => {
        color.value = newColor
      },
      { immediate: true }
    )

    watch(
      () => color.value,
      (newColor: ColorInput) => {
        let newHexColor: string

        if (typeof newColor === 'string') {
          newHexColor = newColor
        } else if (typeof newColor === 'object' && newColor !== null) {
          if ('hex' in newColor && typeof newColor === 'string') {
            newHexColor = newColor
          } else {
            newHexColor = props.product.metaData.color
          }
        } else {
          newHexColor = props.product.metaData.color 
        }

        emit('update:color', {
          appId: props.product.metaData.appId,
          color: newHexColor,
        })
      },
      { deep: true }
    )

    return { 
      barStyle, 
      thickness,
      color,
      showColorPicker,
      toggleColorPicker, 
    }
  },
})
</script>