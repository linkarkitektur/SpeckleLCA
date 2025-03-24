<template>
  <div class="space-y-12">
    <h2 class="styled-header">
      Export Data
    </h2>
    <!-- Draggable filter list-->
    <div class="relative flex-1 px-4">
      <Draggable
        v-if="groupings"
        :list="groupings"
        item-key="id"
        ghost-class="ghost"
        :animation="200"
        class="space-y-4"
      >
        <template #item="{ element, index }">
          <div class="styled-element hoverable-sm pressable p-4 flex justify-between items-center">
            <DropdownSearchable
              v-if="parameterNames"
              :items="parameterNames"
              :dropdownName="element.parameter"
              @selectedItem="(item) => handleSelectedParameter(item, index)"
              class="w-full"
            />
            <button
              class="p-1 styled-element hoverable-xs bg-neutral-100 ml-2"
              :style="{ backgroundColor: navStore.activeColor }"
              @click="removeGrouping(index)"
            >
              <MinusCircleIcon class="h-4 w-4" />
            </button>
          </div>
        </template>
      </Draggable>
      <div class="flex items-center justify-center">
        <button
          class="p-1 styled-element hoverable-xs bg-neutral-100 mt-4"
          :style="{ backgroundColor: navStore.activeColor }"
          @click="addNewGrouping"
        >
          <PlusCircleIcon class="h-4 w-4" />
        </button>
      </div>
      <!-- Format picker -->
      <div class="sm:col-span-4">
        <label 
          class="block styled-text normal-case mt-6"
        >
          Format
        </label>
        <div class="ml-2">
          <label 
            v-for="format in formData.format" 
            :key="format.name" 
            class="flex items-center space-x-2"
          >
            <CheckBox
              :name="format.name"
              :id="format.name"
              :checked="format.include"
              @update:checked="(newVal) => format.include = newVal"
            />
            <span class="styled-text">{{ format.name }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
  <!-- Export button -->
  <div class="mt-6 flex items-center justify-start gap-x-6 z-0">
    <ActionButton
      text="Export"
      @on-click="exportData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CheckBox from '@/components/Base/CheckBox.vue'
import ActionButton from '@/components/Base/ActionButton.vue'
import DropdownSearchable from '@/components/Base/DropdownSearchable.vue'
import { ExportConfig, ExportFormat } from '@/models/exportModel'
import { ExportManager } from '@/utils/exportUtils'
import { useProjectStore } from '@/stores/projectStore'
import Draggable from 'vuedraggable'
import Dropdown from '@/components/Base/Dropdown.vue'
import { PlusCircleIcon, MinusCircleIcon } from '@heroicons/vue/24/solid'
import { useNavigationStore } from '@/stores/navigationStore'
import type { dropdownItem } from '@/components/Base/Dropdown.vue'
import { ResultCalculator } from '@/utils/resultUtils'


const projectStore = useProjectStore()
const navStore = useNavigationStore()

let nextId = 1

const groupings = ref<{ id: number; parameter: string }[]>([])

// Get available parameter dropdown items.
const parameterNames = projectStore
  .getAvailableParameterList(true)
  .map((el: string) => ({ name: el, data: '' }))
  .sort((a, b) => a.name.localeCompare(b.name))

const handleSelectedParameter = (selectedItem: dropdownItem, index: number) => {
  groupings.value[index].parameter = selectedItem.name
}

const addNewGrouping = () => {
  groupings.value.push({
    id: nextId++,
    parameter: parameterNames[0].name
  })
}

const removeGrouping = (index: number) => {
  groupings.value.splice(index, 1)
}

const formData = ref({
  format: Object.values(ExportFormat).map(f => ({ name: f, include: true }))
})

const exportData = () => {
  const projectStore = useProjectStore()
  console.log("Saving Data")
  // Filter formats where include is true
  const selectedFormats = formData.value.format
    .filter(f => f.include)
    .map(f => f.name)

  const selectedParameters = groupings.value.map(grp => grp.parameter)
  
  const resCalc = new ResultCalculator(projectStore.currProject.geometry)
  // Update parameter chain
  resCalc.setGroupingChain(selectedParameters)
  // Create resultList and aggregate
  resCalc.aggregate(false, true)

  const config: ExportConfig = {
    format: selectedFormats[0]
  } 

  const exporter = new ExportManager(config, resCalc.resultList)

  selectedFormats.forEach((format) => {
    exporter.switchFormat(format)
    exporter.exportData()
  })
}
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #e2e8f0;
  transform: rotate(3deg) scale(0.98);
  transition: transform 0.2s ease-in-out;
}

.styled-element {
  transform-origin: center;
  transition: all 0.2s ease-in-out;
}

.styled-element:hover {
  transform: translateY(-2px);
}
</style>