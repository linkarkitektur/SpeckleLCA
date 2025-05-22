<template>
	<div class="space-y-12">
		<h2 class="styled-header" v-if="!props.modify">Save Mapping</h2>
		<h2 class="styled-header" v-if="props.modify">Edit Mapping</h2>
		<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
			<div class="sm:col-span-4">
				<label for="name" class="block styled-text normal-case"> Name </label>
				<div class="mt-2">
					<div class="flex">
						<InputText
							id="name"
							v-model="formData.name"
							placeholder="Mapping name"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="mt-6 flex items-center justify-start gap-x-6">
		<ActionButton text="Save" @on-click="saveData" />
		<ActionButton text="Delete" v-if="props.modify" @on-click="deleteData" />
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { useProjectStore } from '@/stores/projectStore'
	import { useNavigationStore } from '@/stores/navigationStore'
	import { useMaterialStore } from '@/stores/materialStore'
	import { useFirebaseStore } from '@/stores/firebaseStore'
	import InputText from '@/components/Base/InputText.vue'
	import ActionButton from '@/components/Base/ActionButton.vue'
	import { reduceMapping } from '@/utils/materialUtils'

	const navStore = useNavigationStore()
	const projectStore = useProjectStore()
	const materialStore = useMaterialStore()
	const firebaseStore = useFirebaseStore()

	const props = defineProps({
		modify: { type: Boolean, default: false }
	})

	const formData = ref({
		name: props.modify ? materialStore.getCurrentMapping().name : ''
	})

	const saveData = () => {
		let mapping = materialStore.getCurrentMapping().mapping
		if (!mapping) {
			mapping = {
				name: '',
				id: crypto.randomUUID(),
				filters: [],
				steps: []
			}
		}
		const reducedMapping = reduceMapping(mapping)
		firebaseStore.addMapping(
			projectStore.currProject.id,
			reducedMapping,
			formData.value.name
		)
		navStore.closeSlideover()
		navStore.refreshDropdown()
	}

	const deleteData = () => {
		firebaseStore.deleteMapping(
			projectStore.currProject.id,
			materialStore.getCurrentMapping().name
		)
		navStore.closeSlideover()
		navStore.refreshDropdown()
	}
</script>
