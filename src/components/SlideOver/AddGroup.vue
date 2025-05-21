<template>
	<div class="space-y-12">
		<div class="pb-12">
			<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
				<div class="sm:col-span-4">
					<InputText
						id="searchBar"
						v-model="formData.name"
						placeholder="Group name"
					/>
				</div>
				<div class="sm:col-span-6 pb-4 border-b-2 border-black">
					<label for="quanity" class="block styled-header"> Quantities </label>
				</div>
				<!-- Area input -->
				<div class="sm:col-span-2 sm:col-start-1">
					<label for="quantityM2" class="block styled-header"> Area </label>
					<div class="mt-2">
						<InputText
							id="quantityM2"
							v-model="formData.M2"
							placeholder="0"
							type="number"
							:disabled="!!linkedGroup"
						/>
					</div>
				</div>
				<!-- Volume input -->
				<div class="sm:col-span-2">
					<label for="quantityM3" class="block styled-header"> Volume </label>
					<div class="mt-2">
						<InputText
							id="quantityM3"
							v-model="formData.M3"
							placeholder="0"
							type="number"
							:disabled="!!linkedGroup"
						/>
					</div>
				</div>
				<!-- Length input -->
				<div class="sm:col-span-2">
					<label for="quantityM" class="block styled-header"> Length </label>
					<div class="mt-2">
						<InputText
							id="quantityM"
							v-model="formData.M"
							placeholder="0"
							type="number"
							:disabled="!!linkedGroup"
						/>
					</div>
				</div>
				<!-- Kilograms input -->
				<div class="sm:col-span-2 sm:col-start-1">
					<label for="quantityKG" class="block styled-header">
						Kilograms
					</label>
					<div class="mt-2">
						<InputText
							id="quantityKG"
							v-model="formData.KG"
							placeholder="0"
							type="number"
							:disabled="!!linkedGroup"
						/>
					</div>
				</div>
				<!-- Tones input -->
				<div class="sm:col-span-2">
					<label for="quantityTONES" class="block styled-header"> Tones </label>
					<div class="mt-2">
						<InputText
							id="quantityTONES"
							v-model="formData.tonnes"
							placeholder="0"
							type="number"
							:disabled="!!linkedGroup"
						/>
					</div>
				</div>
				<!-- Pieces input -->
				<div class="sm:col-span-2">
					<label for="quantityPCS" class="block styled-header"> Pieces </label>
					<div class="mt-2">
						<InputText
							id="quantityPCS"
							v-model="formData.PCS"
							placeholder="0"
							type="number"
							:disabled="!!linkedGroup"
						/>
					</div>
				</div>
				<div class="sm:col-span-6 pb-4 border-b-2 border-black">
					<label for="quanity" class="block styled-header"> Metadata </label>
				</div>
				<div class="sm:col-span-2 sm:col-start-1">
					<label for="quanityM2" class="block styled-header"> Category </label>
					<div class="mt-2">
						<InputText
							id="category"
							v-model="formData.category"
							placeholder="category"
							type="text"
						/>
					</div>
				</div>

				<div class="sm:col-span-2">
					<label for="quanityM2" class="block styled-header"> Type </label>
					<div class="mt-2">
						<InputText
							id="type"
							v-model="formData.type"
							placeholder="type"
							type="text"
						/>
					</div>
				</div>

				<div class="sm:col-span-2">
					<label for="quanityM2" class="block styled-header"> Code </label>
					<div class="mt-2">
						<InputText
							id="code"
							v-model="formData.code"
							placeholder="code"
							type="text"
						/>
					</div>
				</div>
				<div class="sm:col-span-2 sm:col-start-1">
					<label for="quanityM2" class="block styled-header"> Material </label>
					<div class="mt-2">
						<InputText
							id="material"
							v-model="formData.material"
							placeholder="material"
							type="text"
						/>
					</div>
				</div>
			</div>

			<!-- Drop zone for linking quantities -->
			<div
				class="sm:col-span-6 my-4 p-4 border-dashed border-2 border-green-600 text-center styled-bread"
				@dragover.prevent
				@drop="handleDrop"
			>
				<p v-if="!linkedGroup" class="p-2 pointer-events-none">
					Drag and drop a group here to link its quantities.
				</p>
				<p v-else>Linked Group: {{ linkedGroup.name }}</p>
			</div>
			<div v-if="linkedGroup" class="flex items-center justify-end gap-x-6">
				<ActionButton
					@on-click="unlinkGroup"
					text="Unlink"
					class="absolute right-0"
				/>
			</div>
			<!-- New percentage input -->
			<div v-if="linkedGroup" class="sm:col-span-6">
				<label for="percentage" class="block styled-header">
					Percentage (%)
				</label>
				<div class="mt-2">
					<InputText
						id="percentage"
						v-model.number="percentage"
						placeholder="Enter percentage"
						type="number"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Drop zone for linking metadata -->
	<div
		class="sm:col-span-6 my-4 p-4 border-dashed border-2 border-green-600 text-center styled-bread"
		@dragover.prevent
		@drop="handleMetaDrop"
	>
		<p v-if="!linkedGeo" class="p-2 pointer-events-none">
			Drag and drop a group here to populate filtering information.
		</p>
		<p v-else>Linked Geometry: {{ linkedGeo.name }}</p>
	</div>

	<div class="flex items-center justify-end gap-x-6 mb-4">
		<ActionButton text="Cancel" @on-click="cancel" />
		<ActionButton text="Save" @on-click="saveData" />
	</div>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue'

	import { useProjectStore } from '@/stores/projectStore'
	import { useNavigationStore } from '@/stores/navigationStore'
	import type { CustomGeo, NestedGroup } from '@/models/filterModel'
	import type { GeometryObject } from '@/models/geometryModel'
	import InputText from '../Base/InputText.vue'
	import ActionButton from '../Base/ActionButton.vue'
	import { updateProjectGroups } from '@/utils/projectUtils'
	import { calculateLinkedQuantities } from '@/utils/filterUtils'

	const navStore = useNavigationStore()
	const projectStore = useProjectStore()

	const formData = ref({
		name: '',
		category: '',
		type: '',
		code: '',
		material: '',
		M: 0,
		M2: 0,
		M3: 0,
		KG: 0,
		tonnes: 0,
		PCS: 0
	})

	// State for tracking a dragged group and percentage value
	const linkedGroup = ref<NestedGroup | null>(null)
	const linkedGeo = ref<NestedGroup | null>(null)
	const percentage = ref(100)
	const id = ref<string>(crypto.randomUUID())

	// Add props for edit mode
	const props = defineProps<{
		editMode?: boolean
		customGeoData?: CustomGeo
	}>()

	// Initialize form data with existing values if in edit mode
	if (props.editMode && props.customGeoData) {
		const geo = props.customGeoData.geoObj
		formData.value = {
			name: geo.name,
			category: geo.simpleParameters.category,
			type: geo.simpleParameters.type,
			code: geo.simpleParameters.code,
			material: geo.simpleParameters.materialName,
			M: geo.quantity.m ?? 0,
			M2: geo.quantity.m2 ?? 0,
			M3: geo.quantity.m3 ?? 0,
			KG: geo.quantity.kg ?? 0,
			tonnes: geo.quantity.tonnes ?? 0,
			PCS: geo.quantity.pcs
		}
		const tree = projectStore.getGroupTree()

		// Set linked data if exists
		if (props.customGeoData.linkedQuantId) {
			linkedGroup.value = projectStore.searchTree(
				tree,
				props.customGeoData.linkedQuantId
			)
			percentage.value = props.customGeoData.percentage || 100
		}

		if (props.customGeoData.linkGeoId) {
			linkedGeo.value = projectStore.searchTree(
				tree,
				props.customGeoData.linkGeoId
			)
		}

		id.value = props.customGeoData.geoObj.id
	}

	const emit = defineEmits(['close'])

	// For quantities
	const handleDrop = (event: DragEvent) => {
		event.preventDefault()
		try {
			// Assume that the GroupCard component sets the group data via JSON
			const data = event.dataTransfer?.getData('application/json')
			if (data) {
				const group = JSON.parse(data)
				// Set the dropped group as the linkedGroup.
				linkedGroup.value = group

				linkQuantities()
			}
		} catch (err) {
			console.error('Error handling drop:', err)
		}
	}

	// For getting metadata such as category type, etc
	const handleMetaDrop = (event: DragEvent) => {
		event.preventDefault()
		try {
			// Assume that the GroupCard component sets the group data via JSON
			const data = event.dataTransfer?.getData('application/json')
			if (data) {
				const group = JSON.parse(data)
				linkedGeo.value = group

				// We just take the first, since they should be grouped, this is not a proper way but will work.
				formData.value.category = group.objects[0].simpleParameters.category
				formData.value.type = group.objects[0].simpleParameters.type
				formData.value.code = group.objects[0].simpleParameters.code
				formData.value.material = group.objects[0].simpleParameters.materialName
			}
		} catch (err) {
			console.error('Error handling drop:', err)
		}
	}

	/**
	 * Reset quantities
	 */
	function resetForm() {
		formData.value.M = 0
		formData.value.M2 = 0
		formData.value.M3 = 0
		formData.value.KG = 0
		formData.value.PCS = 0
		formData.value.tonnes = 0
	}

	/**
	 * Updates formdata to match Linked group
	 */
	function linkQuantities() {
		resetForm()
		if (linkedGroup.value) {
			const quantities = calculateLinkedQuantities(
				linkedGroup.value,
				percentage.value
			)
			formData.value.M = quantities.m
			formData.value.M2 = quantities.m2
			formData.value.M3 = quantities.m3
			formData.value.KG = quantities.kg
			formData.value.PCS = quantities.pcs
			formData.value.tonnes = quantities.tonnes
		}
	}

	const unlinkGroup = () => {
		resetForm()
		linkedGroup.value = null
		percentage.value = 0
	}

	const saveData = () => {
		//Create a new geometry object which we append all the quantities to
		const URI = linkedGeo.value
			? linkedGeo.value.objects.flatMap((obj) => obj.URI)
			: []
		const geoObj: GeometryObject = {
			id: id.value,
			name: formData.value.name,
			URI: URI,
			quantity: {
				m: formData.value.M,
				m2: formData.value.M2,
				m3: formData.value.M3,
				kg: formData.value.KG,
				tonnes: formData.value.tonnes,
				pcs: formData.value.PCS,
				l: 0
			},
			parameters: {
				name: formData.value.name,
				type: 'Manually added',
				manualTag: 'true',
				area: formData.value.M2.toString(),
				volume: formData.value.M3.toString(),
				length: formData.value.M.toString()
			},
			simpleParameters: {
				category: formData.value.category,
				type: formData.value.type,
				materialName: formData.value.material,
				code: formData.value.code,
				m: formData.value.M,
				m2: formData.value.M2,
				m3: formData.value.M3
			}
		}

		// Create CustomGeo object so we can recreate and relink the areas on geometry changes
		const customGeo: CustomGeo = {
			geoObj: geoObj,
			linkedQuantId: linkedGroup.value ? linkedGroup.value.id : null,
			linkGeoId: linkedGeo.value ? linkedGeo.value.id : null,
			percentage: linkedGroup.value ? percentage.value : null
		}

		// Add to filters with geometry information and group info
		if (props.editMode) {
			projectStore.updateCustomGeo(customGeo)
			emit('close')
		} else {
			projectStore.addCustomGeoToStack(customGeo)
			navStore.toggleSlideover()
		}

		resetForm()
		updateProjectGroups()
	}

	const cancel = () => {
		if (props.editMode) {
			emit('close')
		} else {
			navStore.toggleSlideover()
		}
	}

	watch(percentage, () => {
		if (linkedGroup.value) {
			linkQuantities()
		}
	})
</script>
