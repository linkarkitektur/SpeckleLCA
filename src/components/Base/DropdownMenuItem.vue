<template>
  <div>
    <div
      :class="[
        'flex items-center justify-between px-4 py-2 text-sm cursor-pointer',
        selectedItem === item.name ? 'font-bold underline' : '',
      ]"
      :style="{ 
        backgroundColor: active || selectedItem === item.name 
          ? darkenHSLColor(navStore.activeColor, 0.5) 
          : navStore.activeColor 
      }"
      @click="handleSelect"
      @mouseenter="active = true"
      @mouseleave="active = false"
    >
      <span>{{ item.name }}</span>
      <ChevronRightIcon v-if="hasChildren" class="h-4 w-4 text-gray-400" />
    </div>
    <transition name="fade">
      <div v-if="isOpen" class="ml-4 pl-4 border-l border-gray-200">
        <DropdownMenuItem
          v-for="child in item.children"
          :key="child.name"
          :item="child"
          :selectedItem="selectedItem"
          @select="$emit('select', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronRightIcon } from '@heroicons/vue/20/solid'
import { useNavigationStore } from '@/stores/navigation'

import { darkenHSLColor } from '@/utils/colorUtils'

export interface dropdownItem {
  name: string
  data?: string
  children?: dropdownItem[]
}

interface Props {
  item: dropdownItem
  selectedItem: string
}

const navStore = useNavigationStore()

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select', item: dropdownItem): void
}>()

// Reactive state
const isOpen = ref(false)
const active = ref(false)

// Computed properties
const hasChildren = computed(() => props.item.children && props.item.children.length > 0)

// Methods
const handleSelect = () => {
  if (hasChildren.value) {
    isOpen.value = !isOpen.value
  } else {
    emit('select', props.item)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-leave-to,
.fade-enter-from {
  opacity: 0;
}
</style>
