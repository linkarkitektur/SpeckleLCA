<template>
	<div class="space-y-12">
		<h2 class="styled-header">Save to firebase</h2>
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
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { useProjectStore } from '@/stores/projectStore'
	import { useNavigationStore } from '@/stores/navigationStore'
	import { useMaterialStore } from '@/stores/materialStore'
	import { useFirebaseStore } from '@/stores/firebaseStore'
	import type { Mapping } from '@/models/materialModel'
	import InputText from '@/components/Base/InputText.vue'
	import ActionButton from '@/components/Base/ActionButton.vue'
	import { reduceMapping } from '@/utils/materialUtils'

	const navStore = useNavigationStore()
	const projectStore = useProjectStore()
	const materialStore = useMaterialStore()
	const firebaseStore = useFirebaseStore()

	const formData = ref({
		name: ''
	})

	const saveData = () => {
		const mapping: Mapping = materialStore.getCurrentMapping()
		const reducedMapping = reduceMapping(mapping)
		firebaseStore.addMapping(
			projectStore.currProject.id,
			reducedMapping,
			formData.value.name
		)
		navStore.toggleSlideover()
	}
</script>
