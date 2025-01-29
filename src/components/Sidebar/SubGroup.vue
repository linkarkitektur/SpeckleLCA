<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<template>
	<tr class="text-sm leading-6 text-gray-900 border-b border-gray-300">
		<td :class="`flex w-2/3 px-${computedPadding}`">
			<p :class="`w-${computedPadding}`"></p>
			<button
				aria-label="Expand"
				class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800 w-5"
				@click="expandGroup"
			>
				<ChevronDownIcon
					v-if="!expand && subGroupData.children.length > 0"
					class="h-5 w-5"
				/>
				<ChevronUpIcon
					v-if="expand && subGroupData.children.length > 0"
					class="h-5 w-5"
				/>
			</button>
			<p
				tabindex="0"
				class="pl-2 truncate focus:underline hover:underline cursor-pointer"
				@click="selectSubGroup(subGroupData)"
			>
				{{ subGroupData.name }}
			</p>
		</td>
		<td class="w-1/3">
			<p class="truncate">{{ subGroupData.objects.length }}</p>
		</td>
	</tr>

	<!-- If we have children run it recursive -->
	<subGroup
		v-if="subGroupData.children && subGroupData.children.length && expand"
		v-for="child in subGroupData.children"
		v-bind:key="child.id"
		:subGroup="child"
		:depth="depth + 1"
	/>
</template>

<script lang="ts">
	import { defineComponent, ref, watch, computed } from 'vue'
	import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/solid'
	import type { NestedGroup } from '@/models/filters'
	import { useProjectStore } from '@/stores/main'

	export default defineComponent({
		name: 'SubGroup',
		components: {
			ChevronDownIcon,
			ChevronUpIcon
		},
		props: {
			subGroup: {
				type: Object as () => NestedGroup,
				required: true
			},
			depth: {
				type: Number,
				default: 0
			}
		},
		setup(props) {
			const subGroupData = ref(props.subGroup)
			const depth = ref(props.depth)
			const expand = ref(false)

			const projectStore = useProjectStore()

			watch(
				() => props.subGroup,
				(newValue) => {
					subGroupData.value = newValue
				}
			)

			const computedPadding = computed(() => {
				// Set a base padding value
				const basePadding = 4
				// Increase padding for each level of recursion
				return basePadding * depth.value
			})

			const expandGroup = () => {
				expand.value = !expand.value
			}

			const selectSubGroup = (subGroup: NestedGroup) => {
				projectStore.setSelectedGroup(subGroup)
			}

			return {
				subGroupData,
				expand,
				computedPadding,
				expandGroup,
				selectSubGroup
			}
		}
	})
</script>
