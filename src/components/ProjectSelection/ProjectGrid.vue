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
					v-for="project in projects"
					:key="project.name"
					class="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
				>
					<!-- Project Iterator. -->
					<div class="flex flex-1 flex-col p-8 min-h-40">
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
									{{ project.emissionSqm }} kg-co² / m²
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
	import { computed, defineComponent, onMounted, ref, watch } from 'vue'
	
	import VersionSelectionModal from '@/components/ProjectSelection/VersionSelectionModal.vue'

	import { useNavigationStore } from '@/stores/navigation'
	import { useSpeckleStore } from '@/stores/speckle'
	import { useFirebaseStore } from '@/stores/firebase'
	import { useSettingsStore } from '@/stores/settings'

	import type { ProjectId } from '@/models/speckle'
	import { emissionToNumber, getResultLogEmissions } from '@/utils/resultUtils'

	/**
	 * Component for displaying a grid of projects.
	 */
	export default defineComponent({
		name: 'ProjectGrid',
		components: {
			VersionSelectionModal
		},
		methods: {
		},
		setup() {
			const speckleStore = useSpeckleStore()
			const navStore = useNavigationStore()
			const firebaseStore = useFirebaseStore()
			const settingsStore = useSettingsStore()

			const versionModalOpen = ref(false)

			const selectedProjectId = ref('')
			const selectedProjectName = ref('')

			const projectsData = ref([])

			const updateProjects = async () => {
				if (!speckleStore.allProjects) {
					projectsData.value = []
					return
				}
				
				const projectResults = await Promise.all(speckleStore.allProjects.map(async project => {
					const resultLog = await firebaseStore.fetchResults(project.id).then((logs) => {
						if (logs.length > 0)
							return logs[0] // Just return first log
						else 
							return null
					})

					if (resultLog) {
						const emission = getResultLogEmissions(resultLog, 'material.name')
						const emissionSqm = Math.round(emissionToNumber(emission) / settingsStore.appSettings.area) || 0

						const percentageDifference = ((300 - emissionSqm) / 300) * 100

						const differenceText =
							percentageDifference > 0
								? `${Math.abs(percentageDifference).toFixed(1)}% below threshold`
								: `${Math.abs(percentageDifference).toFixed(1)}% above threshold`

						return {
							...project,
							emissionSqm,
							differenceText
						}
					} else {
						return {
							...project,
							emissionSqm: 0,
							differenceText: "No results"
						}
					}
				}))

				projectsData.value = projectResults
			}

			const projects = computed(() => projectsData.value
			)

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

			watch(() => speckleStore.allProjects, () => {
				updateProjects()
			})

			return {
				speckleStore,
				versionModalOpen,
				selectedProjectId,
				selectedProjectName,
				projects,
				formatDate,
				openVersionModal,
				closeVersionModal,
				openSlideOver
			}
		}
	})
</script>
