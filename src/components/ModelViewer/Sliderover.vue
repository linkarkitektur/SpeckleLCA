<template>
  <TransitionRoot as="template" :show="navRef.slideoverOpen.value">
    <Dialog as="div" class="relative z-10">
      <TransitionChild
        as="template"
        enter="ease-in-out duration-500"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in-out duration-500"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 left-96 flex max-w-full pr-10 pt-16">
            <TransitionChild
              as="template"
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enter-from="-translate-x-full"
              enter-to="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leave-from="translate-x-0"
              leave-to="-translate-x-full"
            >
              <DialogPanel class="pointer-events-auto w-screen max-w-md">
                <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                  <div class="px-4 sm:px-6">
                    <div class="flex items-start justify-between mb-1">
                      <DialogTitle class="text-base font-semibold leading-6 text-gray-900">
                        Group edit
                      </DialogTitle>
                      <div class="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          class="relative rounded-md bg-white-100 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          @click="toggleSlideover()"
                        >
                          <span class="absolute -inset-2.5" />
                          <span class="sr-only">Close panel</span>
                          <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <!-- Search Bar and Table -->
                  <div class="relative mt-1 flex-1 px-4 sm:px-6">
                    <!-- Search Bar -->
                    <div class="p-4">
                      <input
                        type="text"
                        v-model="searchQuery"
                        placeholder="Search..."
                        class="w-full border p-2 rounded-md"
                      />
                    </div>
                    <!-- Table -->
                    <table class="min-w-full w-96 divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th class="px-6 py-3 bg-violet-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th class="px-6 py-3 bg-violet-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                            Material Type
                          </th>
                          <th class="px-6 py-3 bg-violet-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                            Unit
                          </th>
                          <th class="px-6 py-3 bg-violet-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-violet-50 divide-y divide-gray-200">
                        <!-- Rows -->
                        <!-- Row 1 -->
                        <tr>
                          <td class="px-6 py-4 whitespace-no-wrap">Material Name</td>
                          <td class="px-6 py-4 whitespace-no-wrap">Type</td>
                          <td class="px-6 py-4 whitespace-no-wrap">12</td>
                          <td class="px-6 py-4 whitespace-no-wrap">10 CO2/m2</td>
                        </tr>
                        <!-- Row 2 -->
                        <tr>
                          <td class="px-6 py-4 whitespace-no-wrap">Material Name</td>
                          <td class="px-6 py-4 whitespace-no-wrap">Type</td>
                          <td class="px-6 py-4 whitespace-no-wrap">31</td>
                          <td class="px-6 py-4 whitespace-no-wrap">15 CO2/m2</td>
                        </tr>
                        <!-- Row 3 -->
                        <tr>
                          <td class="px-6 py-4 whitespace-no-wrap">Material Name</td>
                          <td class="px-6 py-4 whitespace-no-wrap">Type</td>
                          <td class="px-6 py-4 whitespace-no-wrap">43</td>
                          <td class="px-6 py-4 whitespace-no-wrap">23.5 CO2/m2</td>
                        </tr>
                        <!-- Row 4 -->
                        <tr>
                          <td class="px-6 py-4 whitespace-no-wrap">Material Name</td>
                          <td class="px-6 py-4 whitespace-no-wrap">Type</td>
                          <td class="px-6 py-4 whitespace-no-wrap">64</td>
                          <td class="px-6 py-4 whitespace-no-wrap">9 CO2/m2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { 
  Dialog, 
  DialogPanel, 
  TransitionChild, 
  TransitionRoot 
} from '@headlessui/vue'
import { useNavigationStore } from '@/stores/main'
import { storeToRefs } from 'pinia'


import ModifyFilter from '@/components/ModelViewer/ModifyFilter.vue';

//FOR ABHINAV
export default defineComponent({
  name: 'Slideover',
  components: {
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    ModifyFilter
  },
  setup() {
    const navStore = useNavigationStore()
    const navRef = storeToRefs(navStore)
    const searchQuery = ref('');

    const currentSlideover = computed(() => {
      if (navStore.activePage === "Overview")
        return ModifyFilter;
      else if (navStore.activePage === "Mapping")
        return null;
      else if (navStore.activePage === "Results")
        return null;
      else if (navStore.activePage === "Benchmark")
        return null;
      else
        return null;
    });

    const toggleSlideover = () => {
      navStore.toggleSlideover()
    }

    return {
      navRef,
      searchQuery,
      toggleSlideover,
      currentSlideover
    }
  }
})
</script>
