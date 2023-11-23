<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-10" @close="closeModal">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
              <div>
                <div class="mx-auto flex h-12 w-auto items-center justify-center rounded-md bg-green-100">
                  <p>{{ projectName }}</p>
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <Dropdown :items="extractNames" name="Version"/>
                  <!--<DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">Here you will select your current version</DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">{{ projectId }}</p>
                  </div>
                  -->
                </div>
              </div>
              <div class="mt-5 sm:mt-6">
                <button type="button" 
                  class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" 
                  @click="loadVersion">
                  Load this version
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, ref, watch, getCurrentInstance, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { CheckIcon } from '@heroicons/vue/24/outline'
import Dropdown from '@/components/Dropdown.vue'

import router from '@/router';
import type { VersionId } from '@/models/speckle';
import { useNavigationStore, useProjectStore } from '@/stores/main';
import { useSpeckleStore } from '@/stores/speckle';
import { getProjectVersions } from '@/utils/speckleUtils';

export default defineComponent ({
  name: "VersionSelectionModal",
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    Dropdown,
    CheckIcon
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    projectId: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    }
  },
  methods: {
    loadVersion() {
      //Do conversion from speckle project to projectStore project here
      console.log("Loading version");

      const navigationStore = useNavigationStore();

      navigationStore.setActivePage("Overview");
      
      router.push('/dashboard');
    }
  },
  setup(props) {
    const isOpen = ref(props.show);
    const projectId = ref(props.projectId);
    const projectName = ref(props.projectName);

    const instance = getCurrentInstance();
    const speckleStore = useSpeckleStore();

    const closeModal = () => {
      isOpen.value = false;
      // Emit back to parent so it knows the modal has been closed and can open a new one
      instance?.emit('closeVersionModal');
    };

    // Return the extracted names from all available versions to be used in dropdown
    const extractNames = computed(() => {
      let versions: string[] = []

      speckleStore.getAllVersions?.forEach(item => {
        if (typeof item.name === 'string') {
          versions.push(item.name);
        }
      });
      return versions;
    });

    watch(() => props.show, (newValue) => {
      isOpen.value = newValue;
    });

    watch(() => props.projectName, (newValue) => {
      projectName.value = newValue;
    });
    
    watch(() => props.projectId, (newValue) => {
      projectId.value = newValue;
      speckleStore.updateProjectVersions(newValue, 100, null);
    });
    
    return {
      isOpen,
      projectId,
      projectName,
      speckleStore,
      extractNames,
      closeModal,
    }
  }
});

const open = ref(true)
</script>