<template>
	<div
		id="DetailBar"
		class="absolute flex bottom-0 z-10 left-1/2 -translate-x-1/2 w-5/6 h-24 mb-8 rounded-2xl bg-gray-500 bg-opacity-10 border border-gray-400 border-opacity-50"
	>
		<div class="flex w-full items-center justify-center">
			<component :is="currDetailbar" />
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, computed } from 'vue'
	import { useNavigationStore } from '@/stores/main'

	import OverviewBar from '@/components/DetailBar/OverviewBar.vue'
	import MaterialBar from '@/components/DetailBar/MaterialBar.vue'

	export default defineComponent({
		name: 'DetailBar',
		components: {},
		setup() {
			const navStore = useNavigationStore()
			// Total value to be shown for each group
			const currDetailbar = computed(() => {
				if (navStore.activePage === 'Overview') return OverviewBar
				else if (navStore.activePage === 'Mapping') return MaterialBar
				else if (navStore.activePage === 'Results') return null
				else if (navStore.activePage === 'Benchmark') return null
				else return null
			})
			return {
				currDetailbar
			}
		}
	})
</script>
