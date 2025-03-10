<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="relative inline-block text-left min-w-30">
    <div class="max-w-xs">
      <button
        @click="toggleDropdown"
        class="inline-flex w-full justify-between px-6 py-1 text-sm truncate max-w-80 styled-element hoverable-sm"
        :style="{ backgroundColor: navStore.activeColor}"
      >
        <div class="flex items-center space-x-2 truncate">
          {{ selectedItem }}
        </div>
        <ChevronDownIcon class="-mr-1 h-5 w-5 text-black" aria-hidden="true" />
      </button>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-[100] mt-2 w-full origin-top-right styled-element"
        :style="{ backgroundColor: navStore.activeColor}"
      >
        <div class="py-1 max-h-60 overflow-y-auto">
          <DropdownMenuItem
            v-for="item in items"
            :key="item.name"
            :item="item"
            :selectedItem="selectedItem"
            @select="select"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import DropdownMenuItem from '@/components/Base/DropdownMenuItem.vue'
import { useNavigationStore } from '@/stores/navigation'

export interface dropdownItem {
  name: string
  data?: string
  children?: dropdownItem[]
}

interface Props {
  items: dropdownItem[]
  dropdownName?: string
}

const navStore = useNavigationStore()

const props = withDefaults(defineProps<Props>(), {
  dropdownName: 'Options'
})

const emit = defineEmits<{
  (e: 'selectedItem', item: dropdownItem): void
}>()

const selectedItem = ref(props.dropdownName)
const isOpen = ref(false)

const select = (item: dropdownItem) => {
  selectedItem.value = item.name
  isOpen.value = false
  emit('selectedItem', item)
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

// Watch for changes in dropdownName
watch(
  () => props.dropdownName,
  (newValue) => {
    selectedItem.value = newValue
  }
)

// Watch for changes in items array
watch(
  () => props.items,
  (newItems) => {
    if (!newItems.some((item) => item.name === selectedItem.value)) {
      if (newItems.length > 0) {
        //selectedItem.value = newItems[0].name
      } else {
        selectedItem.value = props.dropdownName
      }
    }
  },
  { immediate: true }
)
</script>