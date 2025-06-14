<!-- eslint-disable vue/multi-word-component-names -->
<template>
	<div id="nav" class="h-16 navbar-component">
		<Disclosure as="nav" class="fixed w-full z-50">
			<div class="mx-auto px-4 sm:px-6 lg:px-8">
				<div class="relative flex h-12 justify-between">
					<div
						class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start"
					>
						<div class="flex flex-shrink-0 items-center">
							<img
								class="h-10 w-auto"
								:src="logo"
								alt="Your Company"
								style="
									shape-rendering: geometricPrecision;
									filter: drop-shadow(4px 4px 0 black);
								"
							/>
						</div>
						<div class="mt-2 flex space-x-10 ml-10">
							<a
								v-for="step in steps"
								:key="step.name"
								:class="[
									'inline-flex px-4 items-center styled-element hoverable-xs font-semibold select-none cursor-pointer transition-colors duration-150 ease-in-out',
									step.name == route.name
										? 'text-white bg-black border-white shadow-white'
										: 'bg-neutral-100'
								]"
								@click="handleNavigation(step)"
							>
								{{ step.name }}
							</a>
						</div>
					</div>
					<div class="absolute inset-y-0 right-0 flex items-center">
						<!-- Profile picture and dropdown -->
						<Menu as="div" class="relative mt-2 items-center">
							<div>
								<MenuButton
									class="relative flex styled-element hoverable-sm pressable"
								>
									<span class="absolute -inset-1.5" />
									<span class="sr-only">Open user menu</span>
									<img
										class="h-10 w-10"
										:src="speckleStore.user?.avatar"
										alt=""
									/>
								</MenuButton>
							</div>
							<transition
								enter-active-class="transition ease-out duration-200"
								enter-from-class="transform opacity-0 scale-95"
								enter-to-class="transform opacity-100 scale-100"
								leave-active-class="transition ease-in duration-75"
								leave-from-class="transform opacity-100 scale-100"
								leave-to-class="transform opacity-0 scale-95"
							>
								<MenuItems
									class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
								>
									<!-- Profile -->
									<MenuItem v-slot="{ active }">
										<a
											href="#"
											:class="[
												active ? 'bg-gray-100' : '',
												'block px-4 py-2 text-sm text-gray-700'
											]"
											>Your Profile</a
										>
									</MenuItem>

									<!-- Settings -->
									<MenuItem v-slot="{ active }">
										<span
											class="hover:cursor-pointer"
											:class="[
												active ? 'bg-gray-100' : '',
												'block px-4 py-2 text-sm text-gray-700'
											]"
											@click="toggleSettingsModal"
											>Settings</span
										>
									</MenuItem>

									<!-- Sign Out -->
									<MenuItem v-slot="{ active }">
										<a
											href="#"
											:class="[
												active ? 'bg-gray-100' : '',
												'block px-4 py-2 text-sm text-gray-700'
											]"
											>Sign Out</a
										>
									</MenuItem>
								</MenuItems>
							</transition>
						</Menu>
					</div>
				</div>
			</div>
		</Disclosure>
	</div>
</template>

<script setup lang="ts">
	import {
		Disclosure,
		Menu,
		MenuButton,
		MenuItem,
		MenuItems
	} from '@headlessui/vue'
	import type { PageType, Step } from '@/models/pageModel'
	import { useSpeckleStore } from '@/stores/speckleStore'
	import { useNavigationStore } from '@/stores/navigationStore'
	import router from '@/router'

	import logo from '@/assets/icons/logo.svg'
	import { useRoute } from 'vue-router'

	const speckleStore = useSpeckleStore()
	const navigationStore = useNavigationStore()
	const route = useRoute()

	const handleNavigation = (step: Step) => {
		navigationStore.setActivePage(step.name as PageType) // Set the active page in the store
		const currentRoute = router.currentRoute.value
		if (currentRoute.path !== step.href) {
			router.push(step.href)
		}
	}

	const toggleSettingsModal = () => {
		navigationStore.toggleSettingsModal()
	}

	const modelId =
		route.params.modelId ||
		speckleStore.getProjectDetails?.project?.models?.items?.[0]?.id

	const steps: Step[] = [
		{ name: 'Projects', href: '/projects' },
		{ name: 'Overview', href: `/projects/${route.params.projectId}/overview` },
		{
			name: 'Filtering',
			href: `/projects/${route.params.projectId}/models/${modelId}/filtering`
		},
		{
			name: 'Mapping',
			href: `/projects/${route.params.projectId}/models/${modelId}/mapping`
		},
		{
			name: 'Results',
			href: `/projects/${route.params.projectId}/models/${modelId}/results`
		},
		{ name: 'Benchmark', href: '/benchmark' }
	]
</script>
