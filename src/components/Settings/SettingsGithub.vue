<template>
  <div>
    <h2 class="styled-header">Github Token</h2>
    <p class="mt-1 styled-text">Github API token, used to read the latest commit message at the header.</p>

    <dl class="settings-list">
      <div class="pt-6 sm:flex">
        <dt class="w-64 pr-6">Github Token</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <InputText
            id="githubToken"
            name="githubToken"
            v-model="githubKey"
            placeholder="Github token"
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

const githubKey = ref(settingsStore.keySettings.githubApiKey)
</script>