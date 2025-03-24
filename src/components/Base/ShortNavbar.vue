<template>
  <div id="nav" class="h-16 short-navbar-component flex items-center justify-between px-10 relative z-30">
    <!-- Profile dropdown -->
    <div class="flex flex-shrink-0 items-center">
      <img
        class="h-12 w-auto"
        :src="logo"
        alt="Your Company"
        style="shape-rendering: geometricPrecision; filter: drop-shadow(4px 4px 0 black);"
      />
    </div>
    <!-- Profile picture and dropdown -->
    <Menu as="div" class="relative mr-10 mt-2 items-center">
      <div>
        <MenuButton
          class="relative flex styled-element hoverable-sm pressable"
        >
          <span class="absolute -inset-1.5" />
          <span class="sr-only">Open user menu</span>
          <img
            class="h-12 w-12"
            :src="speckleStore.user?.avatar"
            alt=""
          />
        </MenuButton>
      </div>
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <MenuItems
          class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <!-- Profile -->
          <MenuItem v-slot="{ active }">
            <a
              href="#"
              :class="[
                active ? 'bg-gray-100' : '',
                'block px-4 py-2 text-sm text-gray-700',
              ]"
              >Your Profile</a
            >
          </MenuItem>

          <!-- Settings -->
          <MenuItem v-slot="{ active }">
            <a
              href="#"
              :class="[
                active ? 'bg-gray-100' : '',
                'block px-4 py-2 text-sm text-gray-700',
              ]"
              @click="toggleSettingsModal"
              >Settings</a
            >
          </MenuItem>

          <!-- Sign Out -->
          <MenuItem v-slot="{ active }">
            <a
              href="#"
              :class="[
                active ? 'bg-gray-100' : '',
                'block px-4 py-2 text-sm text-gray-700',
              ]"
              >Sign Out</a
            >
          </MenuItem>
        </MenuItems>
      </transition>
    </Menu>
  </div>
</template>

<script setup lang="ts">
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/vue'
import { useSpeckleStore } from '@/stores/speckleStore'
import { useNavigationStore } from '@/stores/navigationStore'

import logo from '@/assets/icons/logo.svg'

const speckleStore = useSpeckleStore()
const navigationStore = useNavigationStore()

const toggleSettingsModal = () => {
  navigationStore.toggleSettingsModal()
}
</script>