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

  <div 
    class="relative inset-y-16 w-full h-[calc(100vh-4rem)] bg-gray-100 overflow-auto" 
    id="renderParent"
  >
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

    <!-- TODO Catch the emit event and update the viewer filter. -->
    <!-- This should not be in here? -->
    <!-- <div class="flex text-md select-none top-20 right-4">
      <FilterSelector />
    </div> -->

    <div class="flex h-full w-full bg-gray-50 -z-10" id="renderer" />

    <div
    	class="absolute h-1/3 mx-auto top-4 right-4 align-right justify-center z-20"
  	>
			<component :is="leftModule" v-bind="graphProps" />
		</div>
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
    ref,
    computed 
  } from 'vue'
  import { 
    TransitionChild, 
    TransitionRoot 
  } from '@headlessui/vue'

  // Store imports
  import { useSpeckleStore } from '@/stores/speckle'
  import { useProjectStore, useNavigationStore } from '@/stores/main'
  import { storeToRefs } from 'pinia'

  // Component imports
  import ViewerControls from '@/components/ModelViewer/ViewerControls.vue'
  import DetailBar from '@/components/DetailBar/DetailBar.vue'
  import RenderToggle from '@/components/Misc/RenderToggle.vue'
  import SelectablePieChart from '@/components/Graphs/SelectablePieChart.vue'

  // Type imports
  import type { SunLightConfiguration } from '@/models/speckle'

  // Utility imports
  import { geometryToMaterialChartData } from '@/utils/projectUtils'

  // Variables and references
  let viewer: Viewer | null = null
  const projectStore = useProjectStore()
  const { selectedObjects } = storeToRefs(projectStore)
  const navStore = useNavigationStore()
  const speckleStore = useSpeckleStore()
  const serverUrl = import.meta.env.VITE_APP_SERVER_URL
  const token = import.meta.env.VITE_SPECKLE_TOKEN
  const resizeObserver = ref<ResizeObserver | null>(null)
  const fadeOut = ref(false)

  speckleStore.setServerUrl(serverUrl)
  speckleStore.setToken(token)

  // Computed property for dynamic component
  const leftModule = computed(() => {
    switch (navStore.activePage) {
      case 'Overview':
      case 'Mapping':
        return ViewerControls
      case 'Results':
        return SelectablePieChart
      case 'Benchmark':
      default:
        return null
    }
  })

  const graphProps = ref({})
  // Pass props to the current detail bar component
  const updateGraphProps = () => {
    if (leftModule.value === SelectablePieChart) {
      graphProps.value = {
        data: geometryToMaterialChartData(projectStore.selectedObjects),
      }
    }
    else {
      graphProps.value = {}
    }
  }

  watch(() => projectStore.selectedObjects, () => {
    updateGraphProps()
  })

  updateGraphProps()

  // Event handler for Escape key
  const handleEscKey = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'escape') {
      projectStore.clearSelectedGroup()
    }
  }

  // Resize handler for the viewer
  const handleResize = (entries: ResizeObserverEntry[]) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      viewer?.resize()
      if (viewer?.cameraHandler.activeCam.camera) {
        viewer.cameraHandler.activeCam.camera.aspect = width / height
        viewer.cameraHandler.activeCam.camera.updateProjectionMatrix()
      }
    }
  }

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
      speckleStore.isolateObjects(projectStore.getSelectedObjectsURI())
    }
  )
  // function setObjectColorsByVolume() {}
</script>