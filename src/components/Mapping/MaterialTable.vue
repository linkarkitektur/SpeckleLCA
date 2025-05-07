<template>
	<BaseTable :data="data" @dragStart="handleDragStart" @dragEnd="handleDragEnd">
		<template #header-columns>
			<th class="m-3 w-1/10"><!-- Type ICON --></th>
			<th class="m-3 w-2/6">Name</th>
			<th class="m-3 w-2/6">Material type</th>
			<th class="m-3 w-1/6">Unit</th>
			<!-- For Danish projects where we want to replace b4 -->
			<th v-if="showLifespanColumn" class="m-3 w-1/6">Lifespan</th>
			<th class="m-3 w-1/6">Emission</th>
		</template>

		<template #row-columns="{ element, emissions }">
			<td class="m-2 w-1/10">
				<component
					:is="isAssembly(element) ? 'Square3Stack3DIcon' : 'StopIcon'"
					:class="[
						'h-5 w-5',
						!isAssembly(element)
							? 'transform rotate-45 text-green-800'
							: 'text-orange-600'
					]"
					:title="isAssembly(element) ? 'Assembly' : 'Product'"
				/>
			</td>
			<td class="m-2 w-2/6 line-clamp-3 text-sm">{{ element.name }}</td>
			<td v-if="element.metaData.materialType" class="m-2 w-2/6">
				{{ element.metaData.materialType }}
			</td>
			<td v-else class="m-2 w-2/6">Other</td>
			<td class="m-2 w-1/6">{{ element.unit }}</td>

			<!-- For Danish projects where we want to replace b4 -->
			<td v-if="showLifespanColumn" class="m-2 w-1/6 flex items-center">
				<InputText
					:id="`lifespan-${element.id}`"
					type="number"
					:modelValue="element.lifespan?.toString() || ''"
					class="w-16 text-sm"
					placeholder="Years"
					@update:modelValue="(value) => updateLifespan(element, value)"
				/>
			</td>
			<td
				:class="{
					'text-red-600': emissions.isPositive,
					'text-green-600': !emissions.isPositive
				}"
				class="m-2 w-1/6"
			>
				{{ emissions.value }}
				<br />
				kg/CO<sub>2</sub>
			</td>
		</template>
	</BaseTable>
</template>

<script setup lang="ts">
	import { isAssembly } from '@/utils/EPDUtils'
	import { useMaterialStore } from '@/stores/materialStore'
	import { useSettingsStore } from '@/stores/settingStore'
	import { computed } from 'vue'
	import { storeToRefs } from 'pinia'
	import InputText from '@/components/Base/InputText.vue'
	import BaseTable from '@/components/Mapping/BaseTable.vue'
	import type { Product, Assembly } from '@/models/materialModel'

	defineProps<{
		data: (Product | Assembly)[]
	}>()

	const materialStore = useMaterialStore()
	const settingsStore = useSettingsStore()
	const { calculationSettings } = storeToRefs(settingsStore)

	const showLifespanColumn = computed(
		() => calculationSettings.value.replaceB4WithProductionStages ?? true
	)

	function handleDragStart(material: Product) {
		materialStore.setCurrentMapping(material)
	}

	function handleDragEnd() {
		materialStore.setCurrentMapping(null)
	}

	function updateLifespan(
		material: Product | Assembly,
		value: string | number
	) {
		if (!isAssembly(material)) {
			// Handle both string and number inputs
			material.lifespan =
				typeof value === 'string'
					? value
						? parseInt(value)
						: undefined
					: value
		}
	}
</script>
