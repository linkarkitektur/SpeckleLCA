<template>
	<div>
		<h2 class="styled-header">General User Settings</h2>
		<p class="mt-1 styled-text">General settings for the project.</p>

		<dl class="settings-list">
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Show popups</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<CheckBox
						id="showPopups"
						name="showPopups"
						:checked="true"
						@update:checked="console.log('Add this here later')"
					/>
				</dd>
			</div>
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Standard result values</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="standardValues"
						name="standardValues"
						v-model="generalSettings.area"
						placeholder="kg co2e"
					/>
				</dd>
			</div>
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Area</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="area"
						name="area"
						v-model="generalSettings.area"
						placeholder="Area value"
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
	import CheckBox from '@/components/Base/CheckBox.vue'

	const settingsStore = useSettingsStore()

	const generalSettings = ref({
		area: settingsStore.projectSettings.area
	})
</script>
