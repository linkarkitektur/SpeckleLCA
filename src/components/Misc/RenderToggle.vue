<template>
	<div class="flex gap-2">
		<ToggleSwitch
			:active="!renderMode"
			label="Toggle Render Mode"
			:activeColor="navActiveColor"
			inactiveColor="#000"
			@change="toggleRenderMode"
		>
			<template #inactive>
				<HomeIcon class="h-4 w-4" style="color: black" />
			</template>
			<template #active>
				<HomeIcon class="h-4 w-4" style="color: var(--nav-active-color)" />
			</template>
		</ToggleSwitch>

		<ToggleSwitch
			:active="showHiddenObjects"
			label="Toggle Hidden"
			:activeColor="navActiveColor"
			inactiveColor="#000"
			@change="toggleHidden"
		>
			<template #inactive>
				<EyeIcon class="h-4 w-4" style="color: black" />
			</template>
			<template #active>
				<EyeIcon class="h-4 w-4" style="color: var(--nav-active-color)" />
			</template>
		</ToggleSwitch>
	</div>
</template>

<script setup lang="ts">
	import { storeToRefs } from 'pinia'
	import ToggleSwitch from '@/components/Base/BaseToggle.vue'
	import { HomeIcon, EyeIcon } from '@heroicons/vue/20/solid'
	import { useSpeckleStore } from '@/stores/speckleStore'
	import { useNavigationStore } from '@/stores/navigationStore'

	const speckleStore = useSpeckleStore()
	const navStore = useNavigationStore()

	const { renderMode, showHiddenObjects } = storeToRefs(speckleStore)
	const navActiveColor = navStore.activeColor

	const toggleRenderMode = () => {
		speckleStore.toggleRenderMode()
	}

	const toggleHidden = () => {
		speckleStore.toggleHiddenObjects()
	}
</script>
