<!-- eslint-disable vue/no-reserved-component-names -->
<template>
	<div
		v-if="navRef.loading.value"
		class="fixed inset-0 z-50 backdrop-blur-sm"
		:style="{ backgroundColor: hslToHSLA(navigationStore.activeColor, 0.2) }"
	>
		<div class="flex min-h-screen items-center justify-center">
			<!-- Loading Cubes -->
			<div class="flex gap-2">
				<div
					v-for="i in 3"
					:key="i"
					class="w-6 h-6 bg-neutral-100 styled-element hoverable-sm"
					:style="{
						animation: `pulse 1.5s ease-in-out ${(i - 1) * 0.2}s infinite`
					}"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useNavigationStore } from '@/stores/navigationStore'
	import { storeToRefs } from 'pinia'

	const navigationStore = useNavigationStore()
	const navRef = storeToRefs(navigationStore)

	function hslToHSLA(hsl, alpha) {
		return hsl.replace('hsl', 'hsla').replace(')', `, ${alpha})`)
	}
</script>

<style scoped>
	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.2;
		}
		50% {
			transform: scale(1.3);
			opacity: 1;
		}
	}
</style>
