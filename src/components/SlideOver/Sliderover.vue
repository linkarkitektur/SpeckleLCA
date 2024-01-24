<template>
  <TransitionRoot as="template" :show="navRef.slideoverOpen.value">
    <Dialog as="div" class="relative">
      <TransitionChild
        as="template"
        enter="ease-in-out duration-500"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in-out duration-500"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-y-0 right-0 w-2/3 bg-gray-500 bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-y-0 right-0 w-2/3 z-20 overflow-hidden">
        <div
          class="pointer-events-none fixed inset-y-0 left-1/3 flex w-1/3 pt-16"
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
            <DialogPanel class="pointer-events-auto w-screen max-w-md">
              <component :is="currentSlideover" />
            </DialogPanel>
          </TransitionChild>
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

import ModifyFilter from '@/components/SlideOver/ModifyFilter.vue';

//FOR ABHINAV
export default defineComponent({
  name: 'SlideOver',
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    ModifyFilter
  },
  setup() {
    const navStore = useNavigationStore()
    const navRef = storeToRefs(navStore)

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
      toggleSlideover,
      currentSlideover
    }
  }
})
</script>
