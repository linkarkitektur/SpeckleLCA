<template>
	<h2 class="text-xl font-bold mb-2">Project Settings</h2>
	<Dropdown
		:items="versionNames"
		@selectedItem="handleSelectedItem"
		name="Model"
		dropdownName="Select version"
		class="py-3 w-full"
	/>

	<ActionButton
		text="Load Project"
		@onClick="selectProject"
		class="mb-6 w-full"
	/>
	<div class="flex items-center my-3">
		<dt class="styled-header w-32">Area</dt>
		<dd class="ml-4 flex-1">
			<InputText
				id="Area"
				v-model="settingsStore.projectSettings.area"
				placeholder="100"
				type="number"
			/>
		</dd>
	</div>
	<div class="flex items-center my-3">
		<dt class="styled-header w-32">Budget</dt>
		<dd class="ml-4 flex-1">
			<InputText
				id="Threshold"
				v-model="settingsStore.projectSettings.threshold"
				placeholder="300"
				type="number"
			/>
		</dd>
	</div>
	<div class="flex items-center my-3">
		<dt class="styled-header w-32">Lifespan</dt>
		<dd class="ml-4 flex-1">
			<InputText
				id="Lifespan"
				v-model="settingsStore.projectSettings.lifespan"
				placeholder="50"
				type="number"
			/>
		</dd>
	</div>
	<div class="flex items-center my-3">
		<dt class="styled-header w-32">Electricity</dt>
		<dd class="ml-4 flex-1">
			<div class="space-y-2">
				<InputText
					id="Electricity"
					v-model="settingsStore.projectSettings.electricityConsumption"
					placeholder="kWh/m²/year"
					type="number"
				/>
				<Dropdown
					:items="energyTypeOptions"
					@selectedItem="handleEnergyTypeChange"
					name="Energy Type"
					dropdownName="Select energy type"
					class="w-full"
				/>
			</div>
		</dd>
	</div>
	<div class="flex items-center my-3">
		<dt class="styled-header w-32">Emissions/Year</dt>
		<dd class="ml-4 flex-1">
			<CheckBox
				id="emissionPerYear"
				name="emissionPerYear"
				:checked="settingsStore.projectSettings.emissionPerYear"
				@update:checked="
					(newVal) => (settingsStore.projectSettings.emissionPerYear = newVal)
				"
			/>
		</dd>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'

	import Dropdown from '@/components/Base/Dropdown.vue'
	import ActionButton from '@/components/Base/ActionButton.vue'
	import InputText from '@/components/Base/InputText.vue'

	import { useSettingsStore } from '@/stores/settingStore'
	import { useSpeckleStore } from '@/stores/speckleStore'
	import { useNavigationStore } from '@/stores/navigationStore'
	import { useProjectStore } from '@/stores/projectStore'

	import { loadProject } from '@/utils/speckleUtils'
	import router from '@/router'

	import type { dropdownItem } from '@/components/Base/DropdownMenuItem.vue'
	import { useFirebaseStore } from '@/stores/firebaseStore'
	import CheckBox from '@/components/Base/CheckBox.vue'
	import { EnergyType } from '@/models/materialModel'

	const settingsStore = useSettingsStore()
	const speckleStore = useSpeckleStore()
	const navStore = useNavigationStore()
	const firebaseStore = useFirebaseStore()
	const projectStore = useProjectStore()

	//This is to check if we actually changed version and should load it again or just use the one loaded
	const changedVersion = ref(false)

	onMounted(async () => {
		const projectSettingsLog = await firebaseStore.fetchProjectSettings(
			projectStore.currProject?.id
		)
		if (projectSettingsLog)
			settingsStore.updateProjectSettings(projectSettingsLog.settings)
	})

	/**
	 *  Return the extracted names from all available versions of the project to be used in dropdown
	 */
	const versionNames = computed(() => {
		let versions: dropdownItem[] = []

		speckleStore.getAllVersions?.forEach((el) => {
			if (typeof el.message === 'string') {
				const item: dropdownItem = {
					name: el.message,
					data: el.id
				}

				versions.push(item)
			}
		})
		return versions
	})

	/**
	 * Sets the selected version from dropdown selected
	 * @param selectedItem
	 */
	const handleSelectedItem = (selectedItem: dropdownItem) => {
		const version = speckleStore.getAllVersions?.find(
			(obj) => obj.id === selectedItem.data
		)

		// Set that we changed to another version manually so we have to load it
		changedVersion.value = true
		if (version) speckleStore.setSelectedVersion(version)
	}

	/**
	 * Loads project when button pressed either its lazyloaded already or we load it from scratch
	 */
	const selectProject = () => {
		// Save the projectSettings
		firebaseStore.addOrUpdateProjectSettings({
			projectId: projectStore.currProject.id,
			settings: settingsStore.projectSettings
		})

		// If version changed we load it otherwise just route it
		if (changedVersion.value) {
			loadProject(true)
		} else {
			navStore.setActivePage('Filtering')
			router.push({
				name: 'Dashboard'
			})
		}
	}

	const energyTypeOptions = computed(() => {
		return Object.values(EnergyType).map((type) => ({
			name: type
				.split('_')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' '),
			data: type
		}))
	})

	const handleEnergyTypeChange = (selectedItem: dropdownItem) => {
		settingsStore.projectSettings.energyType = selectedItem.data as EnergyType
	}
</script>
