<template>
  <Switch
    v-model="renderMode"
    :class="[
      !renderMode ? 'bg-green-600' : 'bg-gray-200',
      'relative inline-flex mt-4 mb-2 mr-4 h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2'
    ]"
    @click="toggleRenderMode"
  >
    <span class="sr-only">Toggle Render Mode</span>
    <span
      :class="[
        !renderMode ? 'translate-x-5' : 'translate-x-0',
        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
      ]"
    >
      <span
        :class="[
          !renderMode ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in',
          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
        ]"
        aria-hidden="true"
      >
        <HomeOutline class="h-3 w-3 text-gray-400" />
      </span>
      <span
        :class="[
          !renderMode ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
        ]"
        aria-hidden="true"
      >
        <HomeIcon class="h-3 w-3 text-green-600" />
      </span>
    </span>
  </Switch>

  <Switch
    v-model="showHiddenObjects"
    :class="[
      showHiddenObjects ? 'bg-green-600' : 'bg-gray-200',
      'relative inline-flex mt-4 mb-2 h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2'
    ]"
    @click="toggleHidden"
  >
    <span class="sr-only">Toggle Hidden</span>
    <span
      :class="[
        showHiddenObjects ? 'translate-x-5' : 'translate-x-0',
        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
      ]"
    >
      <span
        :class="[
          showHiddenObjects ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in',
          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
        ]"
        aria-hidden="true"
      >
        <EyeSlashIcon class="h-3 w-3 text-gray-400" />
      </span>
      <span
        :class="[
          showHiddenObjects ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
        ]"
        aria-hidden="true"
      >
        <EyeIcon class="h-3 w-3 text-green-600" />
      </span>
    </span>
  </Switch>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { Switch } from '@headlessui/vue'
import { HomeIcon, EyeIcon } from '@heroicons/vue/20/solid'
import { HomeIcon as HomeOutline, EyeSlashIcon } from '@heroicons/vue/24/outline'

import { useSpeckleStore } from '@/stores/speckle'

	/**
	 * Dashboard view.
	 * This component represents the main dashboard view of the application.
	 */
   export default {
		name: 'DashboardView',
		components: {
      // eslint-disable-next-line vue/no-reserved-component-names
      Switch,
      HomeIcon,
      HomeOutline,
      EyeIcon,
      EyeSlashIcon
		},
		setup() {
      const speckleStore = useSpeckleStore()
      const { renderMode, showHiddenObjects } = storeToRefs(speckleStore)

      const toggleRenderMode = () => {
        speckleStore.toggleRenderMode()
      }

      const toggleHidden = () => {
        speckleStore.toggleHiddenObjects()
      }

			return { 
        toggleRenderMode,
        toggleHidden,
        showHiddenObjects,
        renderMode
       }
		}
	}
</script>