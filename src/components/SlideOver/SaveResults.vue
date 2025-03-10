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
                placeholder="Run name" 
              />
            </div>
          </div>
          
          <label 
            for="categories" 
            class="block styled-text normal-case mt-6"
          >
            Included Results
          </label>
          <div class="ml-2">
            <label 
              v-for="category in formData.categories" 
              :key="category.name" 
              class="flex items-center space-x-2"
            >
              <CheckBox
                :name="category.name"
                :id="category.name"
                :checked="category.include"
                @update:checked="(newVal) => category.include = newVal"
              />
              <span class="styled-text">{{ category.name }}</span>
            </label>
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
import { useResultStore } from '@/stores/result'
import InputText from '@/components/Base/InputText.vue'
import CheckBox from '@/components/Base/CheckBox.vue'
import ActionButton from '@/components/Base/ActionButton.vue'

const navStore = useNavigationStore()
const projectStore = useProjectStore()
const resultStore = useResultStore()
const firebaseStore = useFirebaseStore()

const formData = ref({
  name: "",
  categories: [
    { name: "category", include: true },
    { name: "material", include: true },
    { name: "materialType", include: true },
    { name: "BSABCodes", include: true },
    { name: "speckleType", include: true },
  ]
})

const saveData = () => {
  const resultList = resultStore.resultList
  firebaseStore.addResultList(projectStore.currProject.id, resultList, formData.value.name)
  navStore.toggleSlideover()
}
</script>