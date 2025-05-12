<template>
	<table class="max-w-full block table-fixed">
		<thead class="w-full block">
			<tr
				class="w-full flex text-left text-xs leading-4 font-medium uppercase tracking-wider whitespace-nowrap styled-element styled-data"
			>
				<slot name="header-columns"></slot>
			</tr>
		</thead>
		<Draggable
			v-if="items"
			:list="items"
			:options="dragOptions"
			class="bg-neutral-100 divide-y divide-black max-w-full block table-fixed hover:cursor-move"
			tag="tbody"
			item-key="id"
			:group="{ name: 'materials', pull: 'clone', put: false }"
			:sort="false"
			:clone="cloneItem"
		>
			<template #item="{ element, index }">
				<tr
					class="whitespace-no-wrap w-full flex hover:bg-neutral-200 styled-data text-sm"
					:data-item="JSON.stringify(element)"
					@dragstart="onDragStart($event, element)"
					@dragend="onDragEnd"
					@dblclick="onDoubleClick(element)"
				>
					<slot
						name="row-columns"
						:element="element"
						:index="index"
						:emissions="roundedEmissions[index]"
					></slot>
				</tr>
			</template>
		</Draggable>
	</table>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue'
	import Draggable from 'vuedraggable'
	import type { Product, Assembly } from '@/models/materialModel'

	// Props
	interface Props {
		data: (Product | Assembly)[]
	}

	const props = defineProps<Props>()
	const emit = defineEmits<{
		dragStart: [item: Product | Assembly]
		dragEnd: []
		doubleClick: [item: Product | Assembly]
	}>()

	// Reactive state
	const items = computed(() => props.data)

	const dragOptions = ref({
		animation: 200,
		group: 'materials',
		disabled: false,
		ghostClass: 'ghost',
		handle: '.handle',
		sort: false
	})

	// Computed
	const roundedEmissions = computed(() => {
		if (!items.value) return []

		return items.value.map((item: Product | Assembly) => {
			const value = item.emission?.gwp?.a1a3 ?? 0
			const roundedValue = parseFloat((Number(value) || 0).toFixed(2))

			return {
				value: roundedValue,
				isPositive: roundedValue > 0
			}
		})
	})

	// Methods
	const cloneItem = (item: Product | Assembly) => ({ ...item })

	const onDragStart = (event: DragEvent, item: Product | Assembly) => {
		emit('dragStart', item)
	}

	const onDragEnd = () => {
		emit('dragEnd')
	}

	const onDoubleClick = (item: Product | Assembly) => {
		emit('doubleClick', item)
	}
</script>
