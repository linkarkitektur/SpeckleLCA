<template>
  <div 
    tabindex="0"
    id="groupCard"
    class="focus:outline-none"
    :class="{
      'rounded-2xl bg-gray-200 p-4 ring-1 ring-gray-400' : selectedBool, 
      'rounded-2xl bg-gray-200 p-4' : selectedBool == false,
    }"
    :style="activePage == 'Overview' && !renderMode ? { 'background-color': inGroups.color } : {}"
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
        <input v-if="inGroups.id === editName" 
          v-model="inGroups.name" placeholder="edit me"
          @blur= "saveEdit"
          @keyup.enter = "saveEdit"/>
        <label 
          v-else 
          id="groupName"
          class="ml-2 text-gray-700 font-semibold font-sans tracking-wide hover:underline"
          @click="selectSubGroup(inGroups, $event)"
        >
          {{ inGroups.name }}
        </label>
      </div>
      <div class="flex">
        <component :is="currIconAction" :groups="inGroups" />
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
          v-if="inGroups.id === editName"
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
import OverviewIconAction from '@/components/Sidebar/Overview/OverviewIconAction.vue'
import MaterialGroupCard from '@/components/Sidebar/Mapping/MaterialGroupCard.vue'
import MaterialIconAction from '@/components/Sidebar/Mapping/MaterialIconAction.vue'
import ResultIconAction from '@/components/Sidebar/Results/ResultIconAction.vue'
import ResultsGroupCard from '@/components/Sidebar/Results/ResultsGroupCard.vue'

import type { NestedGroup } from '@/models/filters'
import { useProjectStore } from '@/stores/main'
import { useNavigationStore } from '@/stores/navigation'
import { useSpeckleStore } from '@/stores/speckle'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'GroupCard',
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
    const { editName, activePage } = storeToRefs(navStore)
    const { renderMode } = storeToRefs(useSpeckleStore())
    const { selectedGroup } = storeToRefs(projectStore)

    watch(
      () => props.groups,
      (newValue) => {
        inGroups.value = newValue
      }
    )
    
    const selectedBool = computed(() => {
      if (selectedGroup.value) {
        return inGroups.value.id === selectedGroup.value.id
      } else {
        return false
      }
    })

    // Name to show in table for each group and subgroup
    const currGroupValue = computed(() => {
      if (navStore.activePage === "Overview")
        return "Elements"
      else if (navStore.activePage === "Mapping")
        return "Material"
      else if (navStore.activePage === "Results")
        return "Co<sup>2<sup>"
      else if (navStore.activePage === "Benchmark")
        return "Co<sup>2<sup>"
      else
        return null
    })

    // Total value to be shown for each group
    const currGroupTotal = computed(() => {
      if (navStore.activePage === "Overview")
        return OverviewGroupCard
      else if (navStore.activePage === "Mapping")
        return MaterialGroupCard
      else if (navStore.activePage === "Results")
        return ResultsGroupCard
      else if (navStore.activePage === "Benchmark")
        return null
      else
        return null
    })

    const currIconAction = computed(() => {
      if (navStore.activePage === "Overview")
        return OverviewIconAction
      else if (navStore.activePage === "Mapping")
        return MaterialIconAction
      else if (navStore.activePage === "Results")
        return ResultIconAction
      else if (navStore.activePage === "Benchmark")
        return null;
      else
        return null;
    })

    const selectSubGroup = (subGroup: NestedGroup, event: MouseEvent): void => {
      const target = event.target as HTMLElement
      if (target.id === 'groupCard' || target.id === 'groupName' || target.id === 'cardAction') {
        projectStore.setSelectedGroup(subGroup)
      }
    }

    const expandGroup = () => {
      expand.value = !expand.value
      // Expand group logic here
    }
    
    const saveEdit =  () => {
      editName.value = null
      projectStore.updateGroupName(inGroups.value.name, inGroups.value.id)
    }

    const removeGroup = () => {
      editName.value = null
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
      currIconAction,
      selectedBool,
      activePage,
      renderMode
    }
  },
})
</script>