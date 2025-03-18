<template>
<div class="flex-1 p-6">
		<div class="bg-white p-4 shadow-md rounded-md">
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
					class="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
				>
					<!-- Project Iterator. -->
					<div class="flex flex-1 flex-col p-8">
            <dd class="text-m text text-gray-500">{{ resultLog.name }}</dd>
            <div class="h-[20vh]">
              <GraphContainer 
                :resultItem="displayResultList[index]"
              />
            </div>
            <dd class="mt-3">
              <span
                class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-base font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
              > 
                {{ aggregatedEmission[index] }} kg-co²
              </span>
            </dd>
					</div>

					<!-- Stats. -->
					<div>
						<div class="-mt-px flex divide-x divide-gray-200">
							<div class="flex w-0 flex-1">
								<a
									class="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-green-900 text-center"
								>
									{{ aggregatedSQMEmission[index] }} kg-co² / m²
								</a>
							</div>

							<div class="-ml-px flex w-0 flex-1">
								<a
									class="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-800 text-center"
								>
                  <td 
                    :class="{'text-red-600' : emissionPercentage[index] >= 100, 'text-green-600' : emissionPercentage[index] < 100}"
                  >
                    {{ emissionPercentage[index] }}%
                  </td>
								</a>
							</div>
						</div>
					</div>


          <!-- Expand Button -->
          <button
            class="mt-4 w-full rounded bg-green-500 text-white py-2 text-sm font-medium hover:bg-green-600"
            @click="toggleExpansion(index)"
          >
            {{ expanded[index] ? 'Hide Details' : 'Show Details' }}
          </button>

          <!-- Expandable Data Table -->
          <div v-if="expanded[index]" class="overflow-auto max-h-80">
            <DataTable :resultItem="displayResultList[index]" />
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

import { useResultStore } from '@/stores/result'
import { useFirebaseStore } from '@/stores/firebase'
import { useProjectStore } from '@/stores/main'
import { useSettingsStore } from '@/stores/settings'

import { ref, reactive, computed, onMounted } from 'vue'

import type { ResultItem } from '@/models/result'
import type { ResultsLog } from '@/models/firebase'
import type { dropdownItem } from '@/components/Base/DropdownMenuItem.vue'

import { getResultLogEmissions, emissionToNumber } from '@/utils/resultUtils'

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
  resultLogs.value = await firebaseStore.fetchResults(projectStore.currProject.id)
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

const aggregatedSQMEmission = computed(() => {
  return resultLogs.value.map((log: ResultsLog) => {
    const emission = getResultLogEmissions(log, benchmarkParameter.value)
    return Math.round(emissionToNumber(emission) / (settingsStore.projectSettings.area))
  })
})

const emissionPercentage = computed(() => {
  const maxEmission = Math.max(...aggregatedEmission.value)
  return aggregatedEmission.value.map((emission) => {
    return Math.round((emission / maxEmission) * 100)
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