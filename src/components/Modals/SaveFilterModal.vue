<template>
  <TransitionRoot as="template" :show="saveModalOpen">
    <ProjectDialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6"
            >
              <form @submit.prevent="saveData">
                <div class="space-y-12">
                  <div class="border-b border-gray-900/10 pb-12">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">
                      Save to firebase
                    </h2>
                    <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div class="sm:col-span-4">
                        <label 
                          for="name" 
                          class="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Name
                        </label>
                        <div class="mt-2">
                          <div 
                            class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md"
                          >
                            <input 
                              type="text" 
                              name="name"
                              id="name" 
                              autocomplete="name" 
                              v-model="formData.name"
                              class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" 
                              placeholder="Name" 
                              ref="nameInput"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-6 flex items-center justify-end gap-x-6">
                  <button 
                    type="button"
                    class="text-sm font-semibold leading-6 text-gray-900"
                    @click="closeModal"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    @click="saveData"
                  >
                    Save
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </ProjectDialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

import { useNavigationStore, useProjectStore } from '@/stores/main'
import { useFirebaseStore } from '@/stores/firebase'
import type { Filter, FilterList } from '@/models/filters'

export default defineComponent({
  name: 'NewGroupModal',
  components: {
    ProjectDialog: Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
  },
  setup() {
    const navStore = useNavigationStore()
    const projectStore = useProjectStore()
    const firebaseStore = useFirebaseStore()

    const { saveModalOpen} = storeToRefs(navStore)
    
    const formData = ref({
      name: ""
    })

    const nameInput = ref(null)

    const closeModal = () => {
      navStore.toggleSaveModal()
    }

    const saveData = () => {
      const filters: Filter[] = projectStore.getRegistryStack()
      const filterList: FilterList = {
        id: crypto.randomUUID(),
        name: formData.value.name,
        callStack: filters
      }
      firebaseStore.addFilterList(projectStore.currProject.id, filterList, formData.value.name)
      navStore.toggleSaveModal()
    }

    // Focus the input when the modal opens
    const openModal = () => {
      navStore.toggleSaveModal()
      nextTick(() => {
        nameInput.value?.focus()
      })
    }

    return {
      saveModalOpen,
      saveData,
      closeModal,
      formData,
      nameInput,
      openModal
    }
  },
})
</script>