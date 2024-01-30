<template>
  <Suspense>
    <div
      class="absolute h-screen w-screen outline outline-1 outline-red-600"
      id="container"
    />
  </Suspense>
</template>

<script setup lang="ts">
import { DefaultViewerParams, Viewer, SpeckleLoader } from '@speckle/viewer'

import { SelectionExtension, CameraController } from '@speckle/viewer'
import { onMounted } from 'vue'

const token = '65b3d8cb7442d6e5149c33727b4cb9112ec07cc692'
const serverUrl = 'https://latest.speckle.dev'
const streamId = 'efe00dbc44'
const longObjectId = 'e0eb73a3a6a64668c5caf2a819a7700b'

onMounted(async () => {
  /** Get the HTML container */
  const container = document.getElementById('container')

  /** Configure the viewer params */
  const params = DefaultViewerParams
  params.verbose = true

  const viewer = new Viewer(container, params)

  await viewer.init()

  viewer.createExtension(CameraController)
  viewer.createExtension(SelectionExtension)

  const loader = new SpeckleLoader(
    viewer.getWorldTree(),
    serverUrl + '/streams/' + streamId + '/objects/' + longObjectId,
    '65b3d8cb7442d6e5149c33727b4cb9112ec07cc692'
  )

  viewer.loadObject(loader, true)
})
</script>
