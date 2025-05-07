<template>
	<div>
		<h2 class="styled-header">Buildingpart Codes</h2>
		<p class="mt-1 styled-text">
			Set building codes to include, this will be used to segment results on
			building codes. Mostly used for certifications.
		</p>

		<div class="flex flex-col">
			<div class="flex flex-col items-start mt-2">
				<Dropdown
					:items="buildingCodeDropdown"
					name="calculationSettings"
					:dropdownName="dropdownName"
					@selectedItem="handleSelectedItem"
				/>
			</div>
		</div>
		<!-- Checkbox Table -->
		<table
			class="border styled-element mt-6 w-full border-collapse table-fixed"
		>
			<tbody>
				<tr v-for="(row, rowIndex) in chunkedGroups" :key="rowIndex">
					<td
						v-for="(group, colIndex) in row"
						:key="colIndex"
						class="styled-table p-2 align-top w-1/4"
					>
						<!-- Top-level Checkbox -->
						<label class="flex items-center space-x-2 mb-2">
							<CheckBox
								:id="group.name"
								:name="group.name"
								:checked="group.selected || false"
								@update:checked="(newVal) => toggleGroup(group, newVal)"
							/>
							<span class="styled-data font-bold">
								{{ group.name }}
							</span>
						</label>

						<!-- Subcategory Checkboxes -->
						<div class="ml-2">
							<label
								v-for="(child, childIndex) in group.children"
								:key="childIndex"
								class="flex items-start space-x-2"
							>
								<CheckBox
									:id="child.name"
									:name="child.name"
									:checked="child.selected"
									@update:checked="
										(newVal) => checkGroupSelection(group, child, newVal)
									"
								/>
								<span class="styled-data">{{ child.name }}</span>
							</label>
						</div>
					</td>
					<!-- Empty rows -->
					<td
						v-for="n in 4 - row.length"
						:key="'blank-' + n"
						class="border border-black p-2"
					/>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref, watch } from 'vue'
	import { storeToRefs } from 'pinia'
	import { useSettingsStore } from '@/stores/settingStore'

	import type { BuildingCodeItem } from '@/models/buildingCodeModel'
	import type { dropdownItem } from '@/components/Base/DropdownMenuItem.vue'
	import { buildingCodes } from '@/models/buildingCodeModel'

	import Dropdown from '@/components/Base/Dropdown.vue'
	import CheckBox from '@/components/Base/CheckBox.vue'
	import { chunkArray } from '@/utils/dataUtils'

	const settingsStore = useSettingsStore()
	const { calculationSettings } = storeToRefs(settingsStore)

	const groupedBuildingCodes = ref<BuildingCodeItem[]>([])
	const selectedBuildingCode = ref({
		key: Object.keys(buildingCodes)[0],
		data: buildingCodes[Object.keys(buildingCodes)[0]]
	})

	// Add computed property for dropdown name
	const dropdownName = computed(
		() =>
			calculationSettings.value?.buildingCode?.key ||
			selectedBuildingCode.value.key
	)

	// Initialize the dropdown items
	const buildingCodeDropdown: dropdownItem[] = Object.keys(buildingCodes).map(
		(key) => {
			return {
				name: key,
				data: JSON.stringify(buildingCodes[key])
			}
		}
	)

	const initializeGroupedBuildingCodes = () => {
		// Ensure default values are set
		if (!calculationSettings.value.buildingCode) {
			settingsStore.updateBuildingCode(selectedBuildingCode.value)
		}

		const data =
			calculationSettings.value.buildingCode?.data ||
			selectedBuildingCode.value.data
		groupedBuildingCodes.value = JSON.parse(JSON.stringify(data)).map(
			(item: BuildingCodeItem) => ({
				...item,
				selected: item.selected || false,
				children:
					item.children?.map((child) => ({
						...child,
						selected: child.selected || false
					})) || []
			})
		)
	}

	const chunkedGroups = computed(() => {
		return chunkArray(groupedBuildingCodes.value, 4)
	})

	const updateBuildingCodes = () => {
		// Update the calculation settings in the store
		settingsStore.updateBuildingCode({
			key: calculationSettings.value.buildingCode.key,
			data: groupedBuildingCodes.value
		})
	}

	// Toggle the selection of all subcategory checkboxes within a group
	const toggleGroup = (group: BuildingCodeItem, newVal: boolean) => {
		group.selected = newVal
		group.children?.forEach((child) => {
			child.selected = newVal
		})
		updateBuildingCodes()
	}

	// Check if all children are selected and update the checkboxes accordingly
	const checkGroupSelection = (
		group: BuildingCodeItem,
		child: BuildingCodeItem,
		newVal: boolean
	) => {
		child.selected = newVal
		group.selected = group.children?.every((child) => child.selected) || false
		updateBuildingCodes()
	}

	const handleSelectedItem = (selectedItem: dropdownItem) => {
		const data = JSON.parse(selectedItem.data) as BuildingCodeItem[]

		settingsStore.updateBuildingCode({
			key: selectedItem.name,
			data: data
		})

		initializeGroupedBuildingCodes()
	}

	onMounted(() => {
		initializeGroupedBuildingCodes()
	})

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	watch(
		() => calculationSettings.value.buildingCode,
		(newVal) => {
			initializeGroupedBuildingCodes()
		}
	)
</script>
