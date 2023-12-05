<template>
  <div class="fixed inset-y-0 z-40 flex w-96 flex-col">
    <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pt-20">
      <nav class="flex flex-1 flex-col pt-6">
        <Draggable
          item-key="id"
          :list="testGroups"
          ghost-class="ghost"
          :animation="200">
          <template #item="{ element }">
            <div class="pt-4 pb-4">
              <GroupCard class="hover:cursor-move" :group='element' />
            </div>
          </template>
        </Draggable>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { defineComponent, ref, computed, onMounted } from 'vue'
import Draggable from 'vuedraggable'

import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import GroupCard from '@/components/Sidebar/GroupCard.vue'

import { useSpeckleStore } from '@/stores/speckle'
import { useProjectStore } from '@/stores/main'
import type { Group } from '@/models/filters'

export default defineComponent({
  name: "Sidebar",
  components: {
    Dialog,
    DialogPanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    TransitionChild,
    TransitionRoot,
    GroupCard,
    Draggable,
    Bars3Icon,
    BellIcon,
    CalendarIcon,
    ChartPieIcon,
    Cog6ToothIcon,
    DocumentDuplicateIcon,
    FolderIcon,
    HomeIcon,
    UsersIcon,
    XMarkIcon,
    ChevronDownIcon, 
    MagnifyingGlassIcon,
  },
  setup() {
    const speckleStore = useSpeckleStore();
    const projectstore = useProjectStore(); 

    const testGroups: Group[] = [
      {
        id: "testId1",
        name: "testName1",
        path: "test1/test1",
        elements: [],
      },
      {
        id: "testId2",
        name: "testName2",
        path: "test1/test2",
        elements: [],
      },
      {
        id: "testId3",
        name: "testName3",
        path: "test2/test1",
        elements: [],
      },
      {
        id: "testId4",
        name: "testName4",
        path: "test2/test2",
        elements: [],
      },
      {
        id: "testId5",
        name: "testName5",
        path: "test3/test1",
        elements: [],
      },
    ];

    const speckleLogin = () => {
      speckleStore.login();
    }

    const speckleLogout = () => {
      speckleStore.logout();
    }

    const speckleLoadProjects = () => {
      speckleStore.updateProjects();
    }

    const testActions = [
      { name: 'SpeckleLogin', href: '#', icon: HomeIcon, current: true, action: speckleLogin },
      { name: 'LoadProjects', href: '#', icon: UsersIcon, current: false, action: speckleLoadProjects},
      { name: 'ConvertProject', href: '#', icon: FolderIcon, current: false},
      { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
      { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
      { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
    ]

    const userNavigation = [
      { name: 'Your profile', href: '#' },
      { name: 'Sign out', href: '#' },
    ]

    const sidebarOpen = ref(true)

    return {
      speckleLogin,
      speckleLogout,
      speckleStore,
      testActions,
      userNavigation,
      sidebarOpen,
      testGroups
    };
  }
  
});

</script> 

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>