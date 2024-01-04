<template>
  <div class="flex-1 p-6 bg-gray-100 h-auto">
    <h1 class="text-2xl font-bold mb-4">Model View</h1>

    <div class="bg-white p-4 shadow-md rounded-md">
      <div
        class="viewer-container z-100"
        style="height: 600px !important; width: 100 !important"
        ref="container"
        id="renderer"
      >
        <!-- Progress bar -->
        <!-- <div class="progress-bar">
            <v-progress-linear
              v-if="!loadingFlag"
              :model-value="loadProgress"
              :indeterminate="loadProgress >= 99 && !loadingFlag"
              color="primary"
            ></v-progress-linear>
          </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { Version } from '@/models/speckle'
import { useSpeckleStore } from '@/stores/speckle'
import { logMessageToSentry } from '@/utils/monitoring'
import { SERVER_URL, TOKEN } from '@/utils/speckleUtils'
import {
  DebugViewer,
  DefaultViewerParams,
  Viewer,
  ViewerEvent,
} from '@speckle/viewer'
import type { Ref } from 'vue'
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'SpeckleViewer',
  components: {},
  setup() {
    const speckleStore = useSpeckleStore()
    const container = ref<HTMLElement | null>(null)
    const loadProgress = ref(0)
    const loadingFlag = ref(false)

    // This will load the model into the viewer.
    const loadModel = async (
      viewer: Viewer,
      streamId: String,
      version: Version,
      loading_flag: Ref<Boolean> | undefined = undefined
    ) => {
      loading_flag && (loading_flag.value = false)

      viewer?.unloadAll()

      await viewer?.loadObject(
        SERVER_URL +
          '/streams/' +
          streamId +
          '/objects/' +
          version.referencedObject,
        TOKEN,
        true
      )

      loading_flag && (loading_flag.value = true)
    }

    // This allows us to check the loading progress of the viewer.
    const onCaptureProgress = (args: { progress: number }) => {
      loadProgress.value = args.progress * 100
    }

    // This hook will run when the component is mounted.
    onMounted(async () => {
      container.value = document.querySelector<HTMLElement>('#container')

      const streamDetails = speckleStore.getProjectDetails
      const id = streamDetails?.stream.id as String
      const commit = streamDetails?.stream.commits.items[0] as Version

      const viewer = new DebugViewer(
        container.value as HTMLElement,
        DefaultViewerParams
      )

      await viewer.init()

      try {
        // Load the model.
        loadModel(viewer, id, commit, loadingFlag)
        logMessageToSentry('Model has been loaded.', 'info')
      } catch (error) {
        logMessageToSentry(
          'Something went wrong while loading the model.',
          'error'
        )
        return
      }

      // Add Event listeners
      // viewer.on(ViewerEvent.LoadProgress, (args) => onCaptureProgress(args))
    })

    return {
      container,
      loadModel,
      loadingFlag,
      loadProgress,
    }
  },
})
</script>
