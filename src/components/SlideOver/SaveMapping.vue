<template>

<div
		class="flex relative h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl"
	>
		<div class="px-4 sm:px-6">
			<div class="flex items-start justify-between">
				<div class="text-base font-semibold leading-6 text-gray-900">
					Save Mapping
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
            type="submit"
            class="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            @click="saveData"
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

import { useNavigationStore, useProjectStore } from '@/stores/main'
import { useMaterialStore } from '@/stores/material'
import { useFirebaseStore } from '@/stores/firebase'
import { Mapping } from '@/models/material'

export default defineComponent({
  name: 'SaveMapping',
  components: {
    XMarkIcon,
  },
  setup() {
    const navStore = useNavigationStore()
    const projectStore = useProjectStore()
    const materialStore = useMaterialStore()
    const firebaseStore = useFirebaseStore()
    
    const toggleSlideover = () => {
      navStore.toggleSlideover()
    }

    const formData = ref({
      name: ""
    })

    const nameInput = ref(null)

    const saveData = () => {
      const mapping: Mapping = materialStore.getCurrentMapping()

      firebaseStore.addMapping(projectStore.currProject.id, mapping, formData.value.name)
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