<template>
  <div
    class="absolute h-1/3 mx-auto top-4 right-4 align-right justify-center z-20"
  >
    <span
      class="isolate inline-flex flex-col rounded-lg shadow-md shadow-gray-300 text-gray-400"
    >
      <button
        type="button"
        @click="handleProjectionButtonClick"
        class="inline-flex items-center rounded-l-md bg-white px-3 py-2 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 focus:z-10"
      >
        <VideoCameraIcon class="h-6" />
      </button>

      <button
        type="button"
        @click="handleSelectAllButton"
        class="-ml-px inline-flex items-center bg-white px-3 py-2 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 focus:z-10"
      >
        <ViewfinderCircleIcon class="h-6" />
      </button>
      <button
        type="button"
        @click="handleZoomExtentsButtonClick"
        class="-ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 focus:z-10"
      >
        <ArrowsPointingOutIcon class="h-6" />
      </button>
      <button
        type="button"
        @click="handleToggleSectionBoxButtonClick"
        class="-ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 focus:z-10"
      >
        <CubeTransparentIcon class="h-6" />
      </button>
      <button
        type="button"
        @click="handleLockOrbitButtonClick"
        class="-ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 focus:z-10"
      >
        <LockClosedIcon class="h-6" />
      </button>
    </span>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowsPointingOutIcon,
  VideoCameraIcon,
  ViewfinderCircleIcon,
  CubeTransparentIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline'
import { useSpeckleStore } from '@/stores/speckle';
import { storeToRefs } from 'pinia';

const speckleStore = useSpeckleStore()
const { viewer } = storeToRefs(speckleStore)

let rotationLocked = false

/**
 * Handles the click event of the projection button,
 * toggles between a perspective and orthographic camera.
 */
function handleProjectionButtonClick() {
  if (!viewer) return

  viewer.value.toggleCameraProjection()
}

/**
 * Handles the click event of the select all button,
 * selects all objects in the current scene.
 */
function handleSelectAllButton() {
  let ids = []

  const dataTree = viewer.value.getDataTree()

  dataTree.walk((guid, obj): boolean => {
    obj.selected = true
    ids.push(guid)
    return true
  })

  ids.splice(0, 1)
  // console.log(ids)

  viewer.value.selectObjects(ids)
  viewer.value?.zoom()
}

/**
 * Handles the click event of the Zoom Extents button,
 * sends a request to the Speckle server to zoom extents.
 */
function handleZoomExtentsButtonClick() {
  viewer.value?.zoom()
}

/**
 * Handles the click event of the section box button,
 * toggles a section box in the current scene.
 */
function handleToggleSectionBoxButtonClick() {
  viewer.value?.toggleSectionBox()
}

/**
 * Handles the click event of the lock orbit button.
 * Locks/Unlocks camera orbit.
 */
function handleLockOrbitButtonClick() {
  rotationLocked = !rotationLocked

  if (rotationLocked) viewer.value?.cameraHandler.disableRotations()
  else viewer.value?.cameraHandler.enableRotations()
}
</script>