<template>
  <div>
    <h2 class="text-base/7 font-semibold text-gray-900">Saved calculation settings</h2>
    <p class="mt-1 text-sm/6 text-gray-500">Saved settings for a certain certification, changes settings below.</p>

    <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
      <div class="pt-6 sm:flex">
        <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Saved settings/certification</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <Dropdown
            :items="savedSettings"
            name="calculationSettings"
            :dropdownName="currentSetting.name"
            @selectedItem="handleSelectedItem"
          />
          <p class="font-medium text-gray-900">Name</p>
          <input 
            type="text" 
            v-model="currentSetting.name" 
            class="w-full border p-2 rounded-md"
          />
          <UpdateButton label="Save" @click="saveSettings" />
        </dd>
      </div>
    </dl>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'

import { useSettingsStore } from '@/stores/settings'
import { useProjectStore } from '@/stores/main'
import { useFirebaseStore } from '@/stores/firebase'

import type { CalculationSettings } from '@/models/settings'
import type { CalculationSettingsLog } from '@/models/firebase'
import type { dropdownItem } from '@/components/Misc/Dropdown.vue'

import Dropdown from '@/components/Misc/Dropdown.vue'
import UpdateButton from './UpdateButton.vue'

// TODO: Add general settings here!
export default defineComponent({
  name: 'SettingsImpactCategory',
  components: {
    Dropdown,
    UpdateButton
  },
  setup() {
  const settingsStore = useSettingsStore()
  const projectStore = useProjectStore()
  const firebaseStore = useFirebaseStore()

  const impactCategory = ref(settingsStore.calculationSettings.standardImpactCategory)
  const includedStages = ref(settingsStore.calculationSettings.includedStages)
  const buildingCode = ref(settingsStore.calculationSettings.buildingCode)

  const savedSettings: dropdownItem[] = []
  // Create dummy settings before we load
  let projectId = "generic"
  if (projectStore.currProject?.id)
    projectId = projectStore.currProject.id

  const currentSetting= reactive<CalculationSettingsLog>({
    name: 'Pick your settings',
    projectId: projectId,
    date: new Date(),
    settings: {
      standardImpactCategory: impactCategory.value,
      includedStages: includedStages.value,
      buildingCode: buildingCode.value
    }
  })

  const handleSelectedItem = (selectedItem: dropdownItem) => {
    const data = JSON.parse(selectedItem.data) as CalculationSettings
    
    currentSetting.name = selectedItem.name
    settingsStore.updateIncludedStages(data.includedStages)
    settingsStore.updateStandardImpactCategory(data.standardImpactCategory)
    settingsStore.updateBuildingCode(data.buildingCode)
  }

  const fetchDropdownItems = async () => {
    const settings: CalculationSettingsLog[] = await firebaseStore.fetchCalculationSettings(currentSetting.projectId).finally()
    
    if (settings) {
      settings.map((setting) => {
        savedSettings.push({ 
          name: setting.name, 
          data: JSON.stringify(setting.settings)
        })
      })
      
    }
  }

  fetchDropdownItems()

  const saveSettings = () => {
    const settings: CalculationSettings = {
      standardImpactCategory: impactCategory.value,
      includedStages: includedStages.value,
      buildingCode: buildingCode.value
    }

    firebaseStore.addCalculationSettings(currentSetting.projectId, settings, currentSetting.name)
  }

  return { 
    savedSettings,
    currentSetting,
    handleSelectedItem,
    saveSettings
    }
  },
})
</script>