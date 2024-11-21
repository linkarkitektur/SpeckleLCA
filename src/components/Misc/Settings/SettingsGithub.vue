<template>
  <div>
     <h2 class="text-base/7 font-semibold text-gray-900">Github Token</h2>
     <p class="mt-1 text-sm/6 text-gray-500">Github API token, used to read the latest commit message at the header.</p>

     <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
      <div class="pt-6 sm:flex">
         <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Github Token</dt>
         <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
           <input
             type="text"
             v-model="githubKey"
             placeholder="Github token"
             class="w-full border p-2 rounded-md"
           />
           <UpdateButton @click="updateGithub" />
         </dd>
       </div>
     </dl>
   </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export default defineComponent({
 name: 'SettingsGithub',
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

   const githubKey = ref(settingsStore.keySettings.githubApiKey)

   const updateGithub = () => {
    settingsStore.updateGithubApiKey(githubKey.value)
   }
   
   return { 
    githubKey,
    updateGithub
   }
 },
})
</script>