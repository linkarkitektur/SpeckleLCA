<template>
	<div class="fixed inset-0 min-h-screen min-w-screen h-full w-full
						  pattern-dots pattern-black pattern-bg-transparent pattern-size-4 -z-10" style="--pattern-opacity: 0.1;"></div>
  <div class="relative z-0">
		<!-- Modal area -->
		<SettingsModal />

		<!-- Main content area -->
		<ShortNavbar />
		<ProjectGrid />
	</div>
</template>

<script setup lang="ts">
import ProjectGrid from '@/components/ProjectSelection/ProjectGrid.vue'
import SettingsModal from '@/components/Modals/SettingsModal.vue'
import ShortNavbar from '@/components/Base/ShortNavbar.vue'
</script>
