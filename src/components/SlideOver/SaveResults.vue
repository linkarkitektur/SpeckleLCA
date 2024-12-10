<template>

  <div
      class="flex relative h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl"
    >
      <div class="px-4 sm:px-6">
        <div class="flex items-start justify-between">
          <div class="text-base font-semibold leading-6 text-gray-900">
            Save Results
          </div>
          <div class="ml-3 flex h-7 items-center">
            <button
              type="button"
              class="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              @click="toggleSlideover()"
            >
              <span class="absolute -inset-2.5" />
              <span class="sr-only"> Close panel </span>
              <XMarkIcon class="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div class="relative mt-6 flex-1 p-4 sm:px-6 overflow-auto">
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
                      class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-600 sm:max-w-md"
                    >
                      <input 
                        type="text" 
                        name="name"
                        id="name" 
                        autocomplete="name" 
                        v-model="formData.name"
                        class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" 
                        placeholder="Run name" 
                        ref="nameInput"
                      />
                    </div>
                  </div>
                  <label 
                    for="name" 
                    class="block text-sm font-medium leading-6 text-gray-900 mt-6"
                  >
                    Included Results
                  </label>
                  <div class="ml-2">
                    <label v-for="category in formData.categories" :key="category.name" class="flex items-center space-x-2 ">
                      <input 
                        type="checkbox" 
                        class="h-4 w-4 pt-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        v-model="category.include" 
                      />
                      <span>{{ category.name }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div class="mt-6 flex items-center justify-end gap-x-6">
            <button 
              type="submit"
              class="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
  </div>
  </template>
  
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue'
  import { XMarkIcon } from '@heroicons/vue/24/outline'
  
  import { useProjectStore } from '@/stores/main'
  import { useNavigationStore } from '@/stores/navigation'
  import { useFirebaseStore } from '@/stores/firebase'

import { useResultStore } from '@/stores/result'
  
  export default defineComponent({
    name: 'SaveResults',
    components: {
      XMarkIcon,
    },
    setup() {
      const navStore = useNavigationStore()
      const projectStore = useProjectStore()
      const resultStore = useResultStore()
      const firebaseStore = useFirebaseStore()
      
      const toggleSlideover = () => {
        navStore.toggleSlideover()
      }
  
      const formData = ref({
        name: "",
        categories: [
          {
            name: "category",
            include: true,
          },
          {
            name: "material",
            include: true,
          },
          {
            name: "materialType",
            include: true,
          },
          {
            name: "BSABCodes",
            include: true,
          },
          {
            name: "speckleType",
            include: true,
          },
        ],

      })
  
      const nameInput = ref(null)
  
      const saveData = () => {
        const resultList = resultStore.resultList
        
        firebaseStore.addResultList(projectStore.currProject.id, resultList, formData.value.name)
        navStore.toggleSlideover()
      }
  
      return {
        toggleSlideover,
        saveData,
        formData,
        nameInput,
      }
    },
  })
  </script>