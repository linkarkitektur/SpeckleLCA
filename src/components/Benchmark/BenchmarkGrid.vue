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
				class="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
			>
				<li
					v-for="(resultLog, index) in resultLogs"
					:key="resultLog.name"
					class="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
				>
					<!-- Project Iterator. -->
					<div class="flex flex-1 flex-col p-8">
            <dd class="text-lg text text-gray-500">{{ resultLog.name }}</dd>
            <div class="h-[20vh]">
              <GraphContainer 
                :resultItem="displayResultList[index]"
              />
            </div>
            <dd class="mt-3">
              <span
                class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
              > {{ resultLog.resultList[0].displayName }} </span
              >
            </dd>
					</div>

					<!-- Stats. -->
					<div>
						<div class="-mt-px flex divide-x divide-gray-200">
							<div class="flex w-0 flex-1">
								<a
									class="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-green-900 text-center"
								>
									{{ aggregatedEmission[index] }} kg-co² / m²
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
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts">
import Dropdown from '@/components/Misc/Dropdown.vue'
import GraphContainer from '../Graphs/GraphContainer.vue'

import { useResultStore } from '@/stores/result'
import { useFirebaseStore } from '@/stores/firebase'
import { useProjectStore } from '@/stores/main'
import { useSettingsStore } from '@/stores/settings'

import { defineComponent, ref, computed, watch } from 'vue'

import type { ResultItem } from '@/models/result'
import type { ResultsLog } from '@/models/firebase'
import type { dropdownItem } from '@/components/Misc/DropdownMenuItem.vue'

import { getResultLogEmissions, emissionToNumber } from '@/utils/resultUtils'


export default defineComponent({
  name: 'BenchmarkGrid',
  components: {
    Dropdown,
    GraphContainer,
  },
  setup() {
    const resultStore = useResultStore()
    const firebaseStore = useFirebaseStore()
    const projectStore = useProjectStore()
    const settingsStore = useSettingsStore()

    const resultLogs = ref<ResultsLog[]>([])
    const benchmarkParameter = ref<string>('parameters.speckle_type')

    //
    firebaseStore.fetchResults(projectStore.currProject.id).then((logs) => {
      resultLogs.value = logs
    })

    // Dropdown items from resultList
    const graphParameters = ref<dropdownItem[]>(
      resultStore.resultList.map((result) => ({
        name: result.displayName,
        data: JSON.stringify(result), // Passing the entire result as JSON for flexibility
      }))
    )
    
    // Selected result
    const selectedResult = ref<ResultItem | null>(null)
    const dropdownName = ref(selectedResult.value ? selectedResult.value.displayName : 'Select a result')

    // Handler for selecting a dropdown item
    const handleResultListSelection = (selectedItem: dropdownItem) => {
      const parsedResult = JSON.parse(selectedItem.data) as ResultItem
      benchmarkParameter.value = parsedResult.parameter
    }

    const aggregatedEmission = computed(() => {
      const resultLogEmission = resultLogs.value.map((log: ResultsLog) => {
        const emission = getResultLogEmissions(log, benchmarkParameter.value)
        return Math.round(emissionToNumber(emission) / settingsStore.appSettings.area) 
      })
      return resultLogEmission 
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

    watch(graphParameters, (newGraphParameters) => {
      if (newGraphParameters.length > 0) {
        // If selectedResult is null or no longer matches an item in graphParameters, update it
        if (
          !selectedResult.value ||
          !newGraphParameters.some(
            (item) => item.name === selectedResult.value?.displayName
          )
        ) {
          const parsedResult = JSON.parse(newGraphParameters[0].data) as ResultItem
          selectedResult.value = parsedResult
          // Update the dropdownName to reflect the new selection
          dropdownName.value = parsedResult.displayName
        }
      } else {
        // If graphParameters is empty, reset selectedResult and dropdownName
        selectedResult.value = null
        dropdownName.value = 'Select a result'
      }
    })

    return {
      resultLogs,
      aggregatedEmission,
      graphParameters,
      handleResultListSelection,
      dropdownName,
      displayResultList,
      emissionPercentage,
    }
  },
})

</script>