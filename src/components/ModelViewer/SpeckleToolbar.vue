<template>
  <div v-if="show">
    <div
      class="flex w-full mx-auto fixed bottom-4 align-bottom justify-center z-50"
    >
      <span
        class="isolate inline-flex rounded-lg shadow-md shadow-gray-300 text-gray-400"
      >
        <button
          type="button"
          @click="handleAddButtonClick"
          class="inline-flex items-center rounded-l-md bg-white px-3 py-2 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 focus:z-10"
        >
          <PlusIcon class="h-6" />
        </button>

        <button
          type="button"
          @click="handleClearButtonClick"
          class="-ml-px inline-flex items-center bg-white px-3 py-2 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 focus:z-10"
        >
          <XMarkIcon class="h-6" />
        </button>
        <button
          type="button"
          @click="handleZoomExtentsButtonClick"
          class="-ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 focus:z-10"
        >
          <ArrowsPointingOutIcon class="h-6" />
        </button>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ArrowsPointingOutIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import ViewerInteraction from './viewerInteraction'

export default {
  name: 'SpeckleToolbar',
  components: {
    PlusIcon,
    XMarkIcon,
    ArrowsPointingOutIcon,
  },
  props: {
    visible: Boolean,
  },
  setup(props) {
    const show = ref(props.visible)
    const interaction = new ViewerInteraction()

    function handleAddButtonClick() {
      interaction.viewerInstance.speckleRenderer.getObjects
      console.log('Add button clicked...')
    }

    function handleClearButtonClick() {
      console.log('Clear button clicked...')
    }

    function handleZoomExtentsButtonClick() {
      console.log('Zoom Extents button clicked...')
    }

    return {
      show,
      handleAddButtonClick,
      handleClearButtonClick,
      handleZoomExtentsButtonClick,
    }
  },
}
</script>
