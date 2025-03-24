<template>
	<footer class="bg-white">
		<div class="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
			<nav
				class="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
				aria-label="Footer"
			>
				<!--
				<div v-for="item in navigation.main" :key="item.name" class="pb-6">
					<a
						:href="item.href"
						class="text-sm leading-6 text-gray-600 hover:text-gray-900"
						>{{ item.name }}</a
					>
				</div>
				-->
			</nav>
			<div class="mt-10 flex justify-center space-x-10">
				<!--<a
					v-for="item in navigation.social"
					:key="item.name"
					:href="item.href"
					class="text-gray-400 hover:text-gray-500"
				>
					<span class="sr-only">{{ item.name }}</span>
					<component :is="item.icon" class="h-6 w-6" aria-hidden="true" />
				</a>
				-->
				<a 
					class="text-gray-400 hover:text-gray-500"
					@click=toggleSettings>
					Settings
				</a>
			</div>
			<p class="mt-10 text-center text-xs leading-5 text-gray-500">
				&copy; 2025 LINK Arkitekter, A/S. All rights reserved.
			</p>
		</div>
	</footer>
</template>

<script lang="ts">
	import { defineComponent } from 'vue'
	import {
		CodeBracketIcon,
		LinkIcon,
		VideoCameraIcon
	} from '@heroicons/vue/20/solid'

	import { useNavigationStore } from '@/stores/navigationStore'

	export default defineComponent({
		name: 'FooterComponent',
		components: {},
		setup() {
			const navigationStore = useNavigationStore()

			const toggleSettings = () =>
				navigationStore.toggleSettingsModal()

			const navigation = {
				main: [
					{ name: 'About', href: '#' },
					{ name: 'Blog', href: '#' },
					{ name: 'Jobs', href: '#' },
					{ name: 'Contact', href: '#' }
				],
				social: [
					{
						name: 'LinkedIn',
						href: '#',
						icon: LinkIcon
					},
					{
						name: 'GitHub',
						href: '#',
						icon: CodeBracketIcon
					},
					{
						name: 'Settings',
						href: '#',
						icon: VideoCameraIcon
					}
				]
			}

			return { 
				navigation,
				toggleSettings
			}
		}
	})
</script>
