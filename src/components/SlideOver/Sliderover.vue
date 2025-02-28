<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <TransitionRoot as="template" :show="navRef.slideoverOpen.value">
    <Dialog as="div" class="relative right-0 w-full z-20 overflow-hidden">
      <div class="fixed inset-y-0 right-0 w-1/3 z-20 overflow-hidden">
        <div class="pointer-events-none fixed min-w-full inset-y-0 flex">
          <TransitionChild
            as="template"
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enter-from="translate-x-full"
            enter-to="-translate-x-0"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
            leave-from="-translate-x-0"
            leave-to="translate-x-full"
          >
            <DialogPanel class="pointer-events-auto w-1/3 mt-20 h-fit"
                :style="{backgroundColor: navStore.activeColor}">
              <div class="flex relative h-full flex-col overflow-auto styled-element scrollbar-hide">
                <!-- Header -->
                <div class="px-4 py-6 styled-element">
                  <div class="flex items-start justify-between">
                    <h2 class="font-black text-gray-900 text-lg">
                      {{ slideoverTitle }}
                    </h2>
                    <div class="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        class="relative rounded-md bg-white text-gray-400 hover:text-gray-500 
                               focus:outline-none focus:ring-2 focus:ring-green-500"
                        @click="toggleSlideover"
                      >
                        <span class="absolute -inset-2.5" />
                        <span class="sr-only">Close panel</span>
                        <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
                <!-- Content -->
                <div class="relative px-4 pt-4 bg-neutral-100">
                  <component :is="currentSlideover" @close="toggleSlideover" />
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useNavigationStore } from '@/stores/navigation'
import { storeToRefs } from 'pinia'

import ModifyFilter from '@/components/SlideOver/ModifyFilter.vue'
import SaveMapping from '@/components/SlideOver/SaveMapping.vue'
import SaveResults from '@/components/SlideOver/SaveResults.vue'

const navStore = useNavigationStore()
const navRef = storeToRefs(navStore)

const slideoverTitle = computed(() => {
  switch(navStore.activePage) {
    case "Filtering": return "Modify Filters"
    case "Mapping": return "Save Mapping"
    case "Results": return "Save Results"
    default: return ""
  }
})

const currentSlideover = computed(() => {
  switch(navStore.activePage) {
    case "Filtering": return ModifyFilter
    case "Mapping": return SaveMapping
    case "Results": return SaveResults
    default: return null
  }
})

const toggleSlideover = () => {
  navStore.toggleSlideover()
}
</script>

<style scoped>
.pointer-events-auto {
  pointer-events: auto;
}
</style>