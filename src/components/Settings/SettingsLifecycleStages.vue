<template>
  <div>
    <h2 class="styled-header">Lifecycle stages</h2>
    <p class="mt-1 styled-text">Set stages you want to include in the results, if no data exist in the EPD it will set the value as 0.</p>

    <table class="border styled-element mt-6 w-full border-collapse table-fixed">
      <tbody>
        <tr v-for="(row, rowIndex) in chunkedGroups" :key="rowIndex">
          <td
            v-for="(group, colIndex) in row"
            :key="colIndex"
            class="styled-table p-2 align-top w-1/4"
          >
            <!-- Top-level Checkbox -->
            <label class="flex items-center space-x-2 mb-2">
              <CheckBox
                :id="group.label"
                :name="group.label"
                :checked="group.selected"
                @update:checked="(newVal) => toggleGroup(group, newVal)"
              />
              <span class="styled-data font-bold">
                {{ group.label }}
              </span>
            </label>

            <!-- Subcategory Checkboxes -->
            <div class="ml-2">
              <label
                v-for="stage in group.stages"
                :key="stage.name"
                class="flex items-start space-x-2"
              >
                <CheckBox
                  :id="stage.name"
                  :name="stage.name"
                  :checked="stage.selected"
                  @update:checked="(newVal) => checkGroupSelection(group, stage, newVal)"
                />
                <span class="styled-data">{{ stage.name }}</span>
              </label>
            </div>
          </td>
          <!-- Empty cells -->
          <td v-for="n in (4 - row.length)" :key="'blank-' + n" class="border border-black p-2" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settingStore'
import CheckBox from '@/components/Base/CheckBox.vue'
import { LifeCycleStages } from '@/models/materialModel'
import { chunkArray } from '@/utils/dataUtils'

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

const chunkedGroups = computed(() => {
  return chunkArray(groupedStages, 4)
})

// Initialize the grouped stages from settings
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

const updateStages = () => {
  includedStages.value.relevantStages = groupedStages.flatMap((group: any) =>
    group.stages.map((stage: any) => ({
      included: stage.selected,
      stage: stage.name,
    }))
  )
  settingsStore.updateIncludedStages(includedStages.value)
}

const checkGroupSelection = (group: any, stage: any, newVal: boolean) => {
  stage.selected = newVal
  group.selected = group.stages.every((s: any) => s.selected)
  updateStages()
}

const toggleGroup = (group: any, newVal: boolean) => {
  group.selected = newVal
  group.stages.forEach((stage: any) => {
    stage.selected = newVal
  })
  updateStages()
}

onMounted(() => {
  initializeGroupedStages()
})

watch(() => calculationSettings.value.includedStages, (newVal) => {
  includedStages.value = newVal
  initializeGroupedStages()
})
</script>