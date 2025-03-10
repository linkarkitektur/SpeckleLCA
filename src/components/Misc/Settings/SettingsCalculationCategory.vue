<template>
  <div>
    <h2 class="styled-header">Saved calculation settings</h2>
    <p class="mt-1 styled-text">Saved settings for a certain certification, changes settings below.</p>

    <dl class="settings-list">
      <div class="pt-6 sm:flex">
        <dt class="mr-6">Saved settings/certification</dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <Dropdown
            :items="savedSettings"
            name="calculationSettings"
            :dropdownName="currentSetting.name"
            @selectedItem="handleSelectedItem"
          />
          <p>Name</p>
          <InputText 
            id="saveName"
            v-model="currentSetting.name" 
            placeholder="saved settings"
          />
          <ActionButton
            text="Save"
            @onClick="saveSettings"
          />
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useSettingsStore } from '@/stores/settings'
import { useProjectStore } from '@/stores/main'
import { useFirebaseStore } from '@/stores/firebase'

import type { CalculationSettings } from '@/models/settings'
import type { CalculationSettingsLog } from '@/models/firebase'
import type { dropdownItem } from '@/components/Misc/Dropdown.vue'

import Dropdown from '@/components/Misc/Dropdown.vue'
import ActionButton from '@/components/Base/ActionButton.vue'
import InputText from '@/components/Base/InputText.vue'

const settingsStore = useSettingsStore()
const projectStore = useProjectStore()
const firebaseStore = useFirebaseStore()

// Use storeToRefs to maintain reactivity
const { calculationSettings } = storeToRefs(settingsStore)

// Make these refs from the reactive store
const impactCategory = computed(() => calculationSettings.value.standardImpactCategory)
const includedStages = computed(() => calculationSettings.value.includedStages)
const buildingCode = computed(() => calculationSettings.value.buildingCode)

const savedSettings: dropdownItem[] = []
let projectId = projectStore.currProject?.id || "generic"

const currentSetting = reactive<CalculationSettingsLog>({
  name: 'Pick your settings',
  projectId: projectId,
  date: new Date(),
  settings: {
    standardImpactCategory: impactCategory.value,
    includedStages: includedStages.value,
    buildingCode: buildingCode.value
  }
})

const handleSelectedItem = async (selectedItem: dropdownItem) => {
  const data = JSON.parse(selectedItem.data) as CalculationSettings
  
  currentSetting.name = selectedItem.name
  
  // Update store in sequence
  await settingsStore.updateStandardImpactCategory(data.standardImpactCategory)
  await settingsStore.updateIncludedStages(data.includedStages)
  await settingsStore.updateBuildingCode(data.buildingCode)
  
  // Update current settings
  currentSetting.settings = {
    standardImpactCategory: data.standardImpactCategory,
    includedStages: data.includedStages,
    buildingCode: data.buildingCode
  }
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
  
  currentSetting.settings = settings
  firebaseStore.addCalculationSettings(currentSetting.projectId, settings, currentSetting.name)
}

</script>