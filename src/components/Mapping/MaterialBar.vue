<template>
  <div 
    :key="product.metaData.appId"
    class="material-bar flex items-center justify-center flex-none"
  >
    <InputText
      id="percent"
      v-model="percent"
      placeholder=100
      width="w-[5%]"
    />
    <span class="mx-1 styled-data text-xs">%</span>
    <InputText
      id="thickness"
      v-model="thickness"
      placeholder=50
      width="w-1/12"
    />
    <span class="mx-1 styled-data text-xs">mm</span>
    <div
      class="bar-content min-h-12 flex flex-col flex-none justify-center items-center styled-element hoverable-sm styled-data m-1 w-2/3 "
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

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { PaintBrushIcon, MinusCircleIcon } from '@heroicons/vue/20/solid'
import { Sketch } from '@ckpack/vue-color'

import InputText from '@/components/Base/InputText.vue'

import type { ColorInput } from '@ctrl/tinycolor'
import type { Product } from '@/models/material'

// Props & Emits
interface Props {
  product: Product
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:thickness': [{ appId: string; thickness: number }]
  'update:percent': [{ appId: string, percent: number }]
  'update:color': [{ appId: string; color: string }]
  'delete': []
}>()

// State
const showColorPicker = ref(false)
const color = ref<ColorInput>(props.product.metaData.color)

// Computed
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

const percent = computed({
  get() {
    return Math.round(props.product.materialFraction)
  },
  set(value) {
    emit('update:percent', {
      appId: props.product.metaData.appId,
      percent: value
    })
  }
})

const barStyle = computed(() => {
  let backgroundColor: string
  
  if (typeof color.value === 'string') {
    backgroundColor = color.value
  } else if (typeof color.value === 'object' && color.value !== null) {
    if ('hex' in color.value && typeof color.value.hex === 'string') {
      backgroundColor = color.value.hex
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

// Methods
const toggleColorPicker = () => {
  showColorPicker.value = !showColorPicker.value
}

// Watchers
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
    } else if (typeof newColor === 'object' && newColor !== null && 'hex' in newColor) {
      newHexColor = newColor.hex as string
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
</script>