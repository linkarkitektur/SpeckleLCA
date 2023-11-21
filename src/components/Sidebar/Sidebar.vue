<template>
  <div class="fixed inset-y-0 z-40 flex w-72 flex-col">
    <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pt-20">
      <nav class="flex flex-1 flex-col pt-6">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" class="-mx-2 space-y-1">
              <li v-for="item in testActions" :key="item.name">
                <button @click='item.action'>
                  <a :href="item.href" :class="[item.current ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                    <component :is="item.icon" :class="[item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']" aria-hidden="true" />
                    {{ item.name }}
                  </a>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { defineComponent, ref, computed } from 'vue'

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

import { useSpeckleStore } from '@/stores/speckle'
import { useProjectStore } from '@/stores/main'

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
      sidebarOpen
    };
  }
  
});

</script> 