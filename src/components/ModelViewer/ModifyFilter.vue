<template>
  <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
    <div class="px-4 sm:px-6">
      <div class="flex items-start justify-between">
        <DialogTitle class="text-base font-semibold leading-6 text-gray-900">Group edit</DialogTitle>
        <div class="ml-3 flex h-7 items-center">
          <button type="button" class="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" @click="toggleSlideover()">
            <span class="absolute -inset-2.5" />
            <span class="sr-only">Close panel</span>
            <XMarkIcon class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
    <div class="relative mt-6 flex-1 p-4 sm:px-6">
      <div class="rounded-md bg-gray-200 mb-4 p-4" v-for="filter in callStack">
        <div class="relative">
          <button aria-label="Edit filter"
          class="absolute right-0 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
          @click="editFilter">
            <PencilSquareIcon class="ml-2 h-5 w-5" />
        </button>
        </div>
        <p>{{ filter.name }}</p>
        <p>{{ filter.field }}</p>
        <p>{{ filter.value }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { DialogTitle } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { PencilSquareIcon } from '@heroicons/vue/24/solid';
import { useNavigationStore, useProjectStore } from '@/stores/main'

export default defineComponent ({
  name: "Slideover",
  components: {
    DialogTitle,
    XMarkIcon,
    PencilSquareIcon
  },
  setup() {
    const navStore = useNavigationStore();
    const projectStore = useProjectStore();

    const toggleSlideover = () => {
      navStore.toggleSlideover();
    }

    const callStack = projectStore.getRegistryStack()

    const editFilter = () => {
      console.log("editFilters")
    }

    return {
      toggleSlideover,
      editFilter,
      callStack
    }
  }
});
</script>