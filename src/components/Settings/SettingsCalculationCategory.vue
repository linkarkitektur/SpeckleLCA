<template>
	<div>
		<h2 class="styled-header">Saved calculation settings</h2>
		<p class="mt-1 styled-text">
			Saved settings for a certain certification, changes settings below.
		</p>

		<dl class="settings-list">
			<div class="pt-6 sm:flex">
				<dt class="mr-6">Saved settings/certification</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<Dropdown
						:items="savedSettings"
						name="calculationSettings"
						:dropdownName="currentSetting.name"
						@selectedItem="handleSelectedItem"
					/>
					<p>Name</p>
					<InputText
						id="saveName"
						v-model="currentSetting.name"
						placeholder="saved settings"
					/>
					<ActionButton text="Save" @onClick="saveSettings" />
				</dd>
			</div>
		</dl>
	</div>

	<!-- B4 Calculation Setting -->
	<div>
		<h2 class="styled-header">Denmark adaptations</h2>
		<p class="mt-1 styled-text">
			Calculate B4 replacements using A1-A3, A4, and A5 emissions, for Denmark.
		</p>

		<dl class="settings-list">
			<div class="pt-6 sm:flex">
				<dt class="mr-6">Replace B4</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<CheckBox
						id="replaceB4Setting"
						name="replaceB4Setting"
						:checked="
							settingsStore.calculationSettings.replaceB4WithProductionStages
						"
						@update:checked="
							(newVal) =>
								(settingsStore.calculationSettings.replaceB4WithProductionStages =
									newVal)
						"
					/>
				</dd>
			</div>
		</dl>
	</div>
</template>

<script setup lang="ts">
	import { reactive, computed, ref } from 'vue'
	import { storeToRefs } from 'pinia'

	import { useSettingsStore } from '@/stores/settingStore'
	import { useProjectStore } from '@/stores/projectStore'
	import { useFirebaseStore } from '@/stores/firebaseStore'
	import { standardCalculationSettings } from '@/models/settingModel'

	import type { CalculationSettings } from '@/models/settingModel'
	import type { CalculationSettingsLog } from '@/models/firebaseModel'
	import type { dropdownItem } from '@/components/Base/Dropdown.vue'

	import Dropdown from '@/components/Base/Dropdown.vue'
	import ActionButton from '@/components/Base/ActionButton.vue'
	import InputText from '@/components/Base/InputText.vue'
	import CheckBox from '../Base/CheckBox.vue'

	const settingsStore = useSettingsStore()
	const projectStore = useProjectStore()
	const firebaseStore = useFirebaseStore()

	// Use storeToRefs to maintain reactivity
	const { calculationSettings } = storeToRefs(settingsStore)

	// Make these refs from the reactive store
	const impactCategory = computed(
		() => calculationSettings.value.standardImpactCategory
	)
	const includedStages = computed(
		() => calculationSettings.value.includedStages
	)
	const buildingCode = computed(() => calculationSettings.value.buildingCode)
	const replaceB4Setting = ref(
		calculationSettings.value.replaceB4WithProductionStages
	)

	const savedSettings: dropdownItem[] = []
	let projectId = projectStore.currProject?.id || 'generic'

	const currentSetting = reactive<CalculationSettingsLog>({
		name: 'Pick your settings',
		projectId: projectId,
		date: new Date(),
		settings: {
			standardImpactCategory: impactCategory.value,
			includedStages: includedStages.value,
			buildingCode: buildingCode.value,
			replaceB4WithProductionStages: replaceB4Setting.value
		}
	})

	const handleSelectedItem = async (selectedItem: dropdownItem) => {
		const data = JSON.parse(selectedItem.data) as CalculationSettings

		currentSetting.name = selectedItem.name

		// Merge with standard settings to ensure no undefined values
		const mergedSettings = {
			...standardCalculationSettings,
			...data
		}

		// Update store in sequence
		await settingsStore.updateStandardImpactCategory(
			mergedSettings.standardImpactCategory
		)
		await settingsStore.updateIncludedStages(mergedSettings.includedStages)
		await settingsStore.updateBuildingCode(mergedSettings.buildingCode)
		await settingsStore.updateReplaceB4Setting(
			mergedSettings.replaceB4WithProductionStages
		)

		// Update current settings with merged data
		currentSetting.settings = {
			standardImpactCategory: mergedSettings.standardImpactCategory,
			includedStages: mergedSettings.includedStages,
			buildingCode: mergedSettings.buildingCode,
			replaceB4WithProductionStages:
				mergedSettings.replaceB4WithProductionStages
		}
	}

	const fetchDropdownItems = async () => {
		const settings: CalculationSettingsLog[] = await firebaseStore
			.fetchCalculationSettings(currentSetting.projectId)
			.finally()

		if (settings) {
			settings.map((setting) => {
				savedSettings.push({
					name: setting.name,
					data: JSON.stringify(setting.settings)
				})
			})
		}
	}

	fetchDropdownItems()

	const saveSettings = () => {
		const settings: CalculationSettings = {
			standardImpactCategory: impactCategory.value,
			includedStages: includedStages.value,
			buildingCode: buildingCode.value,
			replaceB4WithProductionStages: replaceB4Setting.value
		}

		currentSetting.settings = settings
		firebaseStore.addCalculationSettings(
			currentSetting.projectId,
			settings,
			currentSetting.name
		)
	}
</script>
