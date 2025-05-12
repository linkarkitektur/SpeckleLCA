<template>
	<div class="space-y-12">
		<h2 class="styled-header">Save to firebase</h2>
		<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
			<div class="sm:col-span-6">
				<label for="name" class="block styled-text normal-case"> Name </label>
				<div class="mt-2">
					<div class="flex">
						<InputText
							id="name"
							v-model="formData.name"
							placeholder="Run name"
						/>
					</div>
				</div>

				<label for="parameters" class="block styled-text normal-case mt-6">
					Included Results
				</label>
				<div class="ml-2">
					<Draggable
						v-if="groupings"
						:list="groupings"
						item-key="id"
						ghost-class="ghost"
						:animation="200"
						class="space-y-4"
					>
						<template #item="{ element, index }">
							<div
								class="styled-element hoverable-sm pressable p-4 flex justify-between items-center"
							>
								<DropdownSearchable
									:items="parameterNames"
									:dropdownName="element.parameter"
									@selectedItem="(item) => updateGrouping(item, index)"
									class="w-full"
								/>
								<button
									class="p-1 styled-element hoverable-xs bg-neutral-100 ml-2"
									:style="{ backgroundColor: navStore.activeColor }"
									@click="removeGrouping(index)"
								>
									<MinusCircleIcon class="h-4 w-4" />
								</button>
							</div>
						</template>
					</Draggable>
					<div class="flex items-center justify-center">
						<button
							class="p-1 styled-element hoverable-xs bg-neutral-100 mt-4"
							:style="{ backgroundColor: navStore.activeColor }"
							@click="addNewGrouping"
						>
							<PlusCircleIcon class="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="mt-6 flex items-center justify-start gap-x-6">
		<ActionButton text="Save" @on-click="saveData" />
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue'

	import { useProjectStore } from '@/stores/projectStore'
	import { useNavigationStore } from '@/stores/navigationStore'
	import { useFirebaseStore } from '@/stores/firebaseStore'
	import { useResultStore } from '@/stores/resultStore'

	import InputText from '@/components/Base/InputText.vue'
	import ActionButton from '@/components/Base/ActionButton.vue'
	import Draggable from 'vuedraggable'
	import DropdownSearchable from '@/components/Base/DropdownSearchable.vue'

	import { PlusCircleIcon, MinusCircleIcon } from '@heroicons/vue/24/solid'
	import { ResultCalculator } from '@/utils/resultUtils'

	import type { ResultItem } from '@/models/resultModel'

	const navStore = useNavigationStore()
	const projectStore = useProjectStore()
	const resultStore = useResultStore()
	const firebaseStore = useFirebaseStore()

	const formData = ref({
		name: ''
	})

	// Updated groupings to include displayName and data properties.
	const groupings = ref<ResultItem[]>([
		{
			parameter: 'parameters.category',
			displayName: 'parameters.category',
			data: []
		},
		{ parameter: 'material.name', displayName: 'material.name', data: [] },
		{
			parameter: 'material.metaData.materialType',
			displayName: 'material.metaData.materialType',
			data: []
		},
		{ parameter: 'parameters.code', displayName: 'parameters.code', data: [] },
		{
			parameter: 'parameters.speckle_type',
			displayName: 'parameters.speckle_type',
			data: []
		}
	])

	const parameterNames = projectStore
		.getAvailableParameterList(true)
		.map((el: string) => ({ name: el, data: '' }))
		.sort((a, b) => a.name.localeCompare(b.name))

	const updateGrouping = (selectedItem: { name: string }, index: number) => {
		// Update both parameter and displayName accordingly.
		groupings.value[index].parameter = selectedItem.name
		groupings.value[index].displayName = selectedItem.name
	}

	const addNewGrouping = () => {
		groupings.value.push({
			parameter: parameterNames[0].name,
			displayName: parameterNames[0].name,
			data: []
		})
	}

	const removeGrouping = (index: number) => {
		groupings.value.splice(index, 1)
	}

	const saveData = () => {
		const resCalc = new ResultCalculator(projectStore.currProject.geometry)
		resCalc.setResultListProperties(groupings.value)
		resCalc.aggregate(false, true)

		firebaseStore.addResultList(
			projectStore.currProject.id,
			resCalc.resultList,
			formData.value.name
		)
		resultStore.setResultList(resCalc.resultList)
		navStore.toggleSlideover()
	}
</script>

<style scoped>
	.ghost {
		opacity: 0.5;
		background: #e2e8f0;
		transform: rotate(3deg) scale(0.98);
		transition: transform 0.2s ease-in-out;
	}
	.styled-element {
		transform-origin: center;
		transition: all 0.2s ease-in-out;
	}
	.styled-element:hover {
		transform: translateY(-2px);
	}
</style>
