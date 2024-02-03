<template>
	<div class="rounded-2xl bg-gray-200 p-4">
		<div class="flex pb-2 justify-between items-center">
			<div class="flex">
				<button
					aria-label="Expand"
					class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
					@click="expandGroup"
				>
					<ChevronDownIcon v-if="!expand" class="h-5 w-5" />
					<ChevronUpIcon v-if="expand" class="h-5 w-5" />
				</button>
			</div>
			<div class="flex items-center">
				<input
					v-if="editName"
					v-model="inGroups.name"
					placeholder="edit me"
					@blur="saveEdit"
					@keyup.enter="saveEdit"
				/>
				<label
					v-else
					class="ml-2 text-gray-700 font-semibold font-sans tracking-wide"
				>
					{{ inGroups.name }}
				</label>
			</div>
			<div class="flex">
				<button
					aria-label="Expand"
					class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
					@click="editName = !editName"
				>
					<PencilSquareIcon class="h-5 w-5" />
				</button>
			</div>
		</div>
		<div class="justify-between items-center">
			<div
				class="bg-gray-100 rounded-lg p-1 items-center max-w-full overflow-x-auto"
			>
				<table v-if="expand" class="w-full text-left table-auto">
					<thead class="text-sm">
						<tr>
							<th class="px-4 w-2/3">Name</th>
							<th class="w-1/3">Elements</th>
						</tr>
					</thead>
					<tbody>
						<SubGroup v-if="expand && inGroups" :subGroup="inGroups" />
					</tbody>
				</table>
				<p class="text-center">{{ totalArea }} m<sup>2</sup></p>
			</div>
			<div class="flex items-center justify-center">
				<button
					v-if="editName"
					aria-label="Remove filter"
					class="pt-2 text-center focus:outline-none focus:shadow-outline text-red-600 hover:text-red-500"
					@click="removeGroup"
				>
					<MinusCircleIcon class="h-6 w-6" />
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, watch, ref, computed } from 'vue'
	import {
		ChevronDownIcon,
		ChevronUpIcon,
		PencilSquareIcon,
		MinusCircleIcon
	} from '@heroicons/vue/24/solid'

	import SubGroup from '@/components/Sidebar/SubGroup.vue'
	import type { NestedGroup } from '@/models/filters'
	import { useProjectStore } from '@/stores/main'

	export default defineComponent({
		name: 'OverviewGroupCard',
		components: {
			SubGroup,
			ChevronDownIcon,
			ChevronUpIcon,
			PencilSquareIcon,
			MinusCircleIcon
		},
		props: {
			/**
			 * Array of groups to show in the card, they should all share a top level to show
			 */
			groups: {
				type: Object as () => NestedGroup,
				required: true
			}
		},
		setup(props) {
			const projectStore = useProjectStore()

			const inGroups = ref(props.groups)
			const expand = ref(false)
			const editName = ref(false)

			watch(
				() => props.groups,
				(newValue) => {
					inGroups.value = newValue
				}
			)

			const totalArea = computed(() => {
				const area = inGroups.value.objects.reduce(
					(sum, obj) => sum + obj.quantity.M2,
					0
				)
				return parseFloat(area.toFixed(2))
			})

			const expandGroup = () => {
				expand.value = !expand.value
				// Expand group logic here
			}

			const saveEdit = () => {
				editName.value = false
				projectStore.updateGroupName(inGroups.value.name, inGroups.value.id)
			}

			const removeGroup = () => {
				editName.value = false
				projectStore.removeGroup(inGroups.value.id)
			}

			return {
				expandGroup,
				saveEdit,
				removeGroup,
				totalArea,
				editName,
				expand,
				inGroups
			}
		}
	})
</script>
