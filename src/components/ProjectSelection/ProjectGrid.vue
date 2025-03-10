<template>
  <div class="flex-1 p-6 relative overflow-hidden">
    <!-- Flash Background -->
    <div
      class="fixed inset-0 transition-all duration-50"
      :style="{
        backgroundColor: activeColor,
        opacity: backgroundVisible ? 1 : 0,
        zIndex: backgroundVisible ? 50 : 0
      }"
    ></div>

    <!-- Main content -->
    <ul
      role="list"
      class="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative"
      :class="{'z-20': !backgroundVisible}"
    >
      <li
        v-for="(project, index) in projects"
        :key="project.name"
        class="col-span-1 flex flex-col styled-element hoverable pressable cursor-pointer"
        :style="{ backgroundColor: projectColors[index] }"
        @click="startTransition(project, projectColors[index])"
      >
        <!-- Project Iterator. -->
        <div class="flex flex-1 flex-col p-8 min-h-40">
          <button>
            <dd class="">{{ project.name }}</dd>
            <dd class="mt-3">
              <span 
                class="p-1 inline-flex items-center styled-element hoverable-sm bg-white styled-data text-sm"
              > 
                {{ formatDate(project.updatedAt) }} 
              </span>
            </dd>
          </button>
        </div>

        <!-- Stats. -->
        <div>
          <div class="-mt-px flex styled-data">
            <div class="flex w-0 flex-1">
              <a
                class="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 py-4 font-semibold text-green-900 text-center"
              >
                {{ project.emissionSqm }} kg-co² / m²
              </a>
            </div>

            <div class="-ml-px flex w-0 flex-1">
              <a
                class="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 py-4 font-semibold text-gray-800 text-center"
              >
                {{ project.differenceText }}
              </a>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { useSpeckleStore } from '@/stores/speckle'
import { useFirebaseStore } from '@/stores/firebase'
import { useSettingsStore } from '@/stores/settings'

import type { ProjectId } from '@/models/speckle'
import { emissionToNumber, getResultLogEmissions } from '@/utils/resultUtils'
import { ColorManager } from '@/utils/colorUtils'
import router from '@/router'
import { useNavigationStore } from '@/stores/navigation'

/**
 * Component for displaying a grid of projects.
 */
const speckleStore = useSpeckleStore()
const firebaseStore = useFirebaseStore()
const settingsStore = useSettingsStore()
const navStore = useNavigationStore()

const selectedProjectId = ref('')
const selectedProjectName = ref('')

const projectsData = ref([])

// Transition state
const activeColor = ref('')

// Flash transition state
const backgroundVisible = ref(false)

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

const projectColors = computed(() => {
	const clrManager = new ColorManager()
	return clrManager.getMostDistinctColors(projects.value.length)
})

const formatDate = (dateString) => {
	const date = new Date(dateString);
	const yy = String(date.getFullYear()).slice(-2);
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');
	const hh = String(date.getHours()).padStart(2, '0');
	const min = String(date.getMinutes()).padStart(2, '0');
	return `${yy}-${mm}-${dd} : ${hh}:${min}`;
}

// Updated transition function
const startTransition = async (project: ProjectId, color: string) => {
  activeColor.value = color
  selectedProjectId.value = project.id
  selectedProjectName.value = project.name

  // Start flash sequence
  backgroundVisible.value = true
  
  // Load data during the flash
  await speckleStore.updateProjectVersions(project.id, 100, null)
  navStore.setActiveColor(color)

  // Complete transition and navigate
  setTimeout(() => {
    navStore.setActivePage('Overview') 
    router.push({ 
      name: 'Overview', 
      params: { 
        id: project.id,
        color: color
      }
    })
  }, 100)
}

onMounted(speckleStore.updateProjects)

watch(() => speckleStore.allProjects, () => {
	updateProjects()
})

</script>

<style scoped>
.origin-center {
  transform-origin: center;
}

/* Flash transition */
.flash-enter-active {
  transition: opacity 0.15s step-end;
}

.flash-enter-from {
  opacity: 0;
}

.flash-leave-active {
  transition: opacity 0.15s step-start;
}

.flash-leave-to {
  opacity: 0;
}
</style>