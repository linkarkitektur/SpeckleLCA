<template>
  <TransitionRoot as="template" :show="isOpen">
    <ProjectDialog as="div" class="relative z-10" @close="closeModal">
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

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
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
              class="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6"
            >
              <div>
                <div
                  class="mx-auto flex h-12 w-auto items-center justify-center rounded-md bg-green-100"
                >
                  <p>{{ projectName }}</p>
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <Dropdown
                    :items="extractNames"
                    @selectedItem="handleSelectedItem"
                    name="Version"
                  />
                  <!--<DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">Here you will select your current version</DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">{{ projectId }}</p>
                  </div>
                  -->
                </div>
              </div>
              <div class="mt-5 sm:mt-6">
                <button
                  type="button"
                  class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  @click="loadProject"
                >
                  Load this version
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </ProjectDialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, ref, watch, getCurrentInstance, computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import Dropdown, { type dropdownItem } from '@/components/Dropdown.vue'

import router from '@/router'
import { useNavigationStore, useProjectStore } from '@/stores/main'
import { useSpeckleStore } from '@/stores/speckle'
import { convertObjects } from '@/utils/speckleUtils'
import type { Version } from '@/models/speckle'
import type { ResponseObjectStream } from '@/models/speckle'
import type { Project } from '@/models/project'

export default defineComponent({
  name: 'VersionSelectionModal',
  components: {
    ProjectDialog: Dialog, // Rename Dialog component to ProjectDialog to comply with eslint rules (reserved keyword).
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    Dropdown,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    projectId: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
  },
  // TODO This should maybe all be in the navigation store instead? @fabianlinkflink, yes I think that would be much better, otherwise the props could be inspected during transition.
  setup(props) {
    const isOpen = ref(props.show)
    const selectedProjectId = ref(props.projectId)
    const selectedProjectName = ref(props.projectName)

    const instance = getCurrentInstance()
    const speckleStore = useSpeckleStore()
    const navigationStore = useNavigationStore()
    const projectStore = useProjectStore()

    /**
     * Close the modal and emitting back that it was closed
     */
    const closeModal = () => {
      isOpen.value = false
      // Emit back to parent so it knows the modal has been closed and can open a new one
      instance?.emit('closeVersionModal')
    }

    /**
     *  Return the extracted names from all available versions of the project to be used in dropdown
     */
    const extractNames = computed(() => {
      let versions: dropdownItem[] = []

      speckleStore.getAllVersions?.forEach((el) => {
        if (typeof el.message === 'string') {
          const item: dropdownItem = {
            name: el.message,
            data: el.id,
          }

          versions.push(item)
        }
      })
      return versions
    })

    /**
     * Sets the selected version from dropdown selected
     * @param selectedItem
     */
    const handleSelectedItem = (selectedItem: dropdownItem) => {
      const version = speckleStore.getAllVersions?.find(
        (obj) => obj.id === selectedItem.data
      )

      if (version) speckleStore.setSelectedVersion(version)
    }

    /**
     * Load version into the project store and navigating to a project view
     */
    const loadProject = async () => {
      let version: Version

      if (speckleStore.getProjectDetails) {
        // Try to find the project version in the store.
        const versionFound =
          speckleStore.getProjectDetails.stream.commits.items.find(
            (obj) => obj.id === speckleStore.getSelectedVersion?.id
          )

        // If the version was found, set the version and update the store.
        if (versionFound) {
          version = versionFound
          speckleStore.setSelectedVersion(version)
        } else {
          console.error('Could not find the selected model versions.')
        }
      } else {
        console.error('Project store object is undefined.')
      }

      const objects: ResponseObjectStream = await speckleStore.getObjects() // Attempt to get project objects from Speckle.
      const project: Project | null = convertObjects(objects) // Convert objects to a project class, can be null.

      // If project is not null, create it in the project store.
      if (project) {
        projectStore.createNewProject(project)
      } else {
        console.error('Could not create project from Speckle.')
      }

      navigationStore.setActivePage('Overview') // Set the active page in the navigation store.
      router.push('/dashboard') // Navigate to the dashboard.
    }

    // Watch for updates from parent object.
    watch(
      () => props.show,
      (newValue) => {
        isOpen.value = newValue
      }
    )

    watch(
      () => props.projectName,
      (newValue) => {
        selectedProjectName.value = newValue
      }
    )

    watch(
      () => props.projectId,
      (newValue) => {
        selectedProjectId.value = newValue
        speckleStore.updateProjectVersions(newValue, 100, null)
      }
    )

    return {
      isOpen,
      selectedProjectId,
      selectedProjectName,
      speckleStore,
      extractNames,
      handleSelectedItem,
      loadProject,
      closeModal,
    }
  },
})
</script>
{ version }{ version }
