<template>
  <div class="absolute text-sm top-20 left-4">
    <h3
      class="font-semibold leading-5 text-gray-400 border-b border-gray-300 pb-2"
    >
      Controls
    </h3>
    <p class="py-1.5 font-light leading-6 text-gray-400">
      Use the toolbar below to interact with the model.<br />
      <i>Select</i>: Left Click<br />
      <i>Orbit</i>: Left Drag<br />
      <i>Pan</i>: Right Drag<br />
      <i>Move</i>: W,A,S,D<br />
      <i>Zoom</i>: Scroll Wheel<br />
    </p>
  </div>

  <Suspense>
    <div class="absolute h-full w-full bg-gray-50 -z-10" id="container" />
  </Suspense>
</template>

<script setup lang="ts">
import { useSpeckleStore } from '@/stores/speckle'
import {
  CameraController,
  DefaultViewerParams,
  SelectionExtension,
  SpeckleLoader,
  Viewer,
} from '@speckle/viewer'
import { onMounted } from 'vue'

const serverUrl = import.meta.env.VITE_APP_SERVER_URL
const token = import.meta.env.VITE_SPECKLE_TOKEN
const streamId = 'ae6354b212'
const longObjectId = 'e0eb73a3a6a64668c5caf2a819a7700b'

onMounted(async () => {
  const speckleStore = useSpeckleStore()
  const container = document.getElementById('container')

  /** Configure the viewer params */
  const params = DefaultViewerParams
  params.verbose = true

  const viewer = new Viewer(container, params)

  await viewer.init()

  if (viewer == null) {
    throw new Error('Failed to initialize viewer!')
  } else {
    console.log('Initialized viewer successfully!')
    speckleStore.setViewerInstance(viewer)
  }

  viewer.createExtension(CameraController)
  viewer.createExtension(SelectionExtension)

  const loader = new SpeckleLoader(
    viewer.getWorldTree(),
    serverUrl + '/streams/' + streamId + '/objects/' + longObjectId,
    token
  )

  viewer.loadObject(loader, true)

  return () => ({
    viewer,
  })
})
</script>
