<template>
  <div class="space-y-12">
    <div class="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
			<ActionButton
				text="Delete"
				@on-click="deleteData"
			/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { useFirebaseStore } from '@/stores/firebaseStore'
import type { Filter, FilterList } from '@/models/filterModel'
import InputText from '@/components/Base/InputText.vue'
import ActionButton from '@/components/Base/ActionButton.vue'

const navStore = useNavigationStore()
const projectStore = useProjectStore()
const firebaseStore = useFirebaseStore()

const formData = ref({
  name: projectStore.filterRegistry.filterList.name || ""
})

const saveData = () => {
  const filters: Filter[] = projectStore.getRegistryStack()
  const filterList: FilterList = {
    id: crypto.randomUUID(),
    name: formData.value.name,
    callStack: filters,
    customGeo: projectStore.filterRegistry.filterList.customGeo
  }
  firebaseStore.addFilterList(projectStore.currProject.id, filterList, formData.value.name)
  navStore.toggleSlideover()
}

const deleteData = () => {
	console.log('FILTERS', projectStore.filterRegistry.filterList.name)
	console.log("Delete Data")
}

</script>