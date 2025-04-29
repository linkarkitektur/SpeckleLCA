<template>
<div class="flex-1 p-6">
		<div class="bg-white">
      <Dropdown
        :items="graphParameters"
        name="graphParameter"
        :dropdownName="dropdownName"
        @selectedItem="handleResultListSelection"
        class="pb-6"
      />
			<ul
				role="list"
				class="max-h-screen grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start overflow-auto"
			>
				<li
					v-for="(resultLog, index) in resultLogs"
					:key="resultLog.name"
					class="h-[50vh] bg-white styled-element hoverable mb-4 mx-2"
				>
					<!-- Project Iterator. -->
					<div class="grid grid-rows-8 h-full p-2">
						<!-- Title -->
						<div class="flex row-span-1 justify-center">{{ resultLog.name }}</div>

						<!-- Graph -->
						<div class="flex row-span-5">
							<GraphContainer 
								graph="PieChart"
								:resultItem="displayResultList[index]"
							/>
						</div>

						<!-- Stats -->
						<div class="flex row-span-1 divide-x divide-gray-200">
							<div class="flex flex-1 justify-center items-center">
								<a class="styled-data">
									{{ aggregatedSQMEmission[index] }} kg-co² / m²
								</a>
							</div>

							<div class="flex flex-1 justify-center items-center">
								<a class="styled-data">
                  <span :class="{'text-red-600' : emissionPercentage[index] >= 100, 'text-green-600' : emissionPercentage[index] < 100}">
                    {{ emissionPercentage[index] }}%
                  </span>
								</a>
							</div>
						</div>

						<!-- Data table button -->
						<div class="flex row-span-1">
              <ActionButton
                :text="expanded[index] ? 'Hide Details' : 'Show Details'"
                @onClick="toggleExpansion(index)"
                class="w-full h-full"
              />
						</div>
					</div>

					<!-- Expandable Data Table -->
					<div v-if="expanded[index]" 
            class="absolute left-0 top-0 w-full bg-white shadow-lg rounded-lg z-50 full-h overflow-auto"
          >
						<div class="sticky top-0 w-full bg-white p-4 border-b flex justify-between items-center">
							<h3 class="font-semibold">{{ resultLog.name }} Details</h3>
							<button @click="toggleExpansion(index)" class="text-gray-500 hover:text-gray-700">
								<span class="sr-only">Close</span>
								<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<div class="p-4">
							<DataTable :resultItem="displayResultList[index]" />
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import Dropdown from '@/components/Base/Dropdown.vue'
import GraphContainer from '@/components/Graphs/GraphContainer.vue'
import DataTable from '@/components/Graphs/DataTable.vue'
import ActionButton from '../Base/ActionButton.vue'

import { useResultStore } from '@/stores/resultStore'
import { useFirebaseStore } from '@/stores/firebaseStore'
import { useProjectStore } from '@/stores/projectStore'
import { useSettingsStore } from '@/stores/settingStore'

import { ref, reactive, computed, onMounted } from 'vue'

import type { ResultItem } from '@/models/resultModel'
import type { ResultsLog } from '@/models/firebaseModel'
import type { dropdownItem } from '@/components/Base/DropdownMenuItem.vue'

import { getResultLogEmissions, emissionToNumber, resultLogToAdjustedEmission } from '@/utils/resultUtils'

const resultStore = useResultStore()
const firebaseStore = useFirebaseStore()
const projectStore = useProjectStore()
const settingsStore = useSettingsStore()

const resultLogs = ref<ResultsLog[]>([])
const benchmarkParameter = ref<string>('material.name')

// Create a boolean array to track expansion state
const expanded = reactive(resultLogs.value.map(() => false))

// Fetch results on component mount
onMounted(async () => {
  resultLogs.value = await firebaseStore.fetchResults(projectStore.currProject.id, 3)
})

// Dropdown items from resultList
const graphParameters = ref<dropdownItem[]>(
  resultStore.resultList.map((result) => ({
    name: result.displayName,
    data: JSON.stringify(result),
  }))
)

// Selected result
const selectedResult = ref<ResultItem | null>(null)
const dropdownName = ref(selectedResult.value?.displayName ?? 'Select a result')

// Handler for selecting a dropdown item
const handleResultListSelection = (selectedItem: dropdownItem) => {
  resultStore.setReloadData(true)
  projectStore.clearSelectedObjects()
  const parsedResult = JSON.parse(selectedItem.data) as ResultItem
  benchmarkParameter.value = parsedResult.parameter
}

const aggregatedEmission = computed(() => {
  return resultLogs.value.map((log: ResultsLog) => {
    const emission = getResultLogEmissions(log, benchmarkParameter.value)
    return Math.round(emissionToNumber(emission))
  })
})

// If we do it per year then we divide with lifespan
const aggregatedSQMEmission = computed(() => {
  return resultLogs.value.map((log: ResultsLog) => {
    return resultLogToAdjustedEmission(log, benchmarkParameter.value)
  })
})

const emissionPercentage = computed(() => {
  return aggregatedEmission.value.map((emission) => {
    return Math.round((emission / settingsStore.projectSettings.threshold) * 100)
  })
})

const displayResultList = computed(() => {
  return resultLogs.value.map((resultLog) => {
    return resultLog.resultList.find((item: ResultItem) => item.parameter === benchmarkParameter.value)
  })
})

const toggleExpansion = (index: number) => {
  expanded[index] = !expanded[index]
}
</script>