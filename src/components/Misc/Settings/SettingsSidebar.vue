<template>
  <aside class="overflow-x-auto border-b border-gray-900/5 block w-64 flex-none border-0 py-36">
    <nav class="flex-none px-4 sm:px-6 lg:px-0">
      <ul role="list" class="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
        <li v-for="item in settingViews" :key="item.name">
          <a 
            href="#"
            :class="[item.current ?
              'bg-gray-50 text-green-600' : 
              'text-gray-700 hover:bg-gray-50 hover:text-green-600', 
              'group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm/6 font-semibold']"
            @click.prevent="handleClick(item)"
          >
            <component 
              :is="item.icon" 
              :class="[item.current ? 
                'text-green-600' : 
                'text-gray-400 group-hover:text-green-600', 
                'size-6 shrink-0']" 
              aria-hidden="true" 
            />
            {{ item.name }}
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, Ref } from 'vue'
import { SettingView } from '@/models/settings';

export default defineComponent({
  name: 'SettingsSidebar',
  components: {
  },
  props: {
    settingViews: {
      type: Array as PropType<SettingView[]>,
      required: true,
    },
  },
  emits: ['view-changed'],
  setup(props , { emit }) {

    const handleClick = (item: any) => {
      props.settingViews.forEach((nav) => {
        nav.current = nav.name === item.name
      })
      emit('view-changed', item)
    }

    return {
      handleClick,
    }
  },
})
</script>