<template>
  <div class="space-y-12">
    <div class="pb-12">
      <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div class="sm:col-span-4">
          <InputText
            id="searchBar"
            v-model="formData.name"
            placeholder="Group name"
          />
        </div>
        <div class="sm:col-span-6 pb-4 border-b-2 border-black">
          <label 
            for="quanity" 
            class="block styled-header"
          >
            Quantities
          </label>
        </div>
        <div class="sm:col-span-2 sm:col-start-1">
          <label for="quanityM2" class="block styled-header">
            Area
          </label>
          <div class="mt-2">
            <InputText
              id="quantityM2"
              v-model="formData.M2"
              placeholder="0"
              type="number"
            />
          </div>
        </div>

        <div class="sm:col-span-2">
          <label for="quanityM2" class="block styled-header">
            Volume
          </label>
          <div class="mt-2">
            <InputText
              id="quantityM3"
              v-model="formData.M3"
              placeholder="0"
              type="number"
            />
          </div>
        </div>

        <div class="sm:col-span-2">
          <label for="quanityM2" class="block styled-header">
            Length
          </label>
          <div class="mt-2">
            <InputText
              id="quantityM"
              v-model="formData.M"
              placeholder="0"
              type="number"
            />
          </div>
        </div>
        <div class="sm:col-span-2 sm:col-start-1">
          <label for="quanityM2" class="block styled-header">
            Kilograms
          </label>
          <div class="mt-2">
            <InputText
              id="quantityKG"
              v-model="formData.KG"
              placeholder="0"
              type="number"
            />
          </div>
        </div>

        <div class="sm:col-span-2">
          <label for="quanityM2" class="block styled-header">
            Tones
          </label>
          <div class="mt-2">
            <InputText
              id="quantityTONES"
              v-model="formData.TONES"
              placeholder="0"
              type="number"
            />
          </div>
        </div>

        <div class="sm:col-span-2">
          <label for="quanityM2" class="block styled-header">
            Pieces
          </label>
          <div class="mt-2">
            <InputText
              id="quantityPCS"
              v-model="formData.PCS"
              placeholder="0"
              type="number"
            />
          </div>
        </div>
      </div>

      <!-- New drop zone for linking a group -->
      <div class="sm:col-span-6 my-4 p-4 border-dashed border-2 border-green-600 text-center"
        @dragover.prevent
        @drop="handleDrop"
      >
        <p v-if="!linkedGroup">
          Drag and drop a group here to link its area.
        </p>
        <p v-else>
          Linked Group: {{ linkedGroup.name }} (Area: {{ linkedArea }})
        </p>
      </div>

      <!-- New percentage input -->
      <div class="sm:col-span-6">
        <label for="percentage" class="block styled-header">
          Percentage (%)
        </label>
        <div class="mt-2">
          <InputText
            id="percentage"
            v-model.number="percentage"
            placeholder="Enter percentage"
            type="number"
          />
        </div>
      </div>

    </div>
  </div>

  <div class="mt-6 flex items-center justify-end gap-x-6">
    <ActionButton
      text="Cancel"
      @on-click="navStore.toggleSlideover"
    />
    <ActionButton
      text="Save"
      @on-click="saveData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import { useProjectStore } from '@/stores/projectStore'
import { useNavigationStore } from '@/stores/navigationStore'
import type { Group } from '@/models/filterModel'
import type { GeometryObject } from '@/models/geometryModel'
import InputText from '../Base/InputText.vue'
import ActionButton from '../Base/ActionButton.vue'

const navStore = useNavigationStore()
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

// New state for tracking a dragged group and percentage value
const linkedGroup = ref<Group | null>(null)
const percentage = ref(0)

// Compute total area from the linked group via its objects, if available.
const linkedArea = computed(() => {
  if (linkedGroup.value && linkedGroup.value.elements) {
    return linkedGroup.value.elements
      .map(obj => obj.quantity?.m2 || 0)
      .reduce((a, b) => a + b, 0)
  }
  return 0
})

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  try {
    // Assume that the GroupCard component sets the group data via JSON
    const data = event.dataTransfer?.getData('application/json')
    if (data) {
      const group = JSON.parse(data)
      // Set the dropped group as the linkedGroup.
      linkedGroup.value = group
      // Calculate total area from the group's objects and update the Area field.
      const totalArea = (group.objects || [])
        .map((obj: any) => obj.quantity?.m2 || 0)
        .reduce((a: number, b: number) => a + b, 0)
      formData.value.M2 = totalArea
    }
  } catch (err) {
    console.error('Error handling drop:', err)
  }
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
  navStore.toggleSlideover()
}
</script>