<template>
  <div 
    tabindex="0"
    id="groupCard"
    class="rounded-2xl bg-gray-200 p-4 focus:ring-1 focus:ring-gray-400"
    @click="selectSubGroup(inGroups, $event)"
  >
    <div class="flex pb-2 justify-between items-center">
      <div class="flex">
        <button
          aria-label="Expand"
          class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
          @click="expandGroup"
        >
          <ChevronDownIcon v-if="!expand" class="h-5 w-5" />
          <ChevronUpIcon v-if="expand" class="h-5 w-5" />
        </button>
      </div>
      <div class="flex items-center">
        <input v-if="editName" 
          v-model="inGroups.name" placeholder="edit me"
          @blur= "saveEdit"
          @keyup.enter = "saveEdit"/>
        <label 
          v-else 
          id="groupName"
          class="ml-2 text-gray-700 font-semibold font-sans tracking-wide"
          @click="selectSubGroup(inGroups, $event)"
        >
          {{ inGroups.name }}
        </label>
      </div>
      <div class="flex">
        <button
          aria-label="Expand"
          class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
          @click="editName = !editName"
        >
            <PencilSquareIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
    <div class="justify-between items-center">
      <div class="bg-gray-100 rounded-lg p-1 items-center max-w-full overflow-x-auto">
        <table v-if="expand" class="w-full text-left table-auto">
          <thead class="text-sm">
            <tr>
              <th class="px-4 w-2/3">Name</th>
              <th class="w-1/3">{{ currGroupValue }}</th>
            </tr>
          </thead>
          <tbody>
            <SubGroup v-if="expand && inGroups" :subGroup="inGroups" />
          </tbody>
        </table>
        <component :is="currGroupTotal" :groups="inGroups" />
      </div>
      <div class="flex items-center justify-center">
        <button
          v-if="editName"
          aria-label="Remove filter"
          class="pt-2 text-center focus:outline-none focus:shadow-outline text-red-600 hover:text-red-500"
          @click="removeGroup"
        >
          <MinusCircleIcon class="h-6 w-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilSquareIcon,
  MinusCircleIcon,
} from '@heroicons/vue/24/solid'

import SubGroup from '@/components/Sidebar/SubGroup.vue'
import OverviewGroupCard from '@/components/Sidebar/Overview/OverviewGroupCard.vue'

import type { NestedGroup } from '@/models/filters'
import { useNavigationStore, useProjectStore } from '@/stores/main'

export default defineComponent({
  name: 'OverviewGroupCard',
  components: {
    SubGroup,
    OverviewGroupCard,
    ChevronDownIcon,
    ChevronUpIcon,
    PencilSquareIcon,
    MinusCircleIcon
  },
  props: {
    /**
     * Array of groups to show in the card, they should all share a top level to show
     */
    groups: {
      type: Object as () => NestedGroup,
      required: true,
    },
  },
  setup(props) {
    const projectStore = useProjectStore()
    const navStore = useNavigationStore()

    const inGroups = ref(props.groups)
    const expand = ref(false)
    const editName = ref(false)

    watch(
      () => props.groups,
      (newValue) => {
        inGroups.value = newValue
      }
    )

    // Name to show in table for each group and subgroup
    const currGroupValue = computed(() => {
      if (navStore.activePage === "Overview")
        return "Elements";
      else if (navStore.activePage === "Mapping")
        return "Material";
      else if (navStore.activePage === "Results")
        return "Co<sup>2<sup>";
      else if (navStore.activePage === "Benchmark")
        return "Co<sup>2<sup>";
      else
        return null;
    })

    // Total value to be shown for each group
    const currGroupTotal = computed(() => {
      if (navStore.activePage === "Overview")
        return OverviewGroupCard;
      else if (navStore.activePage === "Mapping")
        return null;
      else if (navStore.activePage === "Results")
        return null;
      else if (navStore.activePage === "Benchmark")
        return null;
      else
        return null;
    });

    const selectSubGroup = (subGroup: NestedGroup, event: MouseEvent): void => {
      const target = event.target as HTMLElement
      if (target.id === 'groupCard' || target.id === 'groupName')
        projectStore.setSelectedGeometry(subGroup.objects)
    }

    const expandGroup = () => {
      expand.value = !expand.value
      // Expand group logic here
    }
    
    const saveEdit =  () => {
      editName.value = false
      projectStore.updateGroupName(inGroups.value.name, inGroups.value.id)
    }

    const removeGroup = () => {
      editName.value = false
      projectStore.removeGroup(inGroups.value.id)
    }

    return {
      expandGroup,
      saveEdit,
      removeGroup,
      selectSubGroup,
      editName,
      expand,
      inGroups,
      currGroupValue,
      currGroupTotal,
    }
  },
})
</script>
