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
import { defineComponent, ref, onMounted, watch } from 'vue'
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
  name: "FilterList",
  components: {
    PencilSquareIcon,
    Draggable,
    GroupCard,
  },
  setup() {
    const projectstore = useProjectStore() 
    const navStore = useNavigationStore()

    const refTree = ref<NestedGroup[]>([])

    const editGroup = () => {
      console.log("Editing Group information");
      navStore.toggleSlideover();
      console.log(projectstore.filterRegistry?.filterCallStack);
      // Open editGroup slideout here
    };

    onMounted(() => {
      setStandardFilters()
      calcList()
    })

    watch(() => projectstore.filterRegistry?.filterCallStack, () => {
      console.log("updated filterCallStack")
      calcList()
    })

    /**
     * Set the standard filters for the project, this is mostly for testing
     * should be a popup or something better later on
     */
    const setStandardFilters = () => {
      //Create new filterregistry, maybe store this in the projectStore?
      const exampleRegistry = new FilterRegistry()
      createStandardFilters(exampleRegistry)

      //We use filterlists to create the tree
      const testFilters: FilterList = {
        name: "testFiltering",
        callStack: [
          {
            name: "groupByFilter",
            field: "category"
          },
          {
            name: "groupByFilter",
            field: "family"
          },
        ]
      }

      exampleRegistry.filterCallStack = testFilters
      projectstore.setFilterRegistry(exampleRegistry)
    } 

    /**
     * Calculate the list, this is triggered onMounted but can be manually triggered on updates
     */
    const calcList = () => {
      //Create geometry objects from the project
      let geo: GeometryObject[] = []
      projectstore.currProject?.geometry.forEach(element => {
        geo.push(element)
      })

      //Root for the group, this should not be needed
      let groups : Group[] = [{
        id: "test",
        name: "root",
        path: ["root"],
        elements: geo
      }]

      //Go through each filter and iterate over them
      projectstore.filterRegistry?.filterCallStack.callStack.forEach(el => {
        if (el.value) {
          groups = projectstore.filterRegistry?.callFilter(`${el.name}`, groups, `${el.field}`, `${el.value}`);
        } else {
          groups = projectstore.filterRegistry?.callFilter(`${el.name}`, groups, `${el.field}`);
        }
      })

      //Remove root in path since we had to add it 
      groups.forEach(element => {
        element.path.splice(0, 1);
      })

      groups.sort((a, b) => b.elements.length - a.elements.length)

      //Update groups and make a tree structure from them
      projectstore.updateProjectGroups(groups);
      const tree: NestedGroup[] | undefined = projectstore.getGroupTree()?.children;
      if(tree) {
        tree.sort((a, b) => b.objects - a.objects)
        refTree.value = tree
      }
    }
    
    return {
      refTree,
      editGroup,
    };
  }
  
});
</script>