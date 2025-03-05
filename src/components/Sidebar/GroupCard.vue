<template>
  <div :class="['group-card-wrapper', $attrs.class]">
    <div 
      tabindex="1"
      id="groupCard"
      class="relative isolate z-20 styled-element hoverable pressable w-3/4 dropArea bg-neutral-100"
      :class="{
        'outline-2 outline-offset-2 outline-black translate-x-2 translate-y-2 shadow-none' : selectedBool, 
      }"
      :style="{ color: fontColor }"
      @click="toggleExpand"
      @drop="onDrop"
      @dragover.prevent
    >
      <section 
        class="relative flex items-center justify-between w-full min-h-12 text-black cursor-pointer"
      >
        <!-- Group Name -->
        <div class="absolute w-full items-center top-2 left-0 rounded-br-lg">
          <div class="flex justify-center leading-none font-semibold">{{ inGroups.name }}</div>
        </div>
        <!-- Left Side Info -->
        <div class="flex flex-col items-start h-full pl-2 pt-6 pb-3 font-mono font-light">
          <div class="text-sm leading-none pt-1 truncate max-w-40" :title="leftInfo">
            {{ leftInfo }}
          </div>
        </div>
        <!-- Right Side Info -->
        <div class="flex flex-col items-end h-full pr-2 pt-6 pb-3 font-mono font-light">
          <div class="text-sm leading-none pt-1 truncate max-w-40" :title="rightInfo">
            {{ rightInfo }}
          </div>
        </div>
      </section>
      
      <!-- Lower Section -->
      <section class="w-full">
        <div class="relative flex items-center justify-center min-w-full h-10 styled-element bg-neutral-100 z-10">
            <!-- Component determined by currGroupTotal -->
            <component :is="currGroupTotal" :groups="inGroups" v-if="currGroupTotal" class="font-light text-sm"/>
          <slot name="dynamic-content" />
        </div> 
      </section>

      <!-- Triangle indicators -->
      <div 
        v-if="inGroups.children.length"
        class="absolute translate-x-0 translate-y-0 group-hover:translate-x-2 group-hover:translate-y-2
                group-focus-within:translate-x-2 group-focus-within:translate-y-2
                transition-all delay-150 duration-300 ease-in-out z-30" 
        :class="{ 'rotate-180': isExpanded }"
        :style="{
          right: '-19px',
          bottom: '-19px',
          width: 0,
          height: 0,
          borderLeft: '19px solid transparent',
          borderRight: '19px solid transparent',
          borderTop: '26px solid black'
        }"
      ></div>
      <div 
        v-if="inGroups.children.length"
        class="absolute translate-x-0 translate-y-0 group-hover:translate-x-2 group-hover:translate-y-2
                group-focus-within:translate-x-2 group-focus-within:translate-y-2
                transition-all delay-150 duration-300 ease-in-out z-40" 
        :class="{ 'rotate-180': isExpanded }"
        :style="{
          right: '-15px',
          bottom: '-15px',
          width: 0,
          height: 0,
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderTop: `20px solid ${inGroups.color}`
        }"
      ></div>
    </div>

    <!-- Subgroups -->
    <transition
      name="expand"
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
      <div v-if="isExpanded" class="w-full relative z-10 scale-x-95 origin-top-right">
      <GroupCard
        v-for="(children, index) in inGroups.children"
        class="pt-6"
        :key="index"
        :groups="children"
      />
      </div>
    </transition>
    <!-- TODO: Add removed functionality to edit and remove groups! -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'

import OverviewGroupCard from '@/components/Sidebar/Overview/OverviewGroupCard.vue'
import MaterialGroupCard from '@/components/Sidebar/Mapping/MaterialGroupCard.vue'
import ResultsGroupCard from '@/components/Sidebar/Results/ResultsGroupCard.vue'

import type { NestedGroup } from '@/models/filters'

import { getMappedMaterial, mapMaterial } from '@/utils/material'

import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'
import { storeToRefs } from 'pinia'
import { getFontColorForHSL, lightenHSLColor } from '@/utils/colorUtils'

// Add defineOptions to inherit attrs
defineOptions({
  inheritAttrs: true
})

// Props
interface Props {
  groups: NestedGroup
}

const props = defineProps<Props>()

// Store initialization
const projectStore = useProjectStore()
const navStore = useNavigationStore()
// Reactive refs
const isExpanded = ref(false)
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  projectStore.setSelectedObjects(inGroups.value.objects)
}

// Store refs
const { activePage } = storeToRefs(navStore)
const { selectedGroup } = storeToRefs(projectStore)

// Computed properties
const inGroups = computed(() => ({
  ...props.groups,
  children: props.groups.children.map(child => ({
    ...child,
    color: lightenHSLColor(props.groups.color, 0.2)
  }))
}))

const selectedBool = computed(() => {
  if (selectedGroup.value) {
    return inGroups.value.id === selectedGroup.value.id
  }
  return false
})

const fontColor = computed(() => {
  if (inGroups.value && inGroups.value.color) {
    if (activePage.value === "Filtering") {
      return getFontColorForHSL(inGroups.value.color)
    }
    return 'text-gray-700'
  }
  return 'text-gray-700'
})

const currGroupTotal = computed(() => {
  switch (activePage.value) {
    case "Filtering": return OverviewGroupCard
    case "Mapping": return MaterialGroupCard
    case "Results": return ResultsGroupCard
    case "Benchmark": return null
    default: return null
  }
})

const leftInfo = computed(() => {
  switch (activePage.value) {
    case "Filtering": return inGroups.value.objects.length + " Elements"
    case "Mapping": return "Material"
    case "Results": return "Area"
    case "Benchmark": return null
    default: return "dummy"
  } 
})

const rightInfo = computed(() => {
  switch (activePage.value) {
    case "Filtering": return inGroups.value.objects.length + " Elements"
    case "Mapping": return getMappedMaterial(inGroups.value.objects).name
    case "Results": return "100 m2"
    case "Benchmark": return null
    default: return "dummy"
  } 
})

// Add drop handler
const onDrop = () => {
  if (inGroups.value) {
    mapMaterial(inGroups.value)
  }
}

// OnMounted and unMounted effects
// Event handler for Escape key so we deselect the group visually as well
const handleEscKey = (e: KeyboardEvent) => {
  if (e.key.toLowerCase() === 'escape') {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey)
})

</script>

<style scoped>
.group-card-wrapper {
  position: relative;
  width: 100%;
}
</style>