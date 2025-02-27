<template>
	<!-- Modal area -->
	<SettingsModal />

	<!-- Main content area -->
	<ShortNavbar />
	<ProjectGrid />
</template>

<script setup lang="ts">
import ProjectGrid from '@/components/ProjectSelection/ProjectGrid.vue'
import SettingsModal from '@/components/Modals/SettingsModal.vue'
import ShortNavbar from '@/components/Misc/ShortNavbar.vue'
</script>
