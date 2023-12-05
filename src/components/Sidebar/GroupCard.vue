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
          {{ inGroup.name }}
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
            <SubGroup v-if="expand" :subGroup="tree" />
          </tbody>
        </table>
        <!-- div version
        <div v-if="expand" class="px-2 py-2 rounded-lg outline outline-gray-400">
          <SubGroup v-if="tree && expand" :subGroup="tree" />
        </div>
        -->
        <p class="text-center">{{ tree.elements }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref } from 'vue';
import { ChevronDownIcon, ChevronUpIcon, PencilSquareIcon } from '@heroicons/vue/24/solid';

import SubGroup, { type SubChild } from './SubGroup.vue';
import type { Group } from '@/models/filters';

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
     group: {
      type: Object as () => Group,
      required: true,
    },
  },
  setup(props) {
    const inGroup = ref(props.group);

    const expand = ref(false);

    watch(() => props.group, (newValue) => {
      inGroup.value = newValue;
    });
    
    const tree: SubChild = {
      label: "A cool folder",
      elements: 100,
      children: [
        {
          label: "A cool sub-folder 1",
          elements: 75,
          children: [
            { label: "A cool sub-sub-folder 1", elements: 25 },
            { label: "A cool sub-sub-folder 2", elements: 50 }
          ]
        },
        { label: "This one is not that cool", elements: 25 }
      ]
    }

    const expandGroup = () => {
      expand.value = !expand.value;
      // Expand group logic here
    };

    const editGroup =  () => {
      console.log("Editing Group information");
      // Open editGroup slideout here
    };

    return {
      expandGroup,
      editGroup,
      expand,
      tree,
      inGroup,
    };
  }
});
</script>