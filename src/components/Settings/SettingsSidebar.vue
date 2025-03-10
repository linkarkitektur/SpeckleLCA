<template>
  <aside class="styled-element w-64 py-36 border-0">
    <nav class="px-4 sm:px-6 lg:px-0">
      <ul role="list" class="flex flex-col gap-y-4">
        <li 
          v-for="item in settingViews" 
          :key="item.name"
        >
          <ActionButton
            :text="item.name"
            @on-click="handleClick(item)"
            class="w-64"
          />
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import ActionButton from '@/components/Base/ActionButton.vue';
import type { SettingView } from '@/models/settings'

const props = defineProps<{
  settingViews: SettingView[]
}>()

const emit = defineEmits<{
  'view-changed': [SettingView]
}>()

const handleClick = (item: SettingView) => {
  props.settingViews.forEach((nav) => {
    nav.current = nav.name === item.name
  })
  emit('view-changed', item)
}
</script>