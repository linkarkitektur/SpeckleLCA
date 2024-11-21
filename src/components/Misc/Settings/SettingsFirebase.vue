<template>
   <div>
      <h2 class="text-base/7 font-semibold text-gray-900">Firebase</h2>
      <p class="mt-1 text-sm/6 text-gray-500">This is cached in your local storage, but always have caution in what you share.</p>

      <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Firebase Key</dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input
              type="text"
              v-model="firebaseSettings.apiKey"
              placeholder="Firebase Key"
              class="w-full border p-2 rounded-md"
            />
            <UpdateButton @click="updateFirebaseSettings" />
          </dd>
        </div>
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">App id</dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input
              type="text"
              v-model="firebaseSettings.appId"
              placeholder="Firebase Key"
              class="w-full border p-2 rounded-md"
            />
            <UpdateButton @click="updateFirebaseSettings" />
          </dd>
        </div>
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Authentication domain</dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input
              type="text"
              v-model="firebaseSettings.authDomain"
              placeholder="Firebase Key"
              class="w-full border p-2 rounded-md"
            />
            <UpdateButton @click="updateFirebaseSettings" />
          </dd>
        </div>
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Measurement id</dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input
              type="text"
              v-model="firebaseSettings.measurementId"
              placeholder="Firebase Key"
              class="w-full border p-2 rounded-md"
            />
            <UpdateButton @click="updateFirebaseSettings" />
          </dd>
        </div>
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Sender id</dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input
              type="text"
              v-model="firebaseSettings.messagingSenderId"
              placeholder="Firebase Key"
              class="w-full border p-2 rounded-md"
            />
            <UpdateButton @click="updateFirebaseSettings" />
          </dd>
        </div>
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Project id</dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input
              type="text"
              v-model="firebaseSettings.projectId"
              placeholder="Firebase Key"
              class="w-full border p-2 rounded-md"
            />
            <UpdateButton @click="updateFirebaseSettings" />
          </dd>
        </div>
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">StorageBucket id</dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input
              type="text"
              v-model="firebaseSettings.storageBucket"
              placeholder="Firebase Key"
              class="w-full border p-2 rounded-md"
            />
            <UpdateButton @click="updateFirebaseSettings" />
          </dd>
        </div>
      </dl>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export default defineComponent({
  name: 'SettingsFirebase',
  components: {
    // Local update button
    UpdateButton: defineComponent({
      name: 'UpdateButton',
      props: {
        label: {
          type: String,
          default: 'Update',
        },
      },
      setup(props, { emit }) {
        const handleClick = () => {
          emit('click')
        }

        return { handleClick }
      },
      template: `
        <button 
          type="button" 
          class="font-semibold text-green-600 hover:text-green-500"
          @click="handleClick"
        >
          {{ label }}
        </button>
      `,
    }),
  },
  setup() {
    const settingsStore = useSettingsStore()

    const firebaseSettings = ref(settingsStore.keySettings.firebaseConfig)

    const updateFirebaseSettings = () => {
      settingsStore.updateFirebaseSettings(firebaseSettings.value)
    }
    
    return { 
      firebaseSettings,
      updateFirebaseSettings
    }
  },
})
</script>