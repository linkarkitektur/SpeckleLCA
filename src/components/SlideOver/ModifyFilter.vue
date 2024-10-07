<template>
	<div
		class="flex relative h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl"
	>
		<div class="px-4 sm:px-6">
			<div class="flex items-start justify-between">
				<DialogTitle class="text-base font-semibold leading-6 text-gray-900">
					Group edit
				</DialogTitle>
				<div class="ml-3 flex h-7 items-center">
					<button
						type="button"
						class="relative rounded-md mr-4 bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
						@click="toggleSaveModal()"
					>
						<span class="absolute -inset-2.5" />
						<span class="sr-only"> Save filters </span>
						<BookmarkIcon class="h-6 w-6" aria-hidden="true" />
					</button>
					<button
						type="button"
						class="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
						@click="toggleSlideover()"
					>
						<span class="absolute -inset-2.5" />
						<span class="sr-only"> Close panel </span>
						<XMarkIcon class="h-6 w-6" aria-hidden="true" />
					</button>
				</div>
			</div>
		</div>
		<div class="relative mt-6 flex-1 p-4 sm:px-6 overflow-auto">
			<Draggable
				v-if="callStack"
				:list="callStack"
				:group="callStack"
				item-key="index"
				ghost-class="ghost"
				:animation="200"
			>
				<template #item="{ element, index }">
					<div class="rounded-2xl bg-gray-200 mb-4 p-4 hover:cursor-move">
						<div class="relative">
							<button
								v-if="index != editFilter"
								aria-label="Edit filter"
								class="absolute right-0 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
								@click="toggleFilter(index)"
							>
								<PencilSquareIcon class="ml-2 h-5 w-5" />
							</button>
							<button
								v-else
								aria-label="Edit filter"
								class="absolute right-0 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
								@click="toggleFilter(index)"
							>
								<XMarkIcon class="ml-2 h-5 w-5" />
							</button>
						</div>
						<div v-if="index == editFilter">
							<p class="pt-2">
								<Dropdown
									v-if="filterNames"
									:items="filterNames"
									:dropdownName="element.name"
									@selectedItem="(item) => handleSelectedName(item, index)"
								/>
							</p>
							<p class="pt-2">
								<Dropdown
									v-if="parameterNames"
									:v-model="element.field"
									:items="parameterNames"
									:dropdownName="element.field"
									@selectedItem="(item) => handleSelectedField(item, index)"
								/>
							</p>
							<p class="pt-2">
								<input v-model="element.value" placeholder="edit me" />
							</p>
							<p>
								<input v-model="element.remove" type="checkbox" />
								<label> Remove false results</label>
							</p>
							<button
								aria-label="Remove filter"
								class="pt-2 focus:outline-none focus:shadow-outline text-red-600 hover:text-red-500"
								@click="removeFilter(index)"
							>
								<MinusCircleIcon class="h-6 w-6" />
							</button>
						</div>
						<div v-else>
							<p>
								<label
									class="ml-2 text-gray-700 font-semibold font-sans tracking-wide"
								>
									{{ element.name }}
								</label>
							</p>
							<p>
								<label
									class="ml-2 text-gray-700 font-semibold font-sans tracking-wide"
								>
									{{ element.field }}
								</label>
							</p>
							<p>
								<label
									class="ml-2 text-gray-700 font-semibold font-sans tracking-wide"
								>
									{{ element.value }}
								</label>
							</p>
						</div>
					</div>
				</template>
			</Draggable>
			<div class="pt-10 grid place-items-center">
				<button @click="addNewFilter">
					<PlusCircleIcon
						class="h-10 w-10 text-green-600 hover:text-green-500"
					/>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, ref } from 'vue'
	import Draggable from 'vuedraggable'
	import Dropdown, { type dropdownItem } from '@/components/Dropdown.vue'
	import { DialogTitle } from '@headlessui/vue'
	import { XMarkIcon } from '@heroicons/vue/24/outline'
	import {
		PencilSquareIcon,
		PlusCircleIcon,
		MinusCircleIcon,
		BookmarkIcon,
	} from '@heroicons/vue/24/solid'
	import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'

	export default defineComponent({
		name: 'ModifyFilter',
		components: {
			DialogTitle,
			Draggable,
			Dropdown,
			XMarkIcon,
			PencilSquareIcon,
			PlusCircleIcon,
			MinusCircleIcon,
			BookmarkIcon
		},
		setup() {
			const navStore = useNavigationStore()
			const projectStore = useProjectStore()

			const toggleSlideover = () => {
				projectStore.updateRegistryStack('test', callStack.value)
				navStore.toggleSlideover()
			}

			const editFilter = ref(-1)

			const filterNames: dropdownItem[] = projectStore
				.getFilterNames()
				.map((el: string) => ({
					name: el,
					data: ''
				}))
				.sort((a, b) => a.name.localeCompare(b.name))

			const parameterNames: dropdownItem[] = projectStore
				.getAvailableParameterList()
				.map((el: string) => ({
					name: el,
					data: ''
				}))
				.sort((a, b) => a.name.localeCompare(b.name))

			const callStack = ref(projectStore.getRegistryStack())

			/**
			 * Sets the selected name of the filter from dropdown selected
			 * @param selectedItem
			 * @param index of the item in the callstack
			 */
			const handleSelectedName = (
				selectedItem: dropdownItem,
				index: number
			) => {
				callStack.value[index].name = selectedItem.name
			}

			/**
			 * Sets the selected field to filter on from dropdown selected
			 * @param selectedItem
			 * @param index of the item in the callstack
			 */
			const handleSelectedField = (
				selectedItem: dropdownItem,
				index: number
			) => {
				callStack.value[index].field = selectedItem.name
			}

			const addNewFilter = () => {
				callStack.value.push({
					name: filterNames[0].name,
					field: parameterNames[0].name
				})
			}

			const removeFilter = (index: number) => {
				if (index > -1) {
					callStack.value.splice(index, 1)
				}
				editFilter.value = -1
			}

			const toggleFilter = (index: number) => {
				if (editFilter.value != index) {
					editFilter.value = index
				} else {
					editFilter.value = -1
				}
			}

			const toggleSaveModal = () => {
				projectStore.updateRegistryStack('test', callStack.value)
				navStore.toggleSaveModal()
			}

			return {
				toggleSlideover,
				toggleSaveModal,
				handleSelectedName,
				handleSelectedField,
				addNewFilter,
				removeFilter,
				toggleFilter,
				filterNames,
				parameterNames,
				editFilter,
				callStack
			}
		}
	})
</script>
