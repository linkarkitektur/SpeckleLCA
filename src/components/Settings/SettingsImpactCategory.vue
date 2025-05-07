<template>
	<div>
		<h2 class="styled-header">Impact category</h2>
		<p class="mt-1 styled-text">
			Set what impact category you want to calculate for.
		</p>

		<dl class="settings-list">
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Standard impactCategory</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<Dropdown
						:items="impactCategoryList"
						name="codes"
						:dropdownName="impactCategory"
						@selectedItem="handleSelectedItem"
						class="w-48"
					/>
				</dd>
			</div>
		</dl>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { useSettingsStore } from '@/stores/settingStore'
	import { extendedImpactCategoryKeys } from '@/models/materialModel'

	import type { dropdownItem } from '@/components/Base/Dropdown.vue'

	import Dropdown from '@/components/Base/Dropdown.vue'
	import { storeToRefs } from 'pinia'
	import type { ImpactCategoryKey } from 'lcax'

	const settingsStore = useSettingsStore()

	const { calculationSettings } = storeToRefs(settingsStore)
	const impactCategory = ref(
		settingsStore.calculationSettings.standardImpactCategory
	)

	const impactCategoryList: dropdownItem[] = []
	extendedImpactCategoryKeys.map((key) => {
		impactCategoryList.push({ name: key })
	})

	const updateImpactCategory = () => {
		settingsStore.updateStandardImpactCategory(impactCategory.value)
	}

	const handleSelectedItem = (selectedItem: dropdownItem) => {
		impactCategory.value = selectedItem.name as ImpactCategoryKey
		updateImpactCategory()
	}

	watch(
		() => calculationSettings.value.standardImpactCategory,
		(newValue) => {
			impactCategory.value = newValue
		}
	)
</script>
