<template>
  <div class="rounded-2xl bg-gray-200 p-4">
    <div class="flex pb-2 justify-between items-center">
      <div class="flex">
        <button aria-label="Expand"
          class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
          @click="expandGroup">
            <ChevronDownIcon v-if="!expand" class="h-5 w-5" />
            <ChevronUpIcon v-if="expand" class="h-5 w-5" />
        </button>
      </div>
      <div class="flex items-center">
        <input v-if="editName" 
          v-model="inGroups.name" placeholder="edit me"
          @blur= "saveEdit"
          @keyup.enter = "saveEdit"/>
        <label v-else class="ml-2 text-gray-700 font-semibold font-sans tracking-wide">
          {{ inGroups.name }}
        </label>
      </div>
      <div class="flex">
        <button aria-label="Expand"
          class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
          @click="editName = !editName">
            <PencilSquareIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
    <div class="justify-between items-center">
      <div class="bg-gray-100 rounded-lg p-1 items-center">
        <table v-if="expand" class="w-full text-left">
          <thead class="text-sm">
            <tr>
              <th class="px-4">Name</th>
              <th>Elements</th>
            </tr>
          </thead>
          <tbody>
            <SubGroup v-if="expand && inGroups" :subGroup="inGroups" />
          </tbody>
        </table>
        <p class="text-center">{{ groups.objects }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref } from 'vue';
import { ChevronDownIcon, ChevronUpIcon, PencilSquareIcon } from '@heroicons/vue/24/solid';

import SubGroup from './SubGroup.vue';
import type { NestedGroup } from '@/utils/projectUtils';
import { useNavigationStore, useProjectStore } from '@/stores/main';

export default defineComponent ({
  name: "GroupCard",
  components: {
    SubGroup,
    ChevronDownIcon,
    ChevronUpIcon,
    PencilSquareIcon
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
    const projectStore = useProjectStore();
    const navStore = useNavigationStore();

    const inGroups = ref(props.groups);
    const expand = ref(false);
    const editName = ref(false);

    watch(() => props.groups, (newValue) => {
      inGroups.value = newValue;
    });

    const expandGroup = () => {
      expand.value = !expand.value;
      // Expand group logic here
    };
    
    const saveEdit =  () => {
      console.log("Editing name");
      editName.value = false;
      projectStore.updateProjectGroupName(inGroups.value.name);
    };

    return {
      expandGroup,
      saveEdit,
      editName,
      expand,
      inGroups,
    };
  }
});
</script>