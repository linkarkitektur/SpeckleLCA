<template>
	<div :class="['group-card-wrapper', $attrs.class]">
		<div
			tabindex="1"
			id="groupCard"
			class="relative isolate z-20 styled-element hoverable pressable w-3/4 dropArea bg-neutral-100"
			:class="{
				'outline-2 outline-offset-2 outline-black translate-x-2 translate-y-2 shadow-none':
					selectedBool
			}"
			:group="{ name: 'refTree', pull: 'clone', put: false }"
			:clone="cloneItem"
			draggable="true"
			@dragstart="onDragStart($event, inGroups)"
			@dragend="onDragEnd($event)"
			@click="toggleExpand"
			@dblclick.stop="toggleEdit(inGroups)"
			@drop="onDrop"
			@dragover.prevent
		>
			<section
				class="relative flex items-center justify-between w-full min-h-12 text-black cursor-pointer"
			>
				<!-- Group Name -->
				<div class="absolute w-full items-center top-2 left-0 rounded-br-lg">
					<div class="flex justify-center leading-none font-semibold">
						{{ inGroups.name }}
					</div>
				</div>
				<!-- Left Side Info -->
				<div
					class="flex flex-col items-start h-full pl-2 pt-6 pb-3 styled-data"
				>
					<div
						class="text-sm leading-none pt-1 truncate max-w-40"
						:title="leftInfo"
					>
						{{ leftInfo }}
					</div>
				</div>
				<!-- Right Side Info -->
				<div class="flex flex-col items-end h-full pr-2 pt-6 pb-3 styled-data">
					<div
						class="text-sm leading-none pt-1 truncate max-w-40"
						:title="rightInfo"
					>
						{{ rightInfo }}
					</div>
				</div>
			</section>

			<!-- Lower Section -->
			<section class="w-full">
				<div class="rounded-lg overflow-hidden">
					<div
						class="relative flex items-center justify-center min-w-full h-10 border-t-2 border-black bg-neutral-100 z-10"
					>
						<!-- Component determined by currGroupTotal -->
						<component
							:is="currGroupTotal"
							:groups="inGroups"
							v-if="currGroupTotal"
							class="font-light text-sm"
						/>
						<slot name="dynamic-content" />
					</div>
				</div>
			</section>

			<!-- Triangle indicators -->
			<div
				v-if="inGroups.children.length"
				class="absolute right-[-15px] bottom-[-15px] origin-center z-40"
				:class="{ 'rotate-180': isExpanded }"
			>
				<BaseChevron :inner-color="inGroups.color" />
			</div>
		</div>

		<!-- Subgroups -->
		<transition
			name="expand"
			enter-active-class="transition-all duration-300 ease-out"
			leave-active-class="transition-all duration-300 ease-in"
			enter-from-class="transform -translate-y-4 opacity-0"
			enter-to-class="transform translate-y-0 opacity-100"
			leave-from-class="transform translate-y-0 opacity-100"
			leave-to-class="transform -translate-y-4 opacity-0"
		>
			<div
				v-if="isExpanded"
				class="w-full relative z-10 scale-x-95 origin-top-right"
			>
				<GroupCard
					v-for="(children, index) in inGroups.children"
					class="pt-6"
					:key="index"
					:groups="children"
				/>
			</div>
		</transition>
		<!-- TODO: Add removed functionality to edit and remove groups! -->
	</div>
</template>

<script setup lang="ts">
	import { onMounted, onUnmounted, ref, computed } from 'vue'

	import OverviewGroupCard from '@/components/Sidebar/FilteringGroupCard.vue'
	import MaterialGroupCard from '@/components/Sidebar/MaterialGroupCard.vue'
	import ResultsGroupCard from '@/components/Sidebar/ResultsGroupCard.vue'

	import BaseChevron from '@/components/Base/BaseChevron.vue'

	import type { NestedGroup } from '@/models/filterModel'

	import { getMappedMaterial, mapMaterial } from '@/utils/materialUtils'

	import { useProjectStore } from '@/stores/projectStore'
	import { storeToRefs } from 'pinia'
	import { lightenHSLColor } from '@/utils/colorUtils'
	import { roundNumber } from '@/utils/mathUtils'
	import { useRoute } from 'vue-router'

	// Add defineOptions to inherit attrs
	defineOptions({
		inheritAttrs: true
	})

	// Props
	interface Props {
		groups: NestedGroup
	}

	const props = defineProps<Props>()

	const emit = defineEmits<{
		dragStart: [item: NestedGroup]
		dragEnd: []
		doubleClick: [item: NestedGroup]
	}>()

	// Store initialization
	const projectStore = useProjectStore()

	// Reactive refs
	const isExpanded = ref(false)
	const toggleExpand = () => {
		isExpanded.value = !isExpanded.value
		projectStore.setSelectedObjects(inGroups.value.objects)
	}

	// Store refs
	const { selectedGroup } = storeToRefs(projectStore)
	const route = useRoute()

	// Computed properties
	const inGroups = computed(() => ({
		...props.groups,
		children: props.groups.children.map((child) => ({
			...child,
			color: lightenHSLColor(props.groups.color, 0.2)
		}))
	}))

	const selectedBool = computed(() => {
		if (selectedGroup.value) {
			return inGroups.value.id === selectedGroup.value.id
		}
		return false
	})

	// Methods
	const cloneItem = (item: NestedGroup) => ({ ...item })

	const onDragStart = (event: DragEvent, item: NestedGroup) => {
		emit('dragStart', item)
		event.dataTransfer?.setData('application/json', JSON.stringify(item))
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const onDragEnd = (event: DragEvent) => {
		emit('dragEnd')
	}

	const currGroupTotal = computed(() => {
		switch (route.name) {
			case 'Filtering':
				return OverviewGroupCard
			case 'Mapping':
				return MaterialGroupCard
			case 'Results':
				return ResultsGroupCard
			case 'Benchmark':
				return null
			default:
				return null
		}
	})

	const leftInfo = computed(() => {
		switch (route.name) {
			case 'Filtering':
				return inGroups.value.objects.length + ' Elements'
			case 'Mapping':
				return 'Material'
			case 'Results':
				return 'Area'
			case 'Benchmark':
				return null
			default:
				return 'dummy'
		}
	})

	const rightInfo = computed(() => {
		switch (route.name) {
			case 'Filtering':
				return inGroups.value.objects.length + ' Elements'
			case 'Mapping':
				return getMappedMaterial(inGroups.value.objects).name
			case 'Results':
				return totalArea.value + 'm²'
			case 'Benchmark':
				return null
			default:
				return 'dummy'
		}
	})

	// TotalArea of the objects within
	const totalArea = computed(() => {
		return roundNumber(
			inGroups.value.objects
				.map((obj) => obj.quantity.m2 || 0)
				.reduce((a, b) => a + b, 0),
			2
		).toString()
	})

	// Add drop handler
	const onDrop = async () => {
		if (inGroups.value) {
			await mapMaterial(inGroups.value)
		}
	}

	// Toggles the group slideout and sends current group
	const toggleEdit = (group: NestedGroup) => {
		console.log(group)
	}

	// OnMounted and unMounted effects
	// Event handler for Escape key so we deselect the group visually as well
	const handleEscKey = (e: KeyboardEvent) => {
		if (e.key.toLowerCase() === 'escape') {
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur()
			}
		}
	}

	onMounted(() => {
		window.addEventListener('keydown', handleEscKey)
	})

	onUnmounted(() => {
		window.removeEventListener('keydown', handleEscKey)
	})
</script>

<style scoped>
	.group-card-wrapper {
		position: relative;
		width: 100%;
	}
</style>
