<template>
  <tr class="text-sm leading-6 text-gray-900 border-b border-gray-300">
    <td :class="`flex px-${computedPadding}`">
      <p :class="`w-${computedPadding}`"></p>
      <button aria-label="Expand"
      class="p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800 w-5"
      @click="expandGroup">
        <ChevronDownIcon v-if="!expand && subGroup.children.length > 0" class="h-5 w-5" />
        <ChevronUpIcon v-if="expand && subGroup.children.length > 0" class="h-5 w-5" />
      </button>
      <p class="pl-2">{{ subGroup.name }}</p>
    </td>
    <td>
      <p>{{ subGroup.objects }}</p>
    </td>
  </tr>

  <!-- If we have children run it recursive -->
  <subGroup v-if="subGroup.children && subGroup.children.length && expand" v-for="child in subGroup.children" :subGroup="child" :depth="depth + 1" />
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import type { PropType } from 'vue';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/solid';
import type { GeometryObject } from '@/models/geometryObject';
import type { NestedGroup } from '@/utils/projectUtils';

export default defineComponent ({
  name: "subGroup",
  components: {
    ChevronDownIcon,
    ChevronUpIcon
  },
  props: {
    subGroup: {
      type: Object as () => NestedGroup,
      required: true,
    },
    depth: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const subGroup = ref(props.subGroup);
    const depth = ref(props.depth);
    const expand = ref(false);

    watch(() => props.subGroup, (newValue) => {
      subGroup.value = newValue;
    });

    const computedPadding = computed(() => {
      // Set a base padding value
      const basePadding = 4;
      // Increase padding for each level of recursion
      return basePadding * depth.value;
    });

    const expandGroup = () => {
      expand.value = !expand.value;
    };
    
    return {
      subGroup,
      expand,
      computedPadding,
      expandGroup
    }
  },
});
</script>