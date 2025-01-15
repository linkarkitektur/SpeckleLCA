<template>
  <div>
     <h2 class="text-base/7 font-semibold text-gray-900">Material Keys</h2>
     <p class="mt-1 text-sm/6 text-gray-500">Material API keys, saved in local storage.</p>

     <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
      <div class="pt-6 sm:flex">
         <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Revalu key</dt>
         <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
           <input
             type="text"
             v-model="materialKeys.revalu"
             placeholder="Revalu key"
             class="w-full border p-2 rounded-md"
           />
           <UpdateButton @click="updateMaterialKeys" />
         </dd>
       </div>
       <div class="pt-6 sm:flex">
         <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">ECOPortal key</dt>
         <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
           <input
             type="text"
             v-model="materialKeys.ecoPortal"
             placeholder="Ecoportal key"
             class="w-full border p-2 rounded-md"
           />
           <UpdateButton @click="updateMaterialKeys" />
         </dd>
       </div>
      
     </dl>
   </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import UpdateButton from '@/components/Misc/Settings/UpdateButton.vue'

export default defineComponent({
 name: 'SettingsMaterialKeys',
 components: {
   UpdateButton
 },
 setup() {
   const settingsStore = useSettingsStore()

   const materialKeys = ref(settingsStore.keySettings.materialKeys)

   const updateMaterialKeys = () => {
    settingsStore.updateMaterialKeys(materialKeys.value)
   }
   
   return { 
    materialKeys,
    updateMaterialKeys
   }
 },
})
</script>