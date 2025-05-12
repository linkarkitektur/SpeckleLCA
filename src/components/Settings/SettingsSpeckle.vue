<template>
	<div>
		<h2 class="styled-header">Speckle</h2>
		<p class="mt-1 styled-text">
			Add secret and app id from Speckle approved apps
		</p>

		<dl class="settings-list">
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Speckle Server</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="serverUrl"
						name="serverUrl"
						v-model="speckleSettings.serverUrl"
						placeholder="Speckle Server"
					/>
				</dd>
			</div>
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Speckle Id</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="speckleId"
						name="speckleId"
						v-model="speckleSettings.id"
						placeholder="Speckle id"
					/>
				</dd>
			</div>
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Speckle Secret</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="speckleSecret"
						name="speckleSecret"
						v-model="speckleSettings.secret"
						placeholder="Speckle secret"
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

	const speckleSettings = ref(settingsStore.keySettings.speckleConfig)
</script>
