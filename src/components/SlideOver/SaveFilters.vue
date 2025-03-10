<template>
  <form @submit.prevent="saveData">
    <div class="space-y-12">
      <h2 class="styled-header">
        Save to firebase
      </h2>
      <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div class="sm:col-span-4">
          <label 
            for="name" 
            class="block styled-text normal-case"
          >
            Name
          </label>
          <div class="mt-2">
            <div class="flex">
              <InputText 
                id="name" 
                v-model="formData.name"
                placeholder="Filter name" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-start gap-x-6">
      <ActionButton
        text="Save"
        @on-click="saveData"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'
import { useFirebaseStore } from '@/stores/firebase'
import type { Filter, FilterList } from '@/models/filters'
import InputText from '@/components/Base/InputText.vue'
import ActionButton from '@/components/Base/ActionButton.vue'

const navStore = useNavigationStore()
const projectStore = useProjectStore()
const firebaseStore = useFirebaseStore()

const formData = ref({
  name: ""
})

const saveData = () => {
  const filters: Filter[] = projectStore.getRegistryStack()
  const filterList: FilterList = {
    id: crypto.randomUUID(),
    name: formData.value.name,
    callStack: filters
  }
  firebaseStore.addFilterList(projectStore.currProject.id, filterList, formData.value.name)
  navStore.toggleSlideover()
}
</script>