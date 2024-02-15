<template>
	<!-- Add all modals here -->
	<NewGroupModal />
	<MaterialMappingModal />
	<!-- End of modal area -->

	<div class="relative mt-16 z-40 flex h-[calc(100vh-4rem)] w-1/3 flex-col">
		<div
			class="flex grow h-[calc(100vh-12rem)] flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pt-4"
		>
			<GroupList />
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from 'vue'
	import GroupList from '@/components/Sidebar/GroupList.vue'
	import NewGroupModal from '@/components/Sidebar/NewGroupModal.vue'
	import MaterialMappingModal from '@/components/MaterialMappingModal.vue'

	export default defineComponent({
		name: 'SideBar',
		components: {
			GroupList,
			NewGroupModal,
			MaterialMappingModal
		},
		setup() {
			return {}
		}
	})
</script>

<style scoped>
	.ghost {
		opacity: 0.5;
	}
</style>
