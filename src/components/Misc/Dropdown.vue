<template>
  <div class="relative inline-block text-left">
    <div class="max-w-xs">
      <button
        @click="toggleDropdown"
        class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 truncate"
      >
        <div class="flex items-center space-x-2 truncate">
          {{ selectedItem }}
        </div>
        <ChevronDownIcon class="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
      </button>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed z-[100] mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="py-1 max-h-60 overflow-y-auto">
          <DropdownMenuItem
            v-for="item in dPItems"
            :key="item.name"
            :item="item"
            :selectedItem="selectedItem"
            @select="select"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { defineComponent, ref, getCurrentInstance, watch } from 'vue'
import DropdownMenuItem from '@/components/Misc/DropdownMenuItem.vue'

export default defineComponent({
  name: 'DropDown',
  components: {
    ChevronDownIcon,
    DropdownMenuItem,
  },
  props: {
    items: {
      type: Array as () => dropdownItem[],
      required: true,
    },
    dropdownName: {
      type: String,
      required: false,
      default: 'Options',
    },
  },
  setup(props) {
    const instance = getCurrentInstance()
    const selectedItem = ref(props.dropdownName)
    const dPItems = ref(props.items)
    const isOpen = ref(false)

    const select = (item: dropdownItem) => {
      selectedItem.value = item.name
      isOpen.value = false
      // Emit back to parent so it knows the dropdown has selected something new
      instance?.emit('selectedItem', item)
    }

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value
    }

    watch(
      () => props.items,
      (newValue) => {
        dPItems.value = newValue
      }
    )

    watch(
      () => props.dropdownName,
      (newValue) => {
        selectedItem.value = newValue
      }
    )

    return {
      select,
      dPItems,
      selectedItem,
      isOpen,
      toggleDropdown,
    }
  },
})

export interface dropdownItem {
  name: string
  data?: string
  children?: dropdownItem[]
}
</script>