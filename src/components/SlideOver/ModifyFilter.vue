<template>
	<div class="relative flex-1 px-4 mt-4">
		<SaveFilters />
		<h3 class="font-semibold mb-2 mt-8">Filter Groups</h3>

		<Draggable
			v-if="callStack"
			:list="callStack"
			:group="callStack"
			item-key="index"
			ghost-class="ghost"
			:animation="200"
			class="space-y-4"
			@start="drag = true"
			@end="drag = false"
		>
			<template #item="{ element, index }">
				<div
					class="styled-element hoverable-sm p-4"
					:class="{
						'styled-active': index === editFilter,
						'scale-[0.99] rotate-1': drag
					}"
				>
					<div class="relative">
						<!-- Edit/Remove Buttons -->
						<div
							v-if="index !== editFilter"
							class="absolute right-2 top-2 flex flex-col gap-2"
						>
							<button
								class="p-1 styled-element hoverable-xs bg-neutral-100"
								:style="{ backgroundColor: navStore.activeColor }"
								@click="toggleFilter(index)"
							>
								<PencilSquareIcon class="h-4 w-4" />
							</button>
							<button
								class="p-1 styled-element hoverable-xs mb-2 bg-neutral-100"
								:style="{ backgroundColor: navStore.activeColor }"
								@click="removeFilter(index)"
							>
								<MinusCircleIcon class="h-4 w-4" />
							</button>
						</div>
						<button
							v-else
							class="absolute right-2 top-2 p-1 styled-element hoverable-xs z-50 bg-neutral-100"
							:style="{ backgroundColor: navStore.activeColor }"
							@click="toggleFilter(index)"
						>
							<XMarkIcon class="h-4 w-4" />
						</button>
					</div>

					<!-- Edit Mode -->
					<div v-if="index === editFilter" class="space-y-4">
						<Dropdown
							v-if="filterNames"
							:items="filterNames"
							:dropdownName="element.name"
							@selectedItem="(item) => handleSelectedName(item, index)"
							class="w-full"
						/>
						<DropdownSearchable
							:items="element.advanced ? parameterNames : simpleParameterNames"
							:dropdownName="element.field"
							@selectedItem="(item) => handleSelectedField(item, index)"
							class="w-full"
						/>
						<input
							v-model="element.value"
							placeholder="Filter value..."
							class="p-2 styled-element styled-data bg-neutral-100"
						/>
						<div class="flex items-center gap-2">
							<CheckBox
								name="False"
								id="False"
								:checked="element.remove"
								@update:checked="(newVal) => (element.remove = newVal)"
							/>
							<label>Remove false results</label>
						</div>
						<div class="flex items-center gap-2">
							<BaseToggle
								:active="element.advanced"
								label="Toggle Advanced"
								:activeColor="navStore.activeColor"
								inactiveColor="#000"
								@change="() => toggleAdvanced(index)"
							>
								<template #inactive>
									<AdjustmentsHorizontalIcon class="h-4 w-4" style="color: black" />
								</template>
								<template #active>
									<AdjustmentsHorizontalIcon
										class="h-4 w-4"
										style="color: var(--nav-active-color)"
									/>
								</template>
							</BaseToggle>
							<label>Advanced mode</label>
						</div>
					</div>

					<!-- View Mode -->
					<div v-else class="space-y-2">
						<p class="font-semibold">{{ element.name }}</p>
						<p class="text-black styled-data text-sm">{{ element.field }}</p>
						<p class="text-black styled-data text-sm">{{ element.value }}</p>
					</div>
				</div>
			</template>
		</Draggable>

		<!-- Add Filter Button -->
		<div class="flex justify-center mt-4 mb-4">
			<button
				@click="addNewFilter"
				class="p-1 styled-element hoverable-xs"
				:style="{ backgroundColor: navStore.activeColor }"
			>
				<PlusCircleIcon class="h-6 w-6" />
			</button>
		</div>

		<!-- Custom Geometry Section -->
		<div v-if="customGeoList.length" class="mt-4">
			<h3 class="font-semibold mb-2">Custom Geometries</h3>
			<div v-for="customGeo in customGeoList" :key="customGeo.geoObj.id">
				<!-- Container -->
				<div class="styled-element hoverable-sm p-4 justify-between items-center">
					<!-- Show AddGroup when editing -->
					<AddGroup
						v-if="editGeo === customGeo.geoObj.id"
						:editMode="true"
						:customGeoData="customGeo"
						@close="toggleEditGeo(null)"
					/>
					<!-- Normal mode -->
					<div v-else>
						<div class="flex justify-between items-center">
							<div>
								<p class="font-semibold">ID: {{ customGeo.geoObj.name }}</p>
								<p class="text-sm text-black">
									{{ customGeo.geoObj.quantity.m2 || 'No quantities' }}
								</p>
							</div>
							<div class="flex gap-2">
								<button
									class="p-1 styled-element hoverable-xs bg-neutral-100"
									:style="{ backgroundColor: navStore.activeColor }"
									@click="toggleEditGeo(customGeo.geoObj.id)"
								>
									<PencilSquareIcon class="h-4 w-4" />
								</button>
								<button
									class="p-1 styled-element hoverable-xs bg-neutral-100"
									:style="{ backgroundColor: navStore.activeColor }"
									@click="removeCustomGeo(customGeo)"
								>
									<MinusCircleIcon class="h-4 w-4" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, onUnmounted, computed } from 'vue'
	import Draggable from 'vuedraggable'
	import Dropdown from '@/components/Base/Dropdown.vue'
	import CheckBox from '@/components/Base/CheckBox.vue'
	import AddGroup from './AddGroup.vue'

	import { XMarkIcon } from '@heroicons/vue/24/outline'
	import {
		PencilSquareIcon,
		PlusCircleIcon,
		MinusCircleIcon,
		AdjustmentsHorizontalIcon
	} from '@heroicons/vue/24/solid'
	import { useProjectStore } from '@/stores/projectStore'
	import { useNavigationStore } from '@/stores/navigationStore'
	import DropdownSearchable from '@/components/Base/DropdownSearchable.vue'
	import BaseToggle from '../Base/BaseToggle.vue'
	import { updateProjectGroups } from '@/utils/projectUtils'

	import type { SimpleParameters } from '@/models/geometryModel'
	import type { dropdownItem } from '@/components/Base/Dropdown.vue'
	import type { CustomGeo } from '@/models/filterModel'
	import SaveFilters from '@/components/SlideOver/SaveFilters.vue'

	// Store initialization
	const projectStore = useProjectStore()
	const navStore = useNavigationStore()

	// Reactive state
	const editFilter = ref(-1)
	const editGeo = ref<string | null>(null)
	const callStack = ref(projectStore.getRegistryStack())
	const drag = ref(false)

	const customGeoList = computed(() => {
		return projectStore.filterRegistry.filterList.customGeo || []
	})

	// Computed dropdown items
	const filterNames = projectStore
		.getFilterNames()
		.map((el: string) => ({ name: el, data: '' }))
		.sort((a, b) => a.name.localeCompare(b.name))

	const parameterNames = projectStore
		.getAvailableParameterList(true)
		.map((el: string) => ({ name: el, data: '' }))
		.sort((a, b) => a.name.localeCompare(b.name))

	// Dynamically generate simpleParameterNames from SimpleParameters interface
	const simpleParameterDefaults: SimpleParameters = {
		category: '',
		type: '',
		code: '',
		materialName: '',
		m: 0,
		m2: 0,
		m3: 0
	}
	const simpleParameterNames = Object.keys(simpleParameterDefaults).map(
		(key) => ({ name: key, data: '' })
	)

	// Methods
	const handleSelectedName = (selectedItem: dropdownItem, index: number) => {
		callStack.value[index].name = selectedItem.name
	}

	const handleSelectedField = (selectedItem: dropdownItem, index: number) => {
		// If we are adding from the simple selection we add the full path while still displaying the reduced one
		if (!callStack.value[index].advanced)
			callStack.value[index].field = 'simpleParameters.' + selectedItem.name
		else callStack.value[index].field = selectedItem.name
	}

	const toggleAdvanced = (index: number) => {
		callStack.value[index].advanced = !callStack.value[index].advanced
	}

	const addNewFilter = () => {
		callStack.value.push({
			name: filterNames[0].name,
			field: parameterNames[0].name,
			value: '',
			remove: false,
			advanced: false
		})
	}

	const removeFilter = (index: number) => {
		if (index > -1) {
			callStack.value.splice(index, 1)
		}
		editFilter.value = -1
	}

	const toggleFilter = (index: number) => {
		editFilter.value = editFilter.value !== index ? index : -1
	}

	const removeCustomGeo = (geo: CustomGeo) => {
		if (projectStore.filterRegistry.filterList.customGeo) {
			projectStore.removeCustomGeoFromStack(geo)
		}
	}

	const toggleEditGeo = (geoId: string | null) => {
		editGeo.value = geoId
	}

	// Update store when component unmounts
	onUnmounted(() => {
		projectStore.updateRegistryStack('test', callStack.value, customGeoList.value)
		updateProjectGroups()
	})
</script>

<style scoped>
	.ghost {
		opacity: 0.5;
		background: #e2e8f0;
		transform: rotate(3deg) scale(0.98);
		transition: transform 0.2s ease-in-out;
	}

	.sortable-drag {
		opacity: 0;
	}

	.sortable-chosen {
		background: #f8fafc;
	}

	/* Add slide animation for reordering */
	.flip-list-move {
		transition: transform 0.5s;
	}

	/* Optional: add some hover effects */
	.styled-element {
		transform-origin: center;
		transition: all 0.2s ease-in-out;
	}

	.styled-element:hover {
		transform: translateY(-2px);
	}
</style>
