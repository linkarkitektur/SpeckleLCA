<!-- eslint-disable vue/multi-word-component-names -->
<template>
	<!-- Click outside on no element we close the slideover -->
	<div
		v-show="navStore.slideoverOpen"
		class="fixed inset-0 z-0"
		@click="toggleSlideover"
	></div>
	<Transition
		name="slide"
		enter-active-class="transform transition-all ease-out duration-500"
		leave-active-class="transform transition-all ease-in duration-500"
		enter-from-class="translate-x-full"
		enter-to-class="translate-x-0"
		leave-from-class="translate-x-0"
		leave-to-class="translate-x-full"
	>
		<div
			v-if="navStore.slideoverOpen"
			class="fixed inset-y-0 right-0 z-50"
			:class="slideoverConfig.width"
			@click.stop
		>
			<div class="flex flex-col h-[calc(100vh-5rem)] mt-20">
				<div
					class="flex flex-col h-full styled-element"
					:style="{ backgroundColor: navStore.activeColor }"
				>
					<!-- Header -->
					<div class="px-3 py-3 styled-element flex-none">
						<div class="flex items-start justify-between">
							<h2 class="font-semibold text-gray-900">
								{{ navStore.slideoverFunction }}
							</h2>
							<div class="ml-3 flex h-7 items-center">
								<button
									type="button"
									class="relative bg-neutral-100 styled-element hoverable-xs"
									@click="toggleSlideover"
								>
									<span class="absolute -inset-2.5" />
									<span class="sr-only">Close panel</span>
									<XMarkIcon class="h-6 w-6" aria-hidden="true" />
								</button>
							</div>
						</div>
					</div>

					<!-- Content -->
					<div
						class="relative flex-1 px-4 pt-4 bg-neutral-100 overflow-auto scrollbar-hide"
					>
						<component :is="slideoverConfig.component" />
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import { XMarkIcon } from '@heroicons/vue/24/outline'
	import { useNavigationStore } from '@/stores/navigationStore'

	import ModifyFilter from '@/components/SlideOver/ModifyFilter.vue'
	import SaveMapping from '@/components/SlideOver/SaveMapping.vue'
	import SaveResults from '@/components/SlideOver/SaveResults.vue'
	import MaterialSlideover from '@/components/SlideOver/MaterialSlideover.vue'
	import AssemblySlideover from '@/components/SlideOver/AssemblySlideover.vue'
	import SaveFilters from '@/components/SlideOver/SaveFilters.vue'
	import ExportResults from '@/components/SlideOver/ExportResults.vue'
	import EditGroup from '@/components/SlideOver/AddGroup.vue'

	const navStore = useNavigationStore()

	interface SlideoverConfig {
		component: any
		width: string
	}

	const slideoverConfig = computed((): SlideoverConfig => {
		switch (navStore.slideoverFunction) {
			case 'Edit Filters':
				return {
					component: ModifyFilter,
					width: 'w-1/3'
				}
			case 'Save Filter':
				return {
					component: SaveFilters,
					width: 'w-1/4'
				}
			case 'Add Group':
				return {
					component: EditGroup,
					width: 'w-1/3'
				}
			case 'Show Materials':
				return {
					component: MaterialSlideover,
					width: 'w-1/2'
				}
			case 'Edit Mapping':
				return {
					component: SaveMapping,
					width: 'w-1/3'
				}
			case 'Edit Assemblies':
				return {
					component: AssemblySlideover,
					width: 'w-full'
				}
			case 'Save Mapping':
				return {
					component: SaveMapping,
					width: 'w-1/4'
				}
			case 'Export Results':
				return {
					component: ExportResults,
					width: 'w-1/4'
				}
			case 'Save Results':
				return {
					component: SaveResults,
					width: 'w-1/4'
				}
			default:
				return {
					component: null,
					width: 'w-1/3'
				}
		}
	})

	const toggleSlideover = () => {
		navStore.toggleSlideover()
	}
</script>

<style scoped>
	.pointer-events-auto {
		pointer-events: auto;
	}
</style>
