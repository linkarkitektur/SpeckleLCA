<template>
  <Popover as="div" class="relative inline-block text-left">
    <div>
      <PopoverButton 
        class="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <span>{{ displayName }}</span>
        <span 
          class="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gray-700"
        >
          {{ selectedCount === 0 ? 'All' : selectedCount }}
        </span>
        <ChevronDownIcon 
          class="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" 
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

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/24/solid'

export interface Option {
  label: string
  value: string
  selected: boolean
}

export default defineComponent({
  name: 'DropdownMulti',
  components: {
    Popover,
    PopoverButton,
    PopoverPanel,
    ChevronDownIcon,
  },
  props: {
    filterName: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    options: {
      type: Array as () => Option[],
      required: true,
    },
  },
  emits: ['update:options'],
  setup(props, { emit }) {
    // Compute the number of selected options
    const selectedCount = computed(() => {
      return props.options.filter(option => option.selected).length
    })

    // Toggle selection of an option
    const toggleSelection = (index: number) => {
      const updatedOptions = [...props.options]
      updatedOptions[index].selected = !updatedOptions[index].selected
      emit('update:options', updatedOptions)
    }

    return {
      selectedCount,
      toggleSelection,
    }
  },
})
</script>