<template>
  <div class="fixed inset-y-0 z-40 flex w-96 flex-col">
    <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pt-20">
      <nav class="flex flex-1 flex-col pt-4">
        <Draggable
          v-if="refTree"
          :list="refTree"
          :group="refTree"
          item-key="id"
          ghost-class="ghost"
          :animation="200">
          <template #item="{ element }">
            <div class="pt-4 pb-4">
              <GroupCard class="hover:cursor-move" :groups='element' />
            </div>
          </template>
        </Draggable>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import Draggable from 'vuedraggable'

import GroupCard from '@/components/Sidebar/GroupCard.vue'

import { useProjectStore } from '@/stores/main'
import type { Group } from '@/models/filters'
import type { NestedGroup } from '@/utils/projectUtils'

export default defineComponent({
  name: "Sidebar",
  components: {
    Draggable,
    GroupCard,
  },
  setup() {
    const projectstore = useProjectStore(); 

    const testGroups: Group[] = [
      {
        id: "testId1",
        name: "testName1",
        path: "parent1/child1",
        elements: [],
      },
      {
        id: "testId2",
        name: "testName2",
        path: "parent1/child2",
        elements: [],
      },
      {
        id: "testId3",
        name: "testName3",
        path: "parent2/child3",
        elements: [],
      },
      {
        id: "testId4",
        name: "testName4",
        path: "parent2/child3",
        elements: [],
      },
      {
        id: "testId5",
        name: "testName5",
        path: "parent3/child4",
        elements: [],
      },
    ];
    
    projectstore.updateProjectGroups(testGroups);

    const tree: NestedGroup[] | undefined = projectstore.getGroupTree()?.children;
    const refTree = ref(tree);

    const LogTree = () => {
      console.log(tree);
    }

    return {
      LogTree,
      refTree,
    };
  }
  
});

</script> 

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>