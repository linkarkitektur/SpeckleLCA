<template>
  <div>
    <div
      :class="[
        'flex items-center justify-between px-4 py-2 text-sm cursor-pointer',
        selectedItem === item.name ? 'font-bold underline' : '',
        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
      ]"
      @click="handleSelect"
      @mouseenter="active = true"
      @mouseleave="active = false"
    >
      <span>{{ item.name }}</span>
      <ChevronRightIcon v-if="hasChildren" class="h-4 w-4 text-gray-400" />
    </div>
    <transition name="fade">
      <div v-if="isOpen" class="ml-4 pl-4 border-l border-gray-200">
        <DropdownMenuItem
          v-for="child in item.children"
          :key="child.name"
          :item="child"
          :selectedItem="selectedItem"
          @select="$emit('select', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ChevronRightIcon } from '@heroicons/vue/20/solid'

export default defineComponent({
  name: 'DropdownMenuItem',
  components: {
    ChevronRightIcon,
    DropdownMenuItem: () => import('./DropdownMenuItem.vue'),
  },
  props: {
    item: {
      type: Object as () => dropdownItem,
      required: true,
    },
    selectedItem: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const isOpen = ref(false)
    const active = ref(false)
    const hasChildren = props.item.children && props.item.children.length > 0

    const handleSelect = () => {
      if (hasChildren) {
        isOpen.value = !isOpen.value
      } else {
        emit('select', props.item)
      }
    }

    return {
      isOpen,
      active,
      hasChildren,
      handleSelect,
    }
  },
})

export interface dropdownItem {
  name: string
  data?: string
  children?: dropdownItem[]
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
