<template>
	<div class="absolute text-md select-none top-20 left-4">
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

	<div class="absolute text-md select-none top-20 right-4">
		<FilterSelector /> //TODO Catch the emit event and update the viewer filter.
	</div>

	<div class="absolute h-full w-full bg-gray-50 -z-10" id="renderer" />

	<div
		class="flex w-full mx-auto fixed bottom-4 align-bottom justify-center z-50"
	>
		<span
			class="isolate inline-flex rounded-lg shadow-md shadow-gray-300 text-gray-400"
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
	import {
		DefaultViewerParams,
		Viewer,
		ViewerEvent,
		type SelectionEvent
	} from '@speckle/viewer'
	import { useSpeckleStore } from '@/stores/speckle'
	import { onMounted } from 'vue'
	import FilterSelector from './FilterSelector.vue'

	const props = defineProps<{
		streamId: String
		longObjectId: String
	}>()

	let viewer: Viewer | null = null
	let rotationLocked = false

	onMounted(async () => {
		const serverUrl = import.meta.env.VITE_APP_SERVER_URL
		const token = import.meta.env.VITE_SPECKLE_TOKEN

		interface LightConfiguration {
			enabled?: boolean
			castShadow?: boolean
			intensity?: number
			color?: number
			indirectLightIntensity?: number
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interface SunLightConfiguration extends LightConfiguration {
			elevation?: number
			azimuth?: number
			radius?: number
		}

		const container = document.getElementById('renderer') as HTMLElement

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
		viewer.sectionBoxOn()

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

		let selectedObjects = []
		viewer.on(ViewerEvent.ObjectClicked, (selectionInfo: SelectionEvent) => {
			if (selectionInfo) {
				// Object was clicked. Highlight it.
				const id = selectionInfo.hits[0].object.id

				if (selectionInfo.event.shiftKey) selectedObjects.push(id)
				else selectedObjects = [id]

				viewer.highlightObjects(selectedObjects, true)
				console.log(selectedObjects)

				// Zoom in on the hit and focus the camera target.
				viewer.zoom()
			} else {
				// No object clicked. Restore focus to entire scene.
				selectedObjects = []
				viewer.resetHighlight()
				viewer.zoom()
			}
		})

		// Clear the `selectedObjects` and `view` on an esc key press.
		window.onkeydown = function (e) {
			if (e.key.toLowerCase() == 'escape') {
				selectedObjects = []
				viewer.resetHighlight()
			}
		}

		// Clear the `selectedObjects` and `view` on a mouse out event.
		window.onmouseout = function () {
			selectedObjects = []
			viewer.resetHighlight()
		}

		// Resize the viewer when the window is resized.
		window.onresize = function () {
			viewer.resize()
		}

		// Select all in scene, do not pan.
		window.onkeydown = function (e) {
			if (e.ctrlKey && e.key.toLowerCase() == 'a') {
				viewer.cameraHandler.enabled = false
				console.log('Pressed Ctrl + A')
			}
		}

		const speckleStore = useSpeckleStore()
		speckleStore.setViewerInstance(viewer)

		const url = `${serverUrl}/streams/${props.streamId}/objects/${props.longObjectId}`

		/** Load the speckle data */
		await viewer.loadObject(url, token, true, true)
	})

	// function setObjectColorsByVolume() {}

	/**
	 * Handles the click event of the projection button,
	 * toggles between a perspective and orthographic camera.
	 */
	function handleProjectionButtonClick() {
		if (!viewer) return

		viewer.toggleCameraProjection()
	}

	/**
	 * Handles the click event of the select all button,
	 * selects all objects in the current scene.
	 */
	function handleSelectAllButton() {
		let ids = []

		const dataTree = viewer.getDataTree()

		dataTree.walk((guid): boolean => {
			ids.push(guid)
			return true
		})

		ids.splice(0, 1)
		console.log(ids)

		viewer?.zoom()
	}

	/**
	 * Handles the click event of the Zoom Extents button,
	 * sends a request to the Speckle server to zoom extents.
	 */
	function handleZoomExtentsButtonClick() {
		viewer?.zoom()
	}

	/**
	 * Handles the click event of the section box button,
	 * toggles a section box in the current scene.
	 */
	function handleToggleSectionBoxButtonClick() {
		viewer?.toggleSectionBox()
	}

	/**
	 * Handles the click event of the lock orbit button.
	 * Locks/Unlocks camera orbit.
	 */
	function handleLockOrbitButtonClick() {
		rotationLocked = !rotationLocked

		if (rotationLocked) viewer?.cameraHandler.disableRotations()
		else viewer?.cameraHandler.enableRotations()
	}
</script>
