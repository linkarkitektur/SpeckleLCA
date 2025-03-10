<template>
  <Switch
    :style="toggleStyle"
    :class="baseClasses"
    @click="handleClick"
  >
    <span class="sr-only">{{ label }}</span>
    <span :style="knobStyle" :class="knobClasses">
      <span :style="iconInactiveStyle" :class="iconWrapperClasses" aria-hidden="true">
        <slot name="inactive" />
      </span>
      <span :style="iconActiveStyle" :class="iconWrapperClasses" aria-hidden="true">
        <slot name="active" />
      </span>
    </span>
  </Switch>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@headlessui/vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  label: { type: String, default: 'Toggle' },
  activeColor: { type: String, default: '#16a34a' },
  inactiveColor: { type: String, default: '#e5e7eb' },
  transitionDuration: { type: String, default: '200ms' },
  baseClasses: {
    type: String,
    default: 'relative inline-flex mt-4 mb-2 h-8 w-16 styled-element cursor-pointer transition-colors ease-in-out'
  },
  knobClasses: {
    type: String,
    default: 'pointer-events-none relative ml-[1px] styled-element inline-block h-7 w-7 transform transition ease-in-out'
  },
  iconWrapperClasses: {
    type: String,
    default: 'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
  },
  activeIconOpacity: { type: Number, default: 1 },
  inactiveIconOpacity: { type: Number, default: 0 }
})

const emits = defineEmits(['change'])
const handleClick = () => {
  emits('change', !props.active)
}

const toggleStyle = computed(() => ({
  backgroundColor: props.active ? props.activeColor : "white",
  transition: `background-color ${props.transitionDuration} ease-in-out`
}))

const knobStyle = computed(() => ({
  transform: props.active ? 'translateX(2rem) translateY(0.05rem)' : 'translateX(0) translateY(0.05rem)',
  backgroundColor: props.active ? props.inactiveColor : props.activeColor,
  transition: `transform ${props.transitionDuration} ease-in-out`
}))

const iconInactiveStyle = computed(() => ({
  opacity: props.active ? props.inactiveIconOpacity : 1,
  color: props.active ? props.inactiveColor : props.activeColor,
  transition: `opacity ${props.active ? '100ms ease-out' : '200ms ease-in'}`
}))

const iconActiveStyle = computed(() => ({
  opacity: props.active ? 1 : 0,
  color: props.active ? props.activeColor : props.inactiveColor,
  transition: `opacity ${props.active ? '200ms ease-in' : '100ms ease-out'}`
}))
</script>
