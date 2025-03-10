<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="relative mt-20 z-40 flex h-[calc(100vh-5rem)] w-2/5 flex-col px-6">
    <!-- Buttons and dropdown area -->
    <div class="flex-none px-2 py-2 overflow-visible">
      <div class="flex h-8 space-x-4">
        <Dropdown
          :items="dropdownItems"
          :dropdownName="dropdownName"
          @selectedItem="handleSelected"
        />

        <ActionButton
          v-for="button in visibleButtons"
          :key="button.text"
          :text="button.text"
          :icon="button.icon"
          @onClick="handleButtonClick(button)"
        />

      </div>
    </div>

    <!-- Groupings list-->
    <div class="flex grow h-full flex-col gap-y-4 overflow-y-auto">
      <GroupList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { sidebarButtons } from '@/config/slideoverNavigation'

import GroupList from '@/components/Sidebar/GroupList.vue'
import Dropdown from '@/components/Base/Dropdown.vue'
import ActionButton from '@/components/Base/ActionButton.vue'

import { useNavigationStore } from '@/stores/navigation'

import { useFetchDropdownItems } from '@/composables/useFetchDropdownItems'
import { useHandleSelected } from '@/composables/useHandleSelected'

import type { NavigationButtonConfig } from '@/models/pageLogic'

// Store initialization
const navStore = useNavigationStore()

// Compute visible buttons for current page
const visibleButtons = computed(() => 
  sidebarButtons.filter(button => button.showOn.includes(navStore.activePage))
)

// Button click handler
const handleButtonClick = (button: NavigationButtonConfig) => {
  switch(button.action) {
    case 'toggleSlideover':
      navStore.setSlideoverFunction(button.text)
      break
  }
}

// Initialize dropdown functionality
const { dropdownItems, dropdownName, fetchDropdownItems } = useFetchDropdownItems()

// Initialize selection handler
const { handleSelected } = useHandleSelected()

// Watch for page changes to update dropdown items
watch(
  () => navStore.activePage,
  () => {
    fetchDropdownItems()
  },
  { immediate: true }
)
</script>

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>