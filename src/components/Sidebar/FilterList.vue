<template>
  <nav class="flex flex-1 flex-col pt-4">
    <div class="relative h-12">
        <button aria-label="Expand"
          class="absolute flex top-0 right-0 p-1 focus:outline-none focus:shadow-outline text-gray-700 hover:text-gray-800"
          @click="editGroup">
            <p>Edit filters</p> 
            <PencilSquareIcon class="ml-2 h-5 w-5" />
        </button>
    </div>
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
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Draggable from 'vuedraggable'
import { PencilSquareIcon } from '@heroicons/vue/24/solid';

import GroupCard from '@/components/Sidebar/GroupCard.vue'

import { useProjectStore, useNavigationStore } from '@/stores/main'
import { FilterRegistry, createStandardFilters } from '@/models/filters'
import type { Group } from '@/models/filters'
import type { NestedGroup } from '@/utils/projectUtils'
import type { FilterList } from '@/models/filters'
import type { GeometryObject } from '@/models/geometryObject'

export default defineComponent({
  name: "Sidebar",
  components: {
    PencilSquareIcon,
    Draggable,
    GroupCard,
  },
  setup() {
    const projectstore = useProjectStore(); 
    const navStore = useNavigationStore();

    const editGroup =  () => {
      console.log("Editing Group information");
      navStore.toggleSlideover();
      console.log(navStore.slideoverOpen);
      // Open editGroup slideout here
    };

    //Create new filterregistry, maybe store this in the projectStore?
    const exampleRegistry = new FilterRegistry();
    createStandardFilters(exampleRegistry);

    //We use filterlists to create the tree
    const testFilters: FilterList = {
      name: "testFiltering",
      filters: [
        {
          name: "groupByFilter",
          field: "speckle_type"
        },
        {
          name: "groupByFilter",
          field: "speckle_type"
        },
      ]
    }

    //Create geometry objects from the project
    let geo: GeometryObject[] = []
    projectstore.currProject?.geometry.forEach(element => {
      geo.push(element);
    });

    //Root for the group, this should not be needed
    let groups : Group[] = [{
      id: "test",
      name: "root",
      path: ["root"],
      elements: geo
    }]

    //Go through each filters and iterate over them
    testFilters.filters.forEach(el => {
      if (el.value) {
        groups = exampleRegistry.callFilter(`${el.name}`, groups, `${el.field}`, `${el.value}`);
      } else {
        groups = exampleRegistry.callFilter(`${el.name}`, groups, `${el.field}`);
      }
    })

    //Remove root in path since we had to add it 
    groups.forEach(element => {
      element.path.splice(0, 1);
    });

    groups.sort((a, b) => b.elements.length - a.elements.length);

    //Update groups and make a tree structure from them
    projectstore.updateProjectGroups(groups);
    const tree: NestedGroup[] | undefined = projectstore.getGroupTree()?.children;
    const refTree = ref(tree);

    return {
      refTree,
      editGroup,
    };
  }
  
});
</script>