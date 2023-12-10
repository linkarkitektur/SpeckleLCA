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
        <p class="ml-2 text-gray-700 font-semibold font-sans tracking-wide">
          {{ inGroups.name }}
        </p>
      </div>
      <div class="flex">
        <button aria-label="Expand"
          class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
          @click="editGroup">
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
        <!-- div version
        <div v-if="expand" class="px-2 py-2 rounded-lg outline outline-gray-400">
          <SubGroup v-if="tree && expand" :subGroup="tree" />
        </div>
        -->
        <p class="text-center">{{ 10 }}</p>
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

    watch(() => props.groups, (newValue) => {
      inGroups.value = newValue;
    });

    const expandGroup = () => {
      expand.value = !expand.value;
      // Expand group logic here
    };

    const editGroup =  () => {
      console.log("Editing Group information");
      navStore.toggleSlideover();
      console.log(navStore.slideoverOpen);
      // Open editGroup slideout here
    };

    return {
      expandGroup,
      editGroup,
      expand,
      inGroups,
    };
  }
});
</script>