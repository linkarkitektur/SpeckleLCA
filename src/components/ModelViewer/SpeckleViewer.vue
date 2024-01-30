<template>
  <div class="min-h-screen p-6 bg-gray-100">
    <h1 class="text-2xl font-bold mb-4">Model View</h1>
    <div class="bg-white p-4 shadow-md rounded-lg">
      <div
        class="z-10"
        style="min-height: 400px; min-width: 800px; border: 1px solid red"
        id="renderer"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { useNavigationStore } from '@/stores/main'
import { useSpeckleStore } from '@/stores/speckle'
import { TOKEN } from '@/utils/speckleUtils'
import {
  CameraController,
  SelectionExtension,
  DefaultViewerParams,
  SpeckleLoader,
  Viewer,
} from '@speckle/viewer'

import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'SpeckleViewer',
  components: {},
  setup() {
    const loadProgress = ref(0)
    const isLoading = ref(false)
    const speckleStore = useSpeckleStore()
    const navigationStore = useNavigationStore()


    // The server url is the url of the speckle server you want to connect to.
    const server_url = import.meta.env.VITE_APP_SERVER_URL;
    // To get the stream id use the selected project.
    const stream_id = speckleStore.selectedProject?.id;
    // The referenced id of the object you want to load. This one is on the selected version.
    const refferece_Id = speckleStore.selectedVersion?.referencedObject
    //TOKEN (ALL caps) is just the name of the key in local storage
    //token lowercase is the value of the key
    const token = localStorage.getItem(TOKEN)?.toString() || "";



    onMounted(async () => {
      /** Configure the viewer params */
      const params = DefaultViewerParams
      params.showStats = true
      params.verbose = true

      const container = document.getElementById('renderer')

      const viewer = new Viewer(container!, params)
      console.log(viewer)

      await viewer.init()

      viewer.createExtension(CameraController)
      viewer.createExtension(SelectionExtension)

      // Create a loader for the Speckle stream.
      const loader = new SpeckleLoader(
        viewer.getWorldTree(),
        server_url + '/streams/' + stream_id + '/objects/'  + refferece_Id,
        token
      )

      // Load the Speckle object.
      await viewer.loadObject(loader)

      console.log('end')
    })

    return {
      isLoading,
      loadProgress,
      speckleStore,
      navigationStore,
    }
  },
})
</script>
