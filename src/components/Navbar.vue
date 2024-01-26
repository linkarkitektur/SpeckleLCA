<!-- eslint-disable vue/no-reserved-component-names -->
<template>
  <div id="nav" class="h-16">
    <Disclosure as="nav" class="fixed bg-gray-50 shadow w-full z-50" v-slot="{ open }">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative flex h-16 justify-between">
          <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <!-- Mobile menu button -->
            <DisclosureButton
              class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span class="absolute -inset-0.5" />
              <span class="sr-only">Open Main Menu</span>
              <Bars3Icon
                v-if="!open"
                class="block h-6 w-6"
                aria-hidden="true"
              />
              <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
            </DisclosureButton>
          </div>

          <!-- Desktop and pad version -->
          <div
            class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start"
          >
            <div class="flex flex-shrink-0 items-center">
              <img
                class="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt="Your Company"
              />
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a v-for="step in steps" 
                :key="step.name" 
                :class="[
                  step.name == navigationStore.activePage 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 
                    'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                ]"
                @click="handleNavigation(step)"
              >
                {{ step.name }}
              </a>
            </div>
          </div>
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"
          >
            <!-- Profile dropdown -->
            <Menu as="div" class="relative ml-3">
              <div>
                <MenuButton
                  class="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span class="absolute -inset-1.5" />
                  <span class="sr-only">Open user menu</span>
                  <img
                    class="h-8 w-8 rounded-full"
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
        </div>
      </div>

      <!-- Start of Mobile Version -->
      <DisclosurePanel class="sm:hidden">
        <!--Tab Selection-->
        <div class="space-y-1 pb-3 pt-2">
          <DisclosureButton v-for="step in steps" 
            :key="step.name" 
            :selected="navigationStore.activePage" 
            :class="[
              step.name == navigationStore.activePage
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700', 
                'block border-l-4 py-2 pl-3 pr-4 text-base font-medium']"
            @click="handleNavigation(step)"
          >
            {{ step.name }}
          </DisclosureButton>
        </div>

        <!--Profile & Settings-->
        <div class="border-t border-gray-200 pb-3 pt-4">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <!-- Avatar Image-->
              <img
                class="h-10 w-10 rounded-full"
                :src="speckleStore.user?.avatar"
                alt=""
              />
            </div>

            <!-- Speckle Username -->
            <div class="ml-3">
              <div class="text-sm font-medium text-gray-500">
                <span>{{
                  speckleStore.user ? speckleStore.user.name : 'No User'
                }}</span>
              </div>
            </div>
          </div>

          <div class="mt-3 space-y-1">
            <!-- Profile -->
            <DisclosureButton
              as="a"
              href="#"
              class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >Your Profile</DisclosureButton
            >

            <!-- Settings -->
            <DisclosureButton
              as="a"
              href="#"
              class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >Settings</DisclosureButton
            >

            <!-- Sign Out -->
            <DisclosureButton
              as="a"
              href="#"
              class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >Sign Out</DisclosureButton
            >
          </div>
        </div>
      </DisclosurePanel>
      <!-- End of Mobile Version -->
    </Disclosure>
  </div>
</template>

<script lang="ts">
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { Step } from '@/models/pageLogic'
import { defineComponent } from 'vue'
import { useSpeckleStore } from '@/stores/speckle'
import { useNavigationStore } from '@/stores/main'
import router from '@/router'

export default defineComponent({
  name: 'NavbarComponent',
  components: {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    // eslint-disable-next-line vue/no-reserved-component-names
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Bars3Icon,
    XMarkIcon,
  },
  setup() {
    const speckleStore = useSpeckleStore()
    const navigationStore = useNavigationStore()

    const handleNavigation = (step: Step) => {
      navigationStore.setActivePage(step.name) // Set the active page in the store
      const currentRoute = router.currentRoute.value
      if (currentRoute.path !== step.href) {
        router.push(step.href);
      }
    }

    //This should not href, but check if we are in dashboard and href if its active otherwise just switch in the store
    const steps: Step[] = [
      { name: 'Projects', href: '/projects' },
      { name: 'Overview', href: '/dashboard' },
      { name: 'Mapping', href: '/dashboard' },
      { name: 'Results', href: '/dashboard' },
      { name: 'Benchmark', href: '/dashboard' },
    ]

    return {
      speckleStore,
      navigationStore,
      handleNavigation,
      steps,
    }
  },
})
</script>
