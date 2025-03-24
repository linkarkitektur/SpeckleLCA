<template>
	<div
		class="flex min-h-full flex-1 flex-col justify-center py-60 sm:px-6 lg:px-8"
	>
		<v-container
			fill-height
			class="home flex-column justify-center align-center primary--text"
			v-if="!isAuthenticated"
		>
			<div
				class="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8"
			>
				<div class="sm:mx-auto sm:w-full sm:max-w-md">
					<img
						class="mx-auto h-10 w-auto"
						src="https://tailwindui.com/img/logos/mark.svg?color=green&shade=600"
						alt="SpecklLCA"
					/>
					<h2
						class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-700"
					>
						Welcome to SpecklLCA {{ store.user?.name }}
					</h2>
				</div>

				<div
					class="flex-column justify-center align-center mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]"
				>
					<div class="bg-white px-6 py-12 shadow-md sm:rounded-xl sm:px-12">
						<button
							type="button"
							@click="login"
							class="rounded-full bg-green-600 px-4 py-2 text-lg font-semibold text-white shadow-sm hover:bg-green-500"
						>
							Please Login
						</button>
					</div>

					<p class="mt-10 text-center text-md text-gray-500">
						Not a member?
						{{ ' ' }}
						<a
							href="#"
							class="font-medium leading-6 text-green-600 hover:text-green-500"
							>Sign up here.</a
						>
					</p>
				</div>
			</div>
		</v-container>
	</div>
</template>

<script lang="ts">
	import { defineComponent, computed } from 'vue'
	import { useSpeckleStore } from '@/stores/speckleStore'

	export default defineComponent({
		name: 'LoginComponent',
		setup() {
			const store = useSpeckleStore()

			const isAuthenticated = computed(() => store.isAuthenticated)
			const login = () => {
				store.login()
			}

			return {
				isAuthenticated,
				login,
				store
			}
		}
	})
</script>
