<template>
	<div class="flex-1 p-6">
		<div class="bg-white p-4 shadow-md rounded-md">
			<VersionSelectionModal
				:show="versionModalOpen"
				:projectId="selectedProjectId"
				:projectName="selectedProjectName"
				@closeVersionModal="closeVersionModal"
			/>
			<ul
				role="list"
				class="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
			>
				<li
					v-for="project in projectsWithRandomNumbers"
					:key="project.name"
					class="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
				>
					<!-- Project Iterator. -->
					<div class="flex flex-1 flex-col p-8">
						<iframe :src="getEmbeddedUrl(project)"></iframe>
						<button @click="openVersionModal(project)">
							<dd class="text-sm text-gray-500">{{ project.name }}</dd>
							<dd class="mt-3">
								<span
									class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
								> {{ formatDate(project.updatedAt) }} </span
								>
							</dd>
						</button>
					</div>

					<!-- Stats. -->
					<div>
						<div class="-mt-px flex divide-x divide-gray-200">
							<!-- TODO Hardcoded values... should be dynamic. -->
							<div class="flex w-0 flex-1">
								<a
									class="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-green-900 text-center"
								>
									{{ project.randomNumber }} kg-co² / m²
								</a>
							</div>

							<!-- TODO Hardcoded values... should be dynamic. -->
							<div class="-ml-px flex w-0 flex-1">
								<a
									class="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-800 text-center"
								>
									{{ project.differenceText }}
								</a>
							</div>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts">
	import { computed, defineComponent, onMounted, ref } from 'vue'
	
	import VersionSelectionModal from '@/components/ProjectSelection/VersionSelectionModal.vue'

	import { useNavigationStore } from '@/stores/navigation'
	import { useSettingsStore } from '@/stores/settings'
	import { useSpeckleStore } from '@/stores/speckle'

	import type { ProjectId } from '@/models/speckle'

	/**
	 * Component for displaying a grid of projects.
	 */
	export default defineComponent({
		name: 'ProjectGrid',
		components: {
			VersionSelectionModal
		},
		methods: {
			/**
			 * Returns the embedded URL for a given project.
			 *
			 * @param {ProjectId} project - The project ID.
			 * @returns {string} The embedded URL for the project.
			 */
			getEmbeddedUrl(project: ProjectId) {
				const settingsStore = useSettingsStore()
				const baseUrl = settingsStore.keySettings.speckleConfig.serverUrl
				const streamId = project.id

				return `${baseUrl}/embed?stream=${streamId}&transparent=true&hidecontrols=true&hidesidebar=true&hideselectioninfo=true`
			}
		},
		setup() {
			const speckleStore = useSpeckleStore()
			const navStore = useNavigationStore()

			const versionModalOpen = ref(false)

			const selectedProjectId = ref('')
			const selectedProjectName = ref('')

			const projectsWithRandomNumbers = computed(() => {
				if (!speckleStore.allProjects) return []
				return speckleStore.allProjects.map(project => {
					const randomNumber = Math.floor(Math.random() * 60) + 40
					const percentageDifference = ((randomNumber - 75) / 75) * 100

					const differenceText =
						percentageDifference > 0
							? `${Math.abs(percentageDifference).toFixed(1)}% above threshold`
							: `${Math.abs(percentageDifference).toFixed(1)}% below threshold`

					return {
						...project,
						randomNumber,
						differenceText
					}
				})
			})

			const formatDate = (dateString) => {
				const date = new Date(dateString);
				const yy = String(date.getFullYear()).slice(-2);
				const mm = String(date.getMonth() + 1).padStart(2, '0');
				const dd = String(date.getDate()).padStart(2, '0');
				const hh = String(date.getHours()).padStart(2, '0');
				const min = String(date.getMinutes()).padStart(2, '0');
				return `${yy}-${mm}-${dd} : ${hh}:${min}`;
			};


			const openVersionModal = (project: ProjectId) => {
				versionModalOpen.value = true

				// Update versions for this project so we can load into dropdown selection
				speckleStore.updateProjectVersions(project.id, 100, null)

				selectedProjectId.value = project.id
				selectedProjectName.value = project.name
			}

			const closeVersionModal = () => {
				versionModalOpen.value = false
			}

			const openSlideOver = () => {
				navStore.toggleSlideover()
			}
			onMounted(speckleStore.updateProjects)

			return {
				speckleStore,
				versionModalOpen,
				selectedProjectId,
				selectedProjectName,
				projectsWithRandomNumbers,
				formatDate,
				openVersionModal,
				closeVersionModal,
				openSlideOver
			}
		}
	})
</script>
