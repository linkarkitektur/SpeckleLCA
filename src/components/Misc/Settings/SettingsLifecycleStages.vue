<template>
  <div>
     <h2 class="text-base/7 font-semibold text-gray-900">Lifecycles stages</h2>
     <p class="mt-1 text-sm/6 text-gray-500">Set stages you want to include in the results, if no data exist in the EPD it will set the value as 0.</p>

     <div class="grid grid-cols-5 gap-4 p-4 pr-0 mt-6 divide-x divide-gray-100 border-t border-gray-200">
        <div v-for="(group, index) in groupedStages" :key="index" class="flex flex-col items-start">
          <!-- Top-level Checkbox -->
          <label class="flex items-center space-x-2 mb-2 pl-2">
            <input 
              type="checkbox" 
              class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" 
              v-model="group.selected" 
              @change="toggleGroup(group)" 
            />
            <span class="font-bold text-lg">
              {{ group.label }}
            </span>
          </label>
          <!-- Subcategory Checkboxes -->
          <div class="ml-2">
            <label v-for="stage in group.stages" :key="stage" class="flex items-center space-x-2 ">
              <input 
                type="checkbox" 
                class="h-4 w-4 pt-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                v-model="stage.selected" 
                @change="checkGroupSelection(group)" 
              />
              <span>{{ stage.name }}</span>
            </label>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <UpdateButton @click="updateStages" />
        </div>
      </div>
   </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'

import { LifeCycleStages } from '@/models/material'
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: 'SettingsLifecycleStages',
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

    const { calculationSettings } = storeToRefs(settingsStore)
    const includedStages = ref(calculationSettings.value.includedStages)

    // Group stages dynamically by their first letter from the model
    const groupedStages = reactive(
        LifeCycleStages.reduce((acc, stage) => {
          const letter = stage.charAt(0).toUpperCase()
          let group = acc.find((g: any) => g.label === letter)
          if (!group) {
            group = { label: letter, selected: false, stages: [] }
            acc.push(group)
          }
          group.stages.push({ name: stage, selected: false })
          return acc
        }, [] as any[])
      )

    // Translate the included stages from the settings store to the grouped stages
    const initializeGroupedStages = () => {
      calculationSettings.value.includedStages.relevantStages.forEach((includedStage) => {
        const group = groupedStages.find((g: any) => g.label === includedStage.stage.charAt(0).toUpperCase())
        if (group) {
          const stage = group.stages.find((s: any) => s.name === includedStage.stage)
          if (stage) {
            stage.selected = includedStage.included
          }
        }
      })
      groupedStages.forEach((group: any) => {
        group.selected = group.stages.every((stage: any) => stage.selected)
      })
    }

    watch(
      () => calculationSettings,
      () => {
        initializeGroupedStages()
      },
      { immediate: true, deep: true }
    )

    const updateStages = () => {
      includedStages.value.relevantStages = groupedStages.flatMap((group: any) =>
          group.stages.map((stage: any) => ({
            included: stage.selected,
            stage: stage.name,
          }))
        )
      settingsStore.updateIncludedStages(includedStages.value)
    }

    // Check if all stages are selected and update the group checkbox accordingly
    const checkGroupSelection = (group: any) => {
      group.selected = group.stages.every((stage: any) => stage.selected)
    }

    // Toggle the selection of all subcategory checkboxes within a group
    const toggleGroup = (group: any) => {
      group.stages.forEach((stage: any) => {
        stage.selected = group.selected
      })
    }

    return { 
      groupedStages,
      checkGroupSelection,
      toggleGroup,
      updateStages
    }
  },
})
</script>