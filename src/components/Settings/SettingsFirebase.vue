<template>
	<div>
		<h2 class="styled-header">Firebase</h2>
		<p class="mt-1 styled-text">
			This is cached in your local storage, but always have caution in what you
			share.
		</p>

		<dl class="settings-list">
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Firebase Key</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="apiKey"
						name="apiKey"
						v-model="firebaseSettings.apiKey"
						placeholder="Firebase Key"
					/>
				</dd>
			</div>
			<div class="pt-6 flex">
				<dt class="w-64 pr-6">App id</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="appId"
						name="appId"
						v-model="firebaseSettings.appId"
						placeholder="App Id"
					/>
				</dd>
			</div>
			<div class="pt-6 flex">
				<dt class="w-64 pr-6">Authentication domain</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="authDomain"
						name="authDomain"
						v-model="firebaseSettings.authDomain"
						placeholder="Auth Domain"
					/>
				</dd>
			</div>
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Measurement id</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="measureId"
						name="measureId"
						v-model="firebaseSettings.measurementId"
						placeholder="Measurement Id"
					/>
				</dd>
			</div>
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Sender id</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="senderId"
						name="senderId"
						v-model="firebaseSettings.messagingSenderId"
						placeholder="Sender Id"
					/>
				</dd>
			</div>
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">Project id</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="ProjectId"
						v-model="firebaseSettings.projectId"
						placeholder="Project Id"
					/>
				</dd>
			</div>
			<div class="pt-6 sm:flex">
				<dt class="w-64 pr-6">StorageBucket id</dt>
				<dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
					<InputText
						id="StorageId"
						v-model="firebaseSettings.storageBucket"
						placeholder="BucketId"
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

	const firebaseSettings = ref(settingsStore.keySettings.firebaseConfig)
</script>
