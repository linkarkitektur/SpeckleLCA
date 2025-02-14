<template>
  <!-- TODO: This is supposed to fade in and out when resizing the viewer. Not working correctly currently -->
  <TransitionRoot as="template" :show="fadeOut">
    <TransitionChild
      as="template"
      enter="ease-in-out duration-500"
      enter-from="opacity-0"
      enter-to="opacity-100"
      leave="ease-in-out duration-500"
      leave-from="opacity-100"
      leave-to="opacity-0"
    >
      <div class="fixed w-full h-full bg-gray-500 bg-opacity-75 transition-opacity z-30" />
    </TransitionChild>
  </TransitionRoot>
    <div class="absolute text-sm select-none left-4">
      <RenderToggle />
      <h3 class="font-semibold leading-5 text-gray-400 border-b border-gray-300 pb-2">
        Controls
      </h3>
      <p class="py-1.5 font-light leading-6 text-gray-400">
        Use the toolbar below to interact with the model.<br />
        <i>Clear Selection</i>: Esc<br />
        <i>Select</i>: Left Click<br />
        <i>Orbit</i>: Left Drag<br />
        <i>Pan</i>: Right Drag<br />
        <i>Move</i>: W,A,S,D<br />
        <i>Zoom</i>: Scroll Wheel<br />
      </p>
    </div>

    <div class="flex h-full w-full bg-gray-50 -z-10" id="renderer" />
    <!-- TODO This should be full height and positioned correctly from the graph itself just placed in the right corner -->
    <!-- Only show in dashboard view -->
    <div
    	class="absolute h-1/3 mx-auto top-4 right-4 align-right justify-center z-20 overflow-visible"
      v-if="navigationStore.activePage !== 'Benchmark'"
  	>
      <GraphContainer />
		</div>
    <div v-if="Detailbar" id="Detailbar">
      <DetailBar />
    </div>
</template>

<script setup lang="ts">
// External imports
import { 
  DefaultViewerParams,
  Viewer,
  ViewerEvent,
  type SelectionEvent 
} from '@speckle/viewer'
import { 
  onMounted, 
  watch, 
  onBeforeUnmount, 
  ref 
} from 'vue'
import { 
  TransitionChild, 
  TransitionRoot 
} from '@headlessui/vue'
import { debounce } from 'lodash'

// Store imports
import { useSpeckleStore } from '@/stores/speckle'
import { useSettingsStore } from '@/stores/settings'
import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'
import { storeToRefs } from 'pinia'

// Component imports
import DetailBar from '@/components/DetailBar/DetailBar.vue'
import RenderToggle from '@/components/Misc/RenderToggle.vue'
import GraphContainer from '@/components/Graphs/GraphContainer.vue'

// Type imports
import type { SunLightConfiguration } from '@/models/speckle'

// Props
const props = withDefaults(defineProps<{
  Detailbar?: boolean
}>(), {
  Detailbar: true,
})


// Variables and references
let viewer: Viewer | null = null
const projectStore = useProjectStore()

const { selectedObjects } = storeToRefs(projectStore)

const speckleStore = useSpeckleStore()
const settingsStore = useSettingsStore()
const navigationStore = useNavigationStore()
const serverUrl = settingsStore.keySettings.speckleConfig.serverUrl
const token = ""
const resizeObserver = ref<ResizeObserver | null>(null)
const fadeOut = ref(false)

speckleStore.setServerUrl(serverUrl)
speckleStore.setToken(token)


// Event handler for Escape key
const handleEscKey = (e: KeyboardEvent) => {
  if (e.key.toLowerCase() === 'escape') {
    projectStore.clearSelectedGroup()
  }
}

// Resize handler for the viewer with debounce
const handleResize = (() => {
  let timeout: number | null = null
  return (entries: ResizeObserverEntry[]) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = window.setTimeout(() => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        viewer?.resize()
        if (viewer?.cameraHandler.activeCam.camera) {
          viewer.cameraHandler.activeCam.camera.aspect = width / height
          viewer.cameraHandler.activeCam.camera.updateProjectionMatrix()
        }
      }
    }, 100)
  }
})()

const debouncedIsolateObjects = debounce((selectedUris: string[]) => {
  speckleStore.isolateObjects(selectedUris)
}, 100)

// Initialize and mount the viewer
onMounted(async () => {
  const renderParent = document.getElementById('renderParent') as HTMLElement
  const container = document.getElementById('renderer') as HTMLElement
  window.addEventListener('keydown', handleEscKey)
  // window.addEventListener('keydown', handleSelectAll)

  viewer = new Viewer(container, DefaultViewerParams)
  await viewer.init()

  if (!viewer) {
    throw new Error('Failed to initialize viewer!')
  } else {
    console.log('Initialized viewer successfully!')
  }

  const lightConfig: SunLightConfiguration = {
    enabled: true,
    intensity: 10,
    castShadow: false,
    color: 0xffffff,
    indirectLightIntensity: 50,
    elevation: 1,
    azimuth: 0.5,
    radius: 50
  }

  viewer.setLightConfiguration(lightConfig)
  // viewer.sectionBoxOn()

  resizeObserver.value = new ResizeObserver(handleResize)
  resizeObserver.value.observe(renderParent)

  speckleStore.setViewerInstance(viewer)
  
  if (!speckleStore.selectedProject || !speckleStore.selectedVersion) {
    throw new Error('No project or version selected!')
  }
  const url = `${serverUrl}/streams/${speckleStore.selectedProject.id}/objects/${speckleStore.selectedVersion.referencedObject}`
  await viewer.loadObject(url, token, true, true)

  let selection: string[] = []
  viewer.on(ViewerEvent.ObjectClicked, (selectionInfo: SelectionEvent) => {
    if (selectionInfo) {
      // Object was clicked. Check if its in hidden objects then highlight it
      let id
      const hiddenIds = new Set(speckleStore.hiddenObjects.map(obj => obj.id))
      for(let hit of selectionInfo.hits) {
        if (!hiddenIds.has(hit.object.id)) {
          id = hit.object.id
          break
        }
      }

      if (selectionInfo.event.shiftKey) selection.push(id)
      else selection = [id]

      projectStore.setObjectsByURI(selection)
    } else {
      // No object clicked. Restore selection from group.
      projectStore.setObjectsFromGroup()

      if (projectStore.selectedObjects.length === 0) viewer.resetHighlight()
      else viewer.highlightObjects(projectStore.getSelectedObjectsURI(), true)
    }
  })

  /**
   * Keep the selection and highlights until change is made elsewhere.
   * 
   * // Clear the `selectedObjects` and `view` on a mouse out event.
   * window.onmouseout = function () {
   *   projectStore.clearSelectedObjects()
   *   viewer.resetHighlight()
   * }
   */
})

// Clean up on component unmount
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscKey)
  resizeObserver.value?.disconnect()
})

// Watch for changes in selected objects
watch(
  () => selectedObjects.value,
  () => {
    const selectedUris = projectStore.getSelectedObjectsURI()
    debouncedIsolateObjects(selectedUris)
  }
)
// function setObjectColorsByVolume() {}
</script>