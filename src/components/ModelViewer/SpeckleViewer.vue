<template>
	<!-- TODO: This is supposed to fade in and out when resizing the viewer. Not working correct currently -->
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
			<div
				class="fixed w-full h-full bg-gray-500 bg-opacity-75 transition-opacity z-30"
			/>
		</TransitionChild>
	</TransitionRoot>
	<div 
		class="relative inset-y-16 w-full h-[calc(100vh-4rem)] bg-gray-100 overflow-auto" 
		id="renderParent"
	>
		<div class="absolute text-sm select-none left-4">
			<h3
				class="font-semibold leading-5 text-gray-400 border-b border-gray-300 pb-2"
			>
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
		<!-- this should not be in here?
		<div class="flex text-md select-none top-20 right-4">
			<FilterSelector />
		</div>
		-->
		<div 
			class="flex h-full w-full bg-gray-50 -z-10" 
			id="renderer" 
		/>

		<ViewerControls />
		<DetailBar />
	</div>
</template>

<script setup lang="ts">
	import {
		DefaultViewerParams,
		Viewer,
		ViewerEvent,
		type SelectionEvent
	} from '@speckle/viewer'

	import { useSpeckleStore } from '@/stores/speckle'
	import { onMounted, watch, onBeforeUnmount, ref, render } from 'vue'
	import { useProjectStore } from '@/stores/main'
	import { storeToRefs } from 'pinia'

	import {
		TransitionChild, 
    TransitionRoot,
	} from '@headlessui/vue'
	import ViewerControls from '@/components/ModelViewer/ViewerControls.vue'
	import DetailBar from '@/components/DetailBar/DetailBar.vue'

	import type { SunLightConfiguration } from '@/models/speckle'

	let viewer: Viewer | null = null

	const projectStore = useProjectStore()
	const { selectedObjects } = storeToRefs(projectStore)

	const serverUrl = import.meta.env.VITE_APP_SERVER_URL
	const token = import.meta.env.VITE_SPECKLE_TOKEN
	const resizeObserver = ref(null)
	const fadeOut = ref(false)

	const handleEscKey = (e) => {
		if (e.key.toLowerCase() === 'escape') {
			console.log('Pressed Esc')
			projectStore.clearSelectedGroup()
			viewer.resetFilters()
		}
	}

	//This is to resize it properly when just div changes size as when expanding sidebar
	const handleResize = (entries : ResizeObserverEntry[]) => {
		for (let entry of entries) {
			//fadeOut.value = true

			const { width, height } = entry.contentRect
			viewer.resize()
			//Update aspect ratio manually
			viewer.cameraHandler.activeCam.camera.aspect = width / height
			viewer.cameraHandler.activeCam.camera.updateProjectionMatrix()

			//fadeOut.value = false
		}
	}

	/**
	/ Renable select all if needed, see no need for it now.
	const handleSelectAll = (e) => {
		if (e.ctrlKey && e.key.toLowerCase() === 'a') {
			viewer.cameraHandler.enabled = false
			console.log('Pressed Ctrl + A')
			//projectStore.setSelectedObjects(projectStore.currProject.geometry)
		}
	}
	*/

	onMounted(async () => {
		const renderParent = document.getElementById('renderParent') as HTMLElement
		const container = document.getElementById('renderer') as HTMLElement
		window.addEventListener('keydown', handleEscKey)
		//window.addEventListener('keydown', handleSelectAll)

		viewer = new Viewer(container, DefaultViewerParams)
		await viewer.init()

		if (viewer == null) {
			throw new Error('Failed to initialize viewer!')
		} else {
			console.log('Initialized viewer successfully!')
		}

		let lightConfig: SunLightConfiguration = {
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

		// function updateFilterType(payload) {
		// 	switch (payload) {
		// 		case 'All':
		// 			viewer.applyFilter({
		// 				type: [],
		// 				props: { type: SpeckleType.Mesh }
		// 			} as any)
		// 			break
		// 		case 'Space':
		// 			break
		// 		case 'Envelope':
		// 			break
		// 	}
		// }

		let selection: string[] = []
		viewer.on(ViewerEvent.ObjectClicked, (selectionInfo: SelectionEvent) => {
			if (selectionInfo) {
				// Object was clicked. Highlight it.
				const id = selectionInfo.hits[0].object.id

				if (selectionInfo.event.shiftKey) selection.push(id)
				else selection = [id]

				projectStore.setObjectsByURI(selection)

				viewer.highlightObjects(projectStore.getSelectedObjectsURI(), true)
				// Zoom in on the hit and focus the camera target.
				//viewer.zoom()
			} else {
				// No object clicked. Restore selection from group.
				projectStore.setObjectsFromGroup()

				if (projectStore.selectedObjects.length === 0) viewer.resetHighlight()
				else viewer.highlightObjects(projectStore.getSelectedObjectsURI(), true)

				viewer.zoom()
			}
		})

		/**
		 * Keep the selection and highlights until change is made elsewhere.
		 * 
		// Clear the `selectedObjects` and `view` on a mouse out event.
		window.onmouseout = function () {
			projectStore.clearSelectedObjects()
			viewer.resetHighlight()
		}
 		*/

		resizeObserver.value = new ResizeObserver(handleResize)
    resizeObserver.value.observe(renderParent)

		// Resize the viewer when the window is resized.
		/*
		window.onresize = function () {
			viewer.resize()
		}
		*/

		const speckleStore = useSpeckleStore()
		speckleStore.setViewerInstance(viewer)

		const url = `${serverUrl}/streams/${speckleStore.selectedProject.id}/objects/${speckleStore.selectedVersion.referencedObject}`

		/** Load the speckle data */
		await viewer.loadObject(url, token, true, true)
	})

	onBeforeUnmount(() => {
  	window.removeEventListener('keydown', handleEscKey)
		resizeObserver.value.disconnect()
	})

	watch(
		() => selectedObjects.value,
		() => {
			viewer?.resetFilters()
			viewer?.isolateObjects(projectStore.getSelectedObjectsURI())
			//viewer?.highlightObjects(projectStore.getSelectedObjectsURI(), true)
		}
	)

	// function setObjectColorsByVolume() {}
</script>
