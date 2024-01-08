<template>
  <Menu as="div" class="relative inline-block text-left">
    <div class="max-w-xs">
      <MenuButton
        class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 truncate"
      >
        <div class="flex items-center space-x-2 truncate">
          {{ selectedItem }}
        </div>
        <ChevronDownIcon
          class="-mr-1 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="py-1 max-h-60 overflow-y-auto">
          <MenuItem
            v-for="item in menuItems"
            :key="item.name"
            v-slot="{ active }"
          >
            <a
              v-if="selectedItem == item.name"
              :class="[
                active
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-gray-100 text-gray-900',
                'block px-4 py-2 text-sm font-bold underline',
              ]"
              @click="select(item)"
              >{{ item.name }}</a
            >
            <a
              v-else
              :class="[
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'block px-4 py-2 text-sm',
              ]"
              @click="select(item)"
              >{{ item.name }}</a
            >
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { defineComponent, ref, getCurrentInstance, watch } from 'vue'

export default defineComponent({
  name: 'DropDown',
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    ChevronDownIcon,
  },
  props: {
    /**
     * List of items and potential data to be shown in the dropdown
     */
    items: {
      type: Array as () => IDropdownItem[],
      required: true,
    },
    /**
     * Initial name to be shown in dropdown before selecting an item
     */
    dropdownName: {
      type: String,
      required: false,
      default: 'Options',
    },
  },
  setup(props) {
    const instance = getCurrentInstance()
    const selectedItem = ref(props.dropdownName)
    const menuItems = ref(props.items)

    const select = (item: IDropdownItem) => {
      selectedItem.value = item.name
      // Emit back to parent so it knows the dropdown has selected something new
      instance?.emit('selectedItem', item)
    }

    watch(
      () => props.items,
      (newValue) => {
        menuItems.value = newValue
      }
    )

    return {
      select,
      menuItems,
      selectedItem,
    }
  },
})

export interface IDropdownItem {
  name: string
  data?: string
}
</script>
