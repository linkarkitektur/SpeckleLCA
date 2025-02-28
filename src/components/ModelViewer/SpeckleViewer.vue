<template>
  <!-- Background with dots pattern -->
  <div 
    class="fixed inset-0 w-full h-full pattern-dots pattern-black pattern-bg-transparent pattern-size-4 -z-20"
    :style="{
      backgroundColor: navStore.activeColor,
      '--pattern-opacity': '0.5'
    }"
  ></div>
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
    <div class="absolute font-mono text-md select-none left-1/3">
      <RenderToggle />
      <!--
      <h3 class="font-semibold leading-5 text-black border-b border-gray-300 pb-2">
        Controls
      </h3>
      <p class="py-1.5 font-light leading-6 text-black">
        Use the toolbar below to interact with the model.<br />
        <i>Clear Selection</i>: Esc<br />
        <i>Select</i>: Left Click<br />
        <i>Orbit</i>: Left Drag<br />
        <i>Pan</i>: Right Drag<br />
        <i>Move</i>: W,A,S,D<br />
        <i>Zoom</i>: Scroll Wheel<br />
      </p>
      -->
    </div>

    <div class="flex h-full w-full bg-transparent -z-10" id="renderer" />
    <!-- Only show in dashboard view -->
    <div
    	class="absolute h-full mx-auto top-4 right-4 align-right justify-center z-20 overflow-visible"
      v-if="navStore.activePage !== 'Benchmark'"
  	>
      <GraphContainer />
		</div>
</template>

<script setup lang="ts">
// External imports
import { 
  Viewer,
  DefaultViewerParams,
  SpeckleLoader,
  UrlHelper,
  SelectionExtension,
  CameraController,
  FilteringExtension,
  ViewerEvent,
} from '@speckle/viewer'
import type { SelectionEvent } from '@speckle/viewer'
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
import RenderToggle from '@/components/Misc/RenderToggle.vue'
import GraphContainer from '@/components/Graphs/GraphContainer.vue'
import { TransparentBackgroundExtension } from '@/extensions/TransparentBackgroundExtension'

// Variables and references
let viewer: Viewer | null = null
const projectStore = useProjectStore()

const { selectedObjects } = storeToRefs(projectStore)

const speckleStore = useSpeckleStore()
const settingsStore = useSettingsStore()
const navStore = useNavigationStore()
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
    //viewer.getExtension(FilteringExtension).resetFilters()
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
      viewer?.resize()
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

  viewer.createExtension(CameraController)
  const selectExt = viewer.createExtension(SelectionExtension)
  viewer.createExtension(FilteringExtension)

  resizeObserver.value = new ResizeObserver(handleResize)
  resizeObserver.value.observe(renderParent)

  speckleStore.setViewerInstance(viewer)
  
  if (!speckleStore.selectedProject || !speckleStore.selectedVersion) {
    throw new Error('No project or version selected!')
  }

  const urls = await UrlHelper.getResourceUrls(`${serverUrl}/streams/${speckleStore.selectedProject.id}/objects/${speckleStore.selectedVersion.referencedObject}`)
  for (const url of urls) {
    const loader = new SpeckleLoader(viewer.getWorldTree(), url, "")
    await viewer.loadObject(loader, true)
  }

  viewer.on(ViewerEvent.ObjectClicked, (selection: SelectionEvent) => {
    if (!selection || !selection.hits.length) {
      projectStore.setObjectsFromGroup()
      return
    }
    const selectRaw = selectExt.getSelectedObjects()
    const objIds = selectRaw.map(obj => {
      return obj.id as string
    })

    projectStore.setObjectsByURI(objIds)
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
</script>