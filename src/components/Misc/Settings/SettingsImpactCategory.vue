<template>
  <div>
     <h2 class="text-base/7 font-semibold text-gray-900">Impact category</h2>
     <p class="mt-1 text-sm/6 text-gray-500">Set what impact category you want to calculate for.</p>

     <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
      <div class="pt-6 sm:flex">
         <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Standard impactCategory</dt>
         <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <Dropdown
            :items="impactCategoryList"
            name="codes"
            :dropdownName="impactCategory"
            @selectedItem="handleSelectedItem"
          />
           <UpdateButton @click="updateImpactCategory" />
         </dd>
       </div>
     </dl>
   </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { extendedImpactCategoryKeys } from '@/models/material'

import type { ExtendedImpactCategoryKey } from '@/models/material'
import type { dropdownItem } from '@/components/Misc/Dropdown.vue'

import Dropdown from '@/components/Misc/Dropdown.vue'
import { storeToRefs } from 'pinia'

// TODO: Add general settings here!
export default defineComponent({
  name: 'SettingsImpactCategory',
  components: {
    Dropdown,
    // Local update button
    UpdateButton: defineComponent({
      name: 'UpdateButton',
      props: {
        label: {
          type: String,
          default: 'Update',
        },
      },
      setup(props, { emit }) {
        const handleClick = () => {
          emit('click')
        }

        return { handleClick }
      },
      template: `
        <button 
          type="button" 
          class="font-semibold text-green-600 hover:text-green-500"
          @click="handleClick"
        >
          {{ label }}
        </button>
      `,
    }),
  },
  setup() {
  const settingsStore = useSettingsStore()
  
  const { calculationSettings } = storeToRefs(settingsStore)
  const impactCategory = ref(settingsStore.calculationSettings.standardImpactCategory)

  const impactCategoryList: dropdownItem[] = []
  extendedImpactCategoryKeys.map((key) => {
    impactCategoryList.push({ name: key })
  })

  const updateImpactCategory = () => {
    settingsStore.updateStandardImpactCategory(impactCategory.value)
  }

  const handleSelectedItem = (selectedItem: dropdownItem) => {
    impactCategory.value = selectedItem.name as ExtendedImpactCategoryKey
  }
  
  watch(() => calculationSettings.value.standardImpactCategory, (newValue) => {
    impactCategory.value = newValue
  })

  return { 
    impactCategory,
    impactCategoryList,
    updateImpactCategory,
    handleSelectedItem
  }
  },
})
</script>