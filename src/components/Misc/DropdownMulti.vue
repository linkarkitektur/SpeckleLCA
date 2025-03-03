<template>
  <Popover as="div" class="relative inline-block text-left">
    <div>
      <PopoverButton 
        class="group inline-flex items-center justify-center text-xs styled-element p-1 hoverable-xs"
        :style="{ backgroundColor: navStore.activeColor }"
      >
        <span>{{ displayName }}</span>
        <span 
          class="ml-1 border-l border-black p-1 text-xs font-mono"
        >
          {{ selectedCount === 0 ? 'All' : selectedCount }}
        </span>
        <ChevronDownIcon 
          class="mr-1 ml-1 h-4 w-4 " 
          aria-hidden="true" 
        />
      </PopoverButton>
    </div>

    <Transition 
      enter-active-class="transition ease-out duration-100" 
      enter-from-class="transform opacity-0 scale-95" 
      enter-to-class="transform opacity-100 scale-100" 
      leave-active-class="transition ease-in duration-75" 
      leave-from-class="transform opacity-100 scale-100" 
      leave-to-class="transform opacity-0 scale-95"
    >
      <PopoverPanel 
        class="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <form class="space-y-4">
          <div 
            v-for="(option, optionIdx) in options" 
            :key="option.value" 
            class="flex items-center"
          >
            <input
              :id="`filter-${filterName}-${optionIdx}`"
              :name="`${filterName}[]`"
              :value="option.value"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              :checked="option.selected"
              @change="toggleSelection(optionIdx)"
            />
            <label :for="`filter-${filterName}-${optionIdx}`" class="pl-2 text-sm text-gray-700">
              {{ option.label }}
            </label>
          </div>
        </form>
      </PopoverPanel>
    </Transition>
  </Popover>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/24/solid'
import { useNavigationStore } from '@/stores/navigation'

export interface Option {
  label: string
  value: string
  selected: boolean
}

// Props
interface Props {
  filterName: string
  displayName: string
  options: Option[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:options': [Option[]]
}>()

const navStore = useNavigationStore()

// Computed
const selectedCount = computed(() => 
  props.options.filter(option => option.selected).length
)

// Methods
const toggleSelection = (index: number) => {
  const updatedOptions = [...props.options]
  updatedOptions[index].selected = !updatedOptions[index].selected
  emit('update:options', updatedOptions)
}
</script>