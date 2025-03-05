<template>
  <div class="relative flex-1 px-4">
    <Draggable
      v-if="callStack"
      :list="callStack"
      :group="callStack"
      item-key="index"
      ghost-class="ghost"
      :animation="200"
      class="space-y-4"
      @start="drag = true"
      @end="drag = false"
    >
      <template #item="{ element, index }">
        <div class="styled-element hoverable-sm pressable p-4" 
          :class="{'styled-active' : index === editFilter, 'scale-[0.99] rotate-1': drag  }"
				>         
					 <div class="relative">
            <!-- Edit/Remove Buttons -->
            <div v-if="index !== editFilter" class="absolute right-2 top-2 flex flex-col gap-2">
              <button
                class="p-1 styled-element hoverable-xs bg-neutral-100"
                :style="{ backgroundColor: navStore.activeColor }"
                @click="toggleFilter(index)"
              >
                <PencilSquareIcon class="h-4 w-4" />
              </button>
              <button
                class="p-1 styled-element hoverable-xs mb-2 bg-neutral-100"
                :style="{ backgroundColor: navStore.activeColor }"                
                @click="removeFilter(index)"
              >
                <MinusCircleIcon class="h-4 w-4" />
              </button>
            </div>
            <button
              v-else
              class="absolute right-2 top-2 p-1 styled-element hoverable-xs z-50 bg-neutral-100"
              :style="{ backgroundColor: navStore.activeColor }"
              @click="toggleFilter(index)"
            >
              <XMarkIcon class="h-4 w-4" />
            </button>
          </div>

          <!-- Edit Mode -->
          <div v-if="index === editFilter" class="space-y-4">
            <Dropdown
              v-if="filterNames"
              :items="filterNames"
              :dropdownName="element.name"
              @selectedItem="(item) => handleSelectedName(item, index)"
              class="w-full"
            />
            <Dropdown
              v-if="parameterNames"
              :items="parameterNames"
              :dropdownName="element.field"
              @selectedItem="(item) => handleSelectedField(item, index)"
              class="w-full"
            />
            <input 
              v-model="element.value" 
              placeholder="Filter value..."
              class="p-2 styled-element font-mono bg-neutral-100"
            />
            <div class="flex items-center gap-2">
              <input 
                v-model="element.remove" 
                type="checkbox"
                class="h-4 w-4 styled-element hoverable-xs bg-neutral-100"
              />
              <label>Remove false results</label>
            </div>
          </div>

          <!-- View Mode -->
          <div v-else class="space-y-2">
            <p class="font-semibold">{{ element.name }}</p>
            <p class="text-gray-600 font-mono text-sm">{{ element.field }}</p>
            <p class="text-gray-600 font-mono text-sm">{{ element.value }}</p>
          </div>
        </div>
      </template>
    </Draggable>

    <!-- Add Filter Button -->
    <div class="flex justify-center mt-4 mb-4 ">
      <button 
        @click="addNewFilter"
        class="p-1 styled-element hoverable-xs"
        :style="{ backgroundColor: navStore.activeColor }"
      >
        <PlusCircleIcon class="h-6 w-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import Draggable from 'vuedraggable'
import Dropdown from '@/components/Misc/Dropdown.vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import {
  PencilSquareIcon,
  PlusCircleIcon,
  MinusCircleIcon,
} from '@heroicons/vue/24/solid'
import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'
import type { dropdownItem } from '@/components/Misc/Dropdown.vue'

// TODO: Check if we want style of drag for all draggables in the future!

// Store initialization
const projectStore = useProjectStore()
const navStore = useNavigationStore()

// Reactive state
const editFilter = ref(-1)
const callStack = ref(projectStore.getRegistryStack())
const drag = ref(false)

// Computed dropdown items
const filterNames = projectStore
  .getFilterNames()
  .map((el: string) => ({ name: el, data: '' }))
  .sort((a, b) => a.name.localeCompare(b.name))

const parameterNames = projectStore
  .getAvailableParameterList()
  .map((el: string) => ({ name: el, data: '' }))
  .sort((a, b) => a.name.localeCompare(b.name))

// Methods
const handleSelectedName = (selectedItem: dropdownItem, index: number) => {
  callStack.value[index].name = selectedItem.name
}

const handleSelectedField = (selectedItem: dropdownItem, index: number) => {
  callStack.value[index].field = selectedItem.name
}

const addNewFilter = () => {
  callStack.value.push({
    name: filterNames[0].name,
    field: parameterNames[0].name,
    value: '',
    remove: false
  })
}

const removeFilter = (index: number) => {
  if (index > -1) {
    callStack.value.splice(index, 1)
  }
  editFilter.value = -1
}

const toggleFilter = (index: number) => {
  editFilter.value = editFilter.value !== index ? index : -1
}

// Update store when component unmounts
onUnmounted(() => {
  projectStore.updateRegistryStack('test', callStack.value)
})
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #e2e8f0;
  transform: rotate(3deg) scale(0.98);
  transition: transform 0.2s ease-in-out;
}

.sortable-drag {
  opacity: 0;
}

.sortable-chosen {
  background: #f8fafc;
}

/* Add slide animation for reordering */
.flip-list-move {
  transition: transform 0.5s;
}

/* Optional: add some hover effects */
.styled-element {
  transform-origin: center;
  transition: all 0.2s ease-in-out;
}

.styled-element:hover {
  transform: translateY(-2px);
}
</style>