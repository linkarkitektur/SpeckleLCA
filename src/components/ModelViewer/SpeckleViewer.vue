<template>
	<!-- Neobrutalist loading overlay -->
	<div
		v-if="isLoading"
		class="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
	>
		<div
			class="p-4 border-4 styled-element hoverable-styling animate-pulse"
			:style="{ backgroundColor: navStore.activeColor }"
		>
			<HomeIcon class="w-16 h-16 text-black" />
		</div>
	</div>

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

	<div class="absolute styled-data text-md select-none top-16 left-1/3 z-40">
		<RenderToggle />
	</div>

	<div class="flex h-full w-full bg-transparent -z-10" id="renderer" />

	<!-- Only show in dashboard view -->
	<div
		class="absolute inset-y-0 right-0 w-1/4 top-4 pr-4"
		v-if="navStore.activePage !== 'Benchmark'"
	>
		<div class="h-1/2 w-full">
			<GraphContainer />
		</div>
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
		ViewerEvent
	} from '@speckle/viewer'
	import type { SelectionEvent } from '@speckle/viewer'
	import { onMounted, watch, onBeforeUnmount, ref } from 'vue'
	import { TransitionChild, TransitionRoot } from '@headlessui/vue'
	import { debounce } from 'lodash'
	import { HomeIcon } from '@heroicons/vue/20/solid'

	// Store imports
	import { useSpeckleStore } from '@/stores/speckleStore'
	import { useSettingsStore } from '@/stores/settingStore'
	import { useProjectStore } from '@/stores/projectStore'
	import { useNavigationStore } from '@/stores/navigationStore'
	import { storeToRefs } from 'pinia'

	// Component imports
	import RenderToggle from '@/components/Misc/RenderToggle.vue'
	import GraphContainer from '@/components/Graphs/GraphContainer.vue'

	// Variables and references
	let viewer: Viewer | null = null
	const projectStore = useProjectStore()

	const { selectedObjects } = storeToRefs(projectStore)

	const speckleStore = useSpeckleStore()
	const settingsStore = useSettingsStore()
	const navStore = useNavigationStore()
	const serverUrl = settingsStore.keySettings.speckleConfig.serverUrl
	const resizeObserver = ref<ResizeObserver | null>(null)
	const fadeOut = ref(false)
	const isLoading = ref(true)

	speckleStore.setServerUrl(serverUrl)

	// Event handler for Escape key
	const handleEscKey = (e: KeyboardEvent) => {
		if (e.key.toLowerCase() === 'escape') {
			projectStore.clearSelectedGroup()
		}
	}

	// Resize handler for the viewer with debounce
	const handleResize = (() => {
		let timeout: number | null = null
		return () => {
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
		// await loadProject(false)
		const renderParent = document.getElementById('renderParent') as HTMLElement
		const container = document.getElementById('renderer') as HTMLElement
		window.addEventListener('keydown', handleEscKey)

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

		const urls = await UrlHelper.getResourceUrls(
			`${serverUrl}/streams/${speckleStore.selectedProject.id}/objects/${speckleStore.selectedVersion.referencedObject}`
		)
		for (const url of urls) {
			const loader = new SpeckleLoader(
				viewer.getWorldTree(),
				url,
				speckleStore.token
			)
			await viewer.loadObject(loader, true)
		}

		viewer.on(ViewerEvent.ObjectClicked, (selection: SelectionEvent) => {
			if (!selection || !selection.hits.length) {
				projectStore.setObjectsFromGroup()
				return
			}
			const selectRaw = selectExt.getSelectedObjects()
			const objIds = selectRaw.map((obj) => {
				return obj.id as string
			})

			projectStore.setObjectsByURI(objIds)
		})

		// Remove the loading indicator once all objects are loaded
		isLoading.value = false
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
