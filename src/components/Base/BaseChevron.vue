<template>
	<div class="chevron-container relative" :style="containerStyle">
		<div
			:class="[
				'absolute z-40 translate-x-0 translate-y-0 group-hover:translate-x-2 group-hover:translate-y-2 group-focus-within:translate-x-2 group-focus-within:translate-y-2 transition-all delay-150 duration-300 ease-in-out'
			]"
			:style="outerArrowStyle"
		></div>
		<div
			:class="[
				'absolute z-40 translate-x-0 translate-y-0 group-hover:translate-x-2 group-hover:translate-y-2 group-focus-within:translate-x-2 group-focus-within:translate-y-2 transition-all delay-150 duration-300 ease-in-out'
			]"
			:style="innerArrowStyle"
		></div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'

	const props = defineProps({
		width: { type: Number, default: 15 },
		height: { type: Number, default: 20 },
		rotation: { type: Number, default: 0 },
		innerColor: { type: String, default: '#000' }
	})

	const containerStyle = computed(() => ({
		width: (props.width + 2) * 2 + 'px',
		height: props.height - 3 + 'px'
	}))

	const outerArrowStyle = computed(() => ({
		right: '-3px',
		left: '-3px',
		top: '-2px',
		width: 0,
		height: 0,
		borderLeft: props.width + 4 + 'px solid transparent',
		borderRight: props.width + 4 + 'px solid transparent',
		borderTop: props.height + 6 + 'px solid black'
	}))

	const innerArrowStyle = computed(() => ({
		width: 0,
		height: 0,
		borderLeft: props.width + 'px solid transparent',
		borderRight: props.width + 'px solid transparent',
		borderTop: props.height + `px solid ${props.innerColor}`
	}))
</script>
