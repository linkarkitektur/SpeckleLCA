<template>
	<div class="h-full flex flex-col">
		<SearchBar
			:data="combinedMaterials"
			:filterParam="filterParameters"
			:sortingParam="sortingParameters"
			@update:data="handleFilteredData"
		/>
		<MaterialTable :data="filteredMaterial" />
	</div>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue'
	import { storeToRefs } from 'pinia'
	import { useMaterialStore } from '@/stores/materialStore'
	import { useSettingsStore } from '@/stores/settingStore'
	import MaterialTable from '@/components/Mapping/MaterialTable.vue'
	import SearchBar from '@/components/Mapping/SearchBar.vue'
	import type { Product, Assembly } from '@/models/materialModel'

	const materialStore = useMaterialStore()
	const settingsStore = useSettingsStore()

	const { materials, assemblies } = storeToRefs(materialStore)
	const filteredMaterial = ref<(Product | Assembly)[]>([])

	const filterParameters = settingsStore.materialSettings.filterParams
	const sortingParameters = settingsStore.materialSettings.sortingParams

	const combinedMaterials = computed(() => {
		return [...materials.value, ...assemblies.value]
	})

	const handleFilteredData = (newData: (Product | Assembly)[]) => {
		filteredMaterial.value = newData
	}
</script>
