<template>
	<div id="app">
		<LoadScreen />
		<router-view />
	</div>
</template>

<script setup lang="ts">
	import LoadScreen from '@/components/Misc/LoadScreen.vue'
</script>
