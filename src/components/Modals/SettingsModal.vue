<template>
  <TransitionRoot as="template" :show="settingsModalOpen">
    <ProjectDialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed justify-center items-center inset-0 left-[12.5%] z-50 p-10 w-screen h-screen">
        <div
          class="w-3/4 flex flex-col items-end justify-center p-4 text-center sm:items-center sm:p-0 h-full"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all min-w-full h-full sm:my-8 sm:max-w-sm sm:p-6"
            >
              <div class="flex pb-2 h-full justify-between">
                <SettingsSidebar :setting-views="settingViews" @view-changed="setView" />

                <div class="px-4 py-16 flex-auto h-full overflow-y-scroll">
                  <div class="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
                    <component
                      v-for="(Component, index) in currentViewComponents"
                      :key="index"
                      :is="Component"
                    />
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </ProjectDialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { 
  Dialog, 
  DialogPanel, 
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { UserCircleIcon, FingerPrintIcon, CalculatorIcon, CubeTransparentIcon } from '@heroicons/vue/20/solid'

import { useNavigationStore } from '@/stores/navigation'

import SettingsSidebar from '@/components/Misc/Settings/SettingsSidebar.vue'

import SettingsGeneral from '@/components/Misc/Settings/SettingsGeneral.vue'

import SettingsMaterial from '@/components/Misc/Settings/SettingsMaterial.vue'

import SettingsCalculationCategory from '@/components/Misc/Settings/SettingsCalculationCategory.vue'
import SettingsImpactCategory from '@/components/Misc/Settings/SettingsImpactCategory.vue'
import SettingsLifecycleStages from '@/components/Misc/Settings/SettingsLifecycleStages.vue'
import SettingsBuildingCodes from '@/components/Misc/Settings/SettingsBuildingCodes.vue'

import SettingsFirebase from '@/components/Misc/Settings/SettingsFirebase.vue'
import SettingsSpeckle from '@/components/Misc/Settings/SettingsSpeckle.vue'
import SettingsMaterialKeys from '@/components/Misc/Settings/SettingsMaterialKeys.vue'
import SettingsGithub from '@/components/Misc/Settings/SettingsGithub.vue'

import type { SettingView } from '@/models/settings'

export default defineComponent({
  name: 'SettingsModal',
  components: {
    UserCircleIcon,
    FingerPrintIcon,
    CalculatorIcon,
    ProjectDialog: Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    SettingsSidebar,
    SettingsFirebase,
    SettingsSpeckle,
    SettingsMaterialKeys,
    SettingsMaterial,
    SettingsGithub,
    SettingsLifecycleStages,
    SettingsCalculationCategory,
  },
  setup() {
    const navStore = useNavigationStore()
    const { settingsModalOpen } = storeToRefs(navStore)

    const currentSettingView = ref('General')
    
    const settingViews = reactive<SettingView[]>([
      { name: 'General', icon: UserCircleIcon, current: true },
      { name: 'Materials', icon: CubeTransparentIcon, current: false },
      { name: 'Calculation', icon: CalculatorIcon, current: false },
      { name: 'Keys', icon: FingerPrintIcon, current: false },
    ])

    const viewComponents = {
      'General': [SettingsGeneral],
      'Materials': [SettingsMaterial],
      'Calculation': [SettingsCalculationCategory, SettingsImpactCategory, SettingsLifecycleStages, SettingsBuildingCodes],
      'Keys': [SettingsFirebase, SettingsSpeckle, SettingsMaterialKeys, SettingsGithub],
    }

    const currentViewComponents = computed(() => viewComponents[currentSettingView.value])

    const closeModal = () => {
      navStore.toggleSettingsModal()
    }

    const setView = (view: SettingView) => {
      currentSettingView.value = view.name
    }    
    
    return {
      settingsModalOpen,
      currentViewComponents,
      currentSettingView,
      settingViews,
      closeModal,
      setView,
    }
  }
})
</script>