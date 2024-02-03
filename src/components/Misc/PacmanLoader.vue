<!-- eslint-disable vue/no-reserved-component-names -->
<template>
	<TransitionRoot as="template" :show="navRef.loading.value">
		<Dialog as="div" class="relative z-10">
			<TransitionChild
				as="template"
				enter="ease-out duration-300"
				enter-from="opacity-0"
				enter-to="opacity-100"
				leave="ease-in duration-200"
				leave-from="opacity-100"
				leave-to="opacity-0"
			>
				<div
					class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
				/>
			</TransitionChild>
			<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
				<div
					class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
				>
					<TransitionChild
						as="template"
						enter="ease-out duration-300"
						enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						enter-to="opacity-100 translate-y-0 sm:scale-100"
						leave="ease-in duration-200"
						leave-from="opacity-100 translate-y-0 sm:scale-100"
						leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
					>
						<div class="flex v-spinner text-center" v-show="navRef.loading">
							<div class="relative inline-block" :style="{ fontSize: '0' }">
								<div class="v-pacman v-pacman1" :style="spinnerStyle1"></div>
								<div
									v-for="(delay, index) in delays"
									:key="index"
									:class="`v-pacman v-pacman${index + 2}`"
									:style="[spinnerStyle, animationStyle, delay]"
								></div>
							</div>
						</div>
					</TransitionChild>
					<p class="flex text-slate-100 text-3xl text-left mt-36 font-medium">
						Loading...
					</p>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
</template>

<script lang="ts">
	import { computed, defineComponent } from 'vue'
	import { Dialog, TransitionChild, TransitionRoot } from '@headlessui/vue'
	import type { CSSProperties } from 'vue'
	import { useNavigationStore } from '@/stores/main'
	import { storeToRefs } from 'pinia'

	export default defineComponent({
		name: 'PacmanLoader',
		components: {
			// eslint-disable-next-line vue/no-reserved-component-names
			Dialog,
			TransitionRoot,
			TransitionChild
		},
		props: {
			color: {
				type: String,
				default: '#22B864'
			},
			size: {
				type: String,
				default: '50px'
			},
			dotSize: {
				type: String,
				default: '25px'
			},
			margin: {
				type: String,
				default: '2px'
			},
			radius: {
				type: String,
				default: '100%'
			}
		},
		setup(props) {
			const navigationStore = useNavigationStore()
			const navRef = storeToRefs(navigationStore)

			const delays = [0.25, 0.5, 0.75, 1].map((delay) => ({
				animationDelay: `${delay}s`
			}))

			const spinnerStyle = computed(() => ({
				backgroundColor: props.color,
				width: props.size,
				height: props.size,
				margin: props.margin,
				borderRadius: props.radius
			}))

			const spinnerStyle1 = computed(() => ({
				width: 0,
				height: 0,
				borderTop: `${props.size} solid ${props.color}`,
				borderRight: `${props.size} solid transparent`,
				borderBottom: `${props.size} solid ${props.color}`,
				borderLeft: `${props.size} solid ${props.color}`,
				borderRadius: props.size
			}))

			const animationStyle: CSSProperties = {
				width: props.dotSize,
				height: props.dotSize,
				transform: `translate(0, -${parseFloat(props.dotSize) / 4}px)`,
				position: 'absolute',
				top: '40px',
				left: '200px',
				animationName: 'v-pacmanStretchDelay',
				animationDuration: '1s',
				animationIterationCount: 'infinite',
				animationTimingFunction: 'linear',
				animationFillMode: 'both'
			}

			return {
				navRef,
				delays,
				spinnerStyle,
				spinnerStyle1,
				animationStyle
			}
		}
	})
</script>

<style>
	@-webkit-keyframes v-pacmanStretchDelay {
		75% {
			-webkit-opacity: 0.7;
			opacity: 0.7;
		}
		100% {
			-webkit-transform: translate(-200px, -6.25px);
			transform: translate(-200px, -6.25px);
		}
	}

	@keyframes v-pacmanStretchDelay {
		75% {
			-webkit-opacity: 0.7;
			opacity: 0.7;
		}
		100% {
			-webkit-transform: translate(-200px, -6.25px);
			transform: translate(-200px, -6.25px);
		}
	}
</style>
