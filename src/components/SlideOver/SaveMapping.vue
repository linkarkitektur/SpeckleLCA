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
                placeholder="Mapping name" 
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
import { useMaterialStore } from '@/stores/material'
import { useFirebaseStore } from '@/stores/firebase'
import type { Mapping } from '@/models/material'
import InputText from '../Base/InputText.vue'
import ActionButton from '../Base/ActionButton.vue'

const navStore = useNavigationStore()
const projectStore = useProjectStore()
const materialStore = useMaterialStore()
const firebaseStore = useFirebaseStore()

const formData = ref({
  name: ""
})

const saveData = () => {
  const mapping: Mapping = materialStore.getCurrentMapping()
  firebaseStore.addMapping(projectStore.currProject.id, mapping, formData.value.name)
  navStore.toggleSlideover()
}
</script>