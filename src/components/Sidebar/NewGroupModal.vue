<template>
  <TransitionRoot as="template" :show="groupModalOpen">
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
                      Create new group
                    </h2>
                    <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div class="sm:col-span-4">
                        <label 
                          for="groupName" 
                          class="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Group name
                        </label>
                        <div class="mt-2">
                          <div 
                            class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-600 sm:max-w-md"
                          >
                            <input 
                              type="text" 
                              name="groupName"
                              v-model="formData.name" 
                              id="groupName" 
                              autocomplete="groupName" 
                              class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" 
                              placeholder="Enter group here" 
                            />
                            
                          </div>
                        </div>
                      </div>
                      <div class="sm:col-span-6 pb-4 border-b">
                        <label 
                          for="quanity" 
                          class="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Quantities
                        </label>
                      </div>
                      <div class="sm:col-span-2 sm:col-start-1">
                        <label for="quanityM2" class="block text-sm font-medium leading-6 text-gray-900">
                          Area
                        </label>
                        <div class="mt-2">
                          <input 
                            type="number" 
                            name="quantityM2" 
                            v-model="formData.M2" 
                            id="quantityM2" 
                            autocomplete="m2"
                            placeholder="0"  
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6" 
                          />
                        </div>
                      </div>

                      <div class="sm:col-span-2">
                        <label for="quanityM2" class="block text-sm font-medium leading-6 text-gray-900">
                          Volume
                        </label>
                        <div class="mt-2">
                          <input 
                            type="number" 
                            name="quantityM3"
                            v-model="formData.M3"  
                            id="quantityM3" 
                            autocomplete="m3"
                            placeholder="0" 
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6" 
                          />
                        </div>
                      </div>

                      <div class="sm:col-span-2">
                        <label for="quanityM2" class="block text-sm font-medium leading-6 text-gray-900">
                          Length
                        </label>
                        <div class="mt-2">
                          <input 
                            type="number" 
                            name="quantityM" 
                            v-model="formData.M" 
                            id="quantityM" 
                            autocomplete="m"
                            placeholder="0" 
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6" 
                          />
                        </div>
                      </div>
                      <div class="sm:col-span-2 sm:col-start-1">
                        <label for="quanityM2" class="block text-sm font-medium leading-6 text-gray-900">
                          Kilograms
                        </label>
                        <div class="mt-2">
                          <input 
                            type="number" 
                            name="quantityKG" 
                            v-model="formData.KG" 
                            id="quantityKG" 
                            autocomplete="kg"
                            placeholder="0"  
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6" 
                          />
                        </div>
                      </div>

                      <div class="sm:col-span-2">
                        <label for="quanityM2" class="block text-sm font-medium leading-6 text-gray-900">
                          Tones
                        </label>
                        <div class="mt-2">
                          <input 
                            type="number" 
                            name="quantityTONES" 
                            v-model="formData.TONES"
                            id="quantityTONES" 
                            autocomplete="tones"
                            placeholder="0" 
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6" 
                          />
                        </div>
                      </div>

                      <div class="sm:col-span-2">
                        <label for="quanityM2" class="block text-sm font-medium leading-6 text-gray-900">
                          Pieces
                        </label>
                        <div class="mt-2">
                          <input 
                            type="number" 
                            name="quantityPCS" y
                            v-model="formData.PCS"
                            id="quantityPCS" 
                            autocomplete="pieces"
                            placeholder="0" 
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6" 
                          />
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
                    class="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
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
import { defineComponent, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'
import type { Group } from '@/models/filters'
import type { GeometryObject } from '@/models/geometryObject'

export default defineComponent({
  name: 'NewGroupModal',
  components: {
    ProjectDialog: Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
  },
  // TODO This should maybe all be in the navigation store instead? @fabianlinkflink, yes I think that would be much better, otherwise the props could be inspected during transition.
  setup() {
    const navStore = useNavigationStore()
    const { groupModalOpen} = storeToRefs(navStore)

    const projectStore = useProjectStore()
    const formData = ref({
      name: "",
      M: 0,
      M2: 0,
      M3: 0,
      KG: 0,
      TONES: 0,
      PCS: 0,
    })
    
    const closeModal = () => {
      navStore.toggleGroupModal()
    }

    const saveData = () => {
      //Create a new geometry object which we append all the quantities to
      const geoObj: GeometryObject = {
        id: crypto.randomUUID(),
        name: formData.value.name,
        quantity: {
          m: formData.value.M,
          m2: formData.value.M2,
          m3: formData.value.M3,
          kg: formData.value.KG,
          tonnes: formData.value.TONES,
          pcs: formData.value.PCS,
          l: 0,
        },
        parameters: {
          name: formData.value.name,
          type: "Manually added",
          area: formData.value.M2.toString(),
          volume: formData.value.M3.toString(),
          length: formData.value.M.toString()
        }
      }

      const groupData: Group = {
        name: formData.value.name,
        id: crypto.randomUUID(),
        path: [formData.value.name],
        elements: [geoObj]
      }

      //Clear form data after saving
      formData.value = {
        name: "",
        M: 0,
        M2: 0,
        M3: 0,
        KG: 0,
        TONES: 0,
        PCS: 0,
      }

      projectStore.addGroup(groupData)
      navStore.toggleGroupModal()
    }

    return {
      groupModalOpen,
      formData,
      saveData,
      closeModal,
    }
  },
})
</script>