<template>
  <button
    v-if="!sideBarShow"
    @click="toggleSideBar" 
    class="absolute top-1/2 pt-16 left-2 transform -translate-y-1/2 mr-2 z-50"
  >
    <ChevronRightIcon class="w-6 h-6 opacity-50" />
  </button>
  <TransitionRoot as="template" :show="sideBarShow">
    <div 
      class="relative mt-16 z-40 flex h-[calc(100vh-4rem)] w-1/2 flex-col"
    >
      <TransitionChild
        as="template"
        enter="transform transition ease-in-out duration-500 sm:duration-700"
        enter-from="-translate-x-full"
        enter-to="translate-x-0"
        leave="transform transition ease-in-out duration-500 sm:duration-700"
        leave-from="translate-x-0"
        leave-to="-translate-x-full"
      >
        <div 
          class="flex grow h-[calc(100vh-12rem)] flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pt-4"
        >
          <button
            v-if="sideBarShow"
            @click="toggleSideBar" 
            class="absolute top-1/2 -right-8 transform -translate-y-1/2 mr-2 opacity-50"
          >
            <ChevronLeftIcon class="w-6 h-6" />
          </button>
          <GroupList />
        </div>
      </TransitionChild>
    </div>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {  
  TransitionChild, 
  TransitionRoot 
} from '@headlessui/vue'

import { 
  ChevronRightIcon, 
  ChevronLeftIcon 
} from '@heroicons/vue/24/solid'

import { useNavigationStore } from '@/stores/navigation'

import GroupList from '@/components/Sidebar/GroupList.vue'

import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'SideBar',
  components: {
    GroupList,
    TransitionChild, 
    TransitionRoot,
    ChevronLeftIcon,
    ChevronRightIcon
  },
  setup() {
    const navStore = useNavigationStore()
    const { sideBarShow } = storeToRefs(navStore)

    const toggleSideBar = () => {
      navStore.toggleSideBar()
    }
    
    return {
      sideBarShow,
      toggleSideBar
    }
  }
  
})
</script>

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>