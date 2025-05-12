<template>
	<div>
		<h2 class="styled-header">Material Keys</h2>
		<p class="mt-1 styled-text">Material API keys, saved in local storage.</p>

		<dl class="settings-list">
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Revalu key</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="revaluKey"
						name="revaluKey"
						v-model="materialKeys.revalu"
						placeholder="Revalu key"
					/>
				</dd>
			</div>
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">ECOPortal key</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="ecoPortalKey"
						name="ecoPortalKey"
						v-model="materialKeys.ecoPortal"
						placeholder="Ecoportal key"
					/>
				</dd>
			</div>
		</dl>
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { useSettingsStore } from '@/stores/settingStore'
	import InputText from '@/components/Base/InputText.vue'

	const settingsStore = useSettingsStore()

	const materialKeys = ref(settingsStore.keySettings.materialKeys)
</script>
