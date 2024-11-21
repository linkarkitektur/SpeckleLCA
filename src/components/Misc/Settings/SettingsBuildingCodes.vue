<template>
  <div>
    <h2 class="text-base/7 font-semibold text-gray-900">Buildingpart Codes</h2>
    <p class="mt-1 text-sm/6 text-gray-500">Set building codes to include, this will be used to segment results on building codes. Mostly used for certifications.</p>

    <div class="flex flex-col">
      <div class="flex flex-col items-end">
        <UpdateButton @click="updateBuildingCodes" />
      </div>
      <div class="flex flex-col items-start">
        <Dropdown
          :items="buildingCodeDropdown"
          name="calculationSettings"
          :dropdownName="buildingCode.key"
          @selectedItem="handleSelectedItem"
        />
      </div>
    </div>
    <div class="grid grid-cols-4 gap-4 p-4 mt-6 divide-x divide-gray-100 border-t border-gray-200">
      <div 
        v-for="(group, index) in groupedBuildingCodes" 
        :key="index" 
        class="flex flex-col items-start pl-2"
      >
        <!-- Top-level Checkbox -->
        <label class="flex items-center space-x-2 mb-2">
          <input 
            type="checkbox" 
            class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" 
            v-model="group.selected" 
            @change="toggleGroup(group)" 
          />
          <span class="font-bold text-lg">
            {{ group.name }}
          </span>
        </label>
        <!-- Subcategory Checkboxes -->
        <div class="ml-2">
          <label
            v-for="(child, childIndex) in group.children"
            :key="childIndex"
            class="flex items-start space-x-2"
          >
            <input 
              type="checkbox" 
              class="h-4 w-4 pt-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              v-model="child.selected" 
              @change="checkGroupSelection(group)" 
            />
            <span>{{ child.name }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'

import type { BuildingCodeItem } from '@/models/buildingCode'
import type { dropdownItem } from '@/components/Misc/DropdownMenuItem.vue'
import { buildingCodes } from '@/models/buildingCode'

import Dropdown from '@/components/Misc/Dropdown.vue'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'SettingsBuildingCodes',
  components: {
    Dropdown,
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

    const { calculationSettings } = storeToRefs(settingsStore)

    const groupedBuildingCodes = ref<BuildingCodeItem[]>([])
    const buildingCodeName = ref('')
    const buildingCode = ref(calculationSettings.value.buildingCode)

    const buildingCodeDropdown: dropdownItem[] = Object.keys(buildingCodes).map((key) => {
      return {
        name: key,
        data: JSON.stringify(buildingCodes[key]),
      }
    })

    // Translate the included stages from the settings store to the groupedBuildingCodes
    const initializeGroupedBuildingCodes = () => {
      groupedBuildingCodes.value = JSON.parse(JSON.stringify(buildingCode.value.data))
    }

    watch(
      () => calculationSettings,
      () => {
        initializeGroupedBuildingCodes()
      },
      { immediate: true, deep: true }
    )

    const updateBuildingCodes = () => {
      // Update the calculation settings in the store
      settingsStore.updateBuildingCode({
        key: buildingCodeName.value,
        data: groupedBuildingCodes.value
      })
    }

    // Check if all children are selected and update the checkboxes accordingly
    const checkGroupSelection = (group: BuildingCodeItem) => {
      group.selected = group.children?.every((child) => child.selected) || false
    }

    // Toggle the selection of all subcategory checkboxes within a group
    const toggleGroup = (group: BuildingCodeItem) => {
      group.children?.forEach((child) => {
        child.selected = group.selected
      })
    }

    const handleSelectedItem = (selectedItem: dropdownItem) => {
    const data = JSON.parse(selectedItem.data) as BuildingCodeItem[]
    
    settingsStore.updateBuildingCode({
      key: selectedItem.name,
      data: data
    })
  }

    return { 
      groupedBuildingCodes,
      buildingCode,
      buildingCodeDropdown,
      checkGroupSelection,
      toggleGroup,
      updateBuildingCodes,
      handleSelectedItem
    }
  },
})
</script>