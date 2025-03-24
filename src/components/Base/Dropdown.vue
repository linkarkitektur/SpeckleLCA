<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="relative inline-block text-left min-w-30">
    <div class="max-w-xs">
      <button
        ref="dropdownButton"
        @click="toggleDropdown"
        class="inline-flex w-full justify-between px-6 py-1 text-sm truncate max-w-80 styled-element hoverable-sm"
        :style="{ backgroundColor: navStore.activeColor }"
      >
        <div class="flex items-center space-x-2 truncate">
          {{ selectedItem }}
        </div>
        <ChevronDownIcon class="-mr-1 h-5 w-5 text-black" aria-hidden="true" />
      </button>
    </div>
    <Teleport to="body">
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
          class="fixed z-50 origin-top-left styled-element"
          :style="dropdownStyles"
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
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import DropdownMenuItem from '@/components/Base/DropdownMenuItem.vue'
import { useNavigationStore } from '@/stores/navigationStore'

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
const dropdownButton = ref<HTMLElement | null>(null)

const dropdownStyles = ref({
  top: '0px',
  left: '0px',
  width: 'auto',
  backgroundColor: navStore.activeColor
})

const select = (item: dropdownItem) => {
  selectedItem.value = item.name
  isOpen.value = false
  emit('selectedItem', item)
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
  
    nextTick(() => {
      if (dropdownButton.value) {
        const rect = dropdownButton.value.getBoundingClientRect()
        dropdownStyles.value = {
          top: `${rect.bottom + window.scrollY}px`,  // position just below the button
          left: `${rect.left + window.scrollX}px`,
          width: `${rect.width}px`,
          backgroundColor: navStore.activeColor
        }
      }
    })
  }
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