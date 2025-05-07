<template>
	<div
		ref="assemblyViewerRef"
		class="assembly-viewer flex flex-col w-full h-full justify-center items-center"
	>
		<!-- Top Drop Zone -->

		<Draggable
			:list="[]"
			group="materials"
			item-key="id"
			class="add-bar relative w-11/12 flex items-center justify-center h-10 pr-60 pl-60 mb-2 styled-element hoverable-sm"
			:class="isDragging ? 'border-green-600' : ''"
			@change="onDropAtStart"
			:options="{ dropzoneMode: 'single' }"
			tag="div"
		>
			<template #header>
				<div
					class="absolute inset-0 pattern-bg-transparent pattern-diagonal-lines pattern-black pattern-opacity-10 pattern-size-2"
					:class="
						isDragging
							? 'pattern-green-800 pattern-opacity-60 animate-pulse'
							: ''
					"
				/>
				<PlusCircleIcon
					class="-mr-1 h-5 w-5 text-black opacity-100"
					aria-hidden="true"
				/>
			</template>
			<template #item>
				<div>
					<!-- Empty template -->
				</div>
			</template>
		</Draggable>

		<!-- Draggable Material Bars -->
		<Draggable
			v-if="localMaterials"
			v-model="localMaterials"
			group="placedMaterials"
			item-key="metaData.appId"
			ghost-class="ghost"
			:animation="200"
			tag="div"
			class="flex flex-col justify-center w-full"
		>
			<template #item="{ element, index }">
				<div>
					<MaterialBar
						:key="element.metaData.appId"
						class="hover:cursor-move"
						:product="element"
						@update:thickness="updateMaterialThickness"
						@update:percent="updateMaterialPercent"
						@update:color="updateMaterialColor"
						@delete="deleteMaterial(index)"
					/>
				</div>
			</template>
		</Draggable>

		<!-- Bottom Drop Zone -->
		<Draggable
			:list="[]"
			group="materials"
			item-key="id"
			class="add-bar relative w-11/12 flex items-center justify-center h-10 mt-2 styled-element hoverable"
			:class="isDragging ? 'border-green-600' : 'border-gray-400'"
			@change="onDropAtEnd"
			:options="{ dropzoneMode: 'single' }"
			tag="div"
		>
			<template #header>
				<div
					class="absolute inset-0 pattern-bg-transparent pattern-diagonal-lines pattern-black pattern-opacity-10 pattern-size-2"
					:class="
						isDragging
							? 'pattern-green-800 pattern-opacity-60 animate-pulse'
							: ''
					"
				/>
				<PlusCircleIcon class="-mr-1 h-5 w-5 text-black" aria-hidden="true" />
			</template>
			<template #item>
				<div>
					<!-- Empty template -->
				</div>
			</template>
		</Draggable>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch, computed } from 'vue'
	import Draggable from 'vuedraggable'
	import { PlusCircleIcon } from '@heroicons/vue/20/solid'
	import MaterialBar from '@/components/Mapping/MaterialBar.vue'
	import { useMaterialStore } from '@/stores/materialStore'
	import type { Product } from '@/models/materialModel'

	// Props & Emits
	interface Props {
		materials: Product[]
	}

	const props = defineProps<Props>()
	const emit = defineEmits<{
		'update:materials': [Product[]]
	}>()

	// State
	const assemblyViewerRef = ref<HTMLElement | null>(null)
	const nextId = ref(100)
	const localMaterials = ref<Product[]>([...props.materials])
	const materialStore = useMaterialStore()

	// Computed
	const isDragging = computed(() =>
		materialStore.currentMapping ? true : false
	)

	// Methods
	const normalizeHeight = () => {
		if (assemblyViewerRef.value) {
			const containerHeight = assemblyViewerRef.value.clientHeight
			const halfContainerHeight = containerHeight / 2
			const totalHeight = localMaterials.value.reduce(
				(sum, material) =>
					// @ts-expect-error issues with anyvalue
					sum + parseInt(material.metaData.thickness) > 75
						// @ts-expect-error issues with anyvalue
						? parseInt(material.metaData.thickness)
						: 75,
				0
			)
			if (totalHeight > halfContainerHeight) {
				const scale = halfContainerHeight / totalHeight
				localMaterials.value.forEach((material) => {
					// @ts-expect-error issues with anyvalue
					material.metaData.height = Math.round(
						// @ts-expect-error issues with anyvalue
						parseInt(material.metaData.thickness) * scale
					).toString()
				})
			} else {
				localMaterials.value.forEach((material) => {
					material.metaData.height = material.metaData.thickness
				})
			}
		}
	}

	const onDropAtStart = (event: any) => {
		const newItem = JSON.parse(JSON.stringify(event.added.element))
		newItem.metaData.appId = nextId.value++
		newItem.metaData.thickness = '50'
		newItem.metaData.height = newItem.metaData.thickness
		newItem.metaData.color = newItem.metaData.color || '#718096'
		localMaterials.value.unshift(newItem)
		normalizeHeight()
		emit('update:materials', localMaterials.value)
		materialStore.setCurrentMapping(null)
	}

	const onDropAtEnd = (event: any) => {
		const newItem = JSON.parse(JSON.stringify(event.added.element))
		newItem.metaData.appId = nextId.value++
		newItem.metaData.thickness = '50'
		newItem.metaData.height = newItem.metaData.thickness
		newItem.metaData.color = '#718096'
		localMaterials.value.push(newItem)
		normalizeHeight()
		emit('update:materials', localMaterials.value)
		materialStore.setCurrentMapping(null)
	}

	const updateMaterialThickness = ({
		appId,
		thickness
	}: {
		appId: string
		thickness: number
	}) => {
		const material = localMaterials.value.find(
			// @ts-expect-error issues with anyvalue
			(m) => m.metaData.appId === appId
		)
		if (material) {
			// @ts-expect-error issues with anyvalue
			material.metaData.thickness = thickness.toString()
			normalizeHeight()
			emit('update:materials', localMaterials.value)
		}
	}

	const updateMaterialPercent = ({
		appId,
		percent
	}: {
		appId: string
		percent: number
	}) => {
		const material = localMaterials.value.find(
			// @ts-expect-error issues with anyvalue
			(material) => material.metaData.appId === appId
		)
		if (material) {
			material.materialFraction = percent
			emit('update:materials', localMaterials.value)
		}
	}

	const updateMaterialColor = ({
		appId,
		color
	}: {
		appId: string
		color: string
	}) => {
		const material = localMaterials.value.find(
			// @ts-expect-error issues with anyvalue
			(m) => m.metaData.appId === appId
		)
		if (material) {
			// @ts-expect-error issues with anyvalue
			material.metaData.color = color
			emit('update:materials', localMaterials.value)
		}
	}

	const deleteMaterial = (index: number) => {
		localMaterials.value.splice(index, 1)
		normalizeHeight()
		emit('update:materials', localMaterials.value)
	}

	// Watchers
	watch(
		() => props.materials,
		(newMaterials) => {
			localMaterials.value = [...newMaterials]
		}
	)
</script>
