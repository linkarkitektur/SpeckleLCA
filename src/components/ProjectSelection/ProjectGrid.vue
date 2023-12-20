<template>
  <div class="flex-1 p-6">
    <div class="bg-white p-4 shadow-md rounded-md">
      <VersionSelectionModal :show="versionModalOpen" :projectId="selectedProjectId" :projectName="selectedProjectName" @closeVersionModal="closeVersionModal" />
      <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="project in speckleStore.allProjects" 
          :key="project.name"
          class="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow">
          <div class="flex flex-1 flex-col p-8">
            <iframe :src="getEmbeddedUrl(project)"></iframe>
            <button @click="openVersionModal(project)">
              <dd class="text-sm text-gray-500">{{ project.name }}</dd>
              <dd class="mt-3">
                <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{{ project.updatedAt }}</span>
              </dd>
            </button>
          </div>
          <div>
            <div class="-mt-px flex divide-x divide-gray-200">
              <div class="flex w-0 flex-1">
                <a class="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-green-900 text-center">
                  7,3 kg-co² / m²
                </a>
              </div>
              <div class="-ml-px flex w-0 flex-1">
                <a class="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-yellow-800 text-center">
                  10% above threshold
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
import { useSpeckleStore } from '@/stores/speckle';
import { defineComponent, onMounted, ref } from 'vue';
import type { ProjectId } from '@/models/speckle';
import VersionSelectionModal from '@/components/ProjectSelection/VersionSelectionModal.vue';

import { useNavigationStore } from '@/stores/main';

export default defineComponent ({
  name: "ProjectGrid",
  components: {
    VersionSelectionModal
  },
  methods: {
    getEmbeddedUrl(project: ProjectId) {
      const baseUrl = import.meta.env.VITE_APP_SERVER_URL || "https://speckle.xyz";
      const streamId = project.id;
      
      return `${baseUrl}/embed?stream=${streamId}&transparent=true&hidecontrols=true&hidesidebar=true&hideselectioninfo=true`;
    },
  },
  setup() {
    const versionModalOpen = ref(false);
    const selectedProjectId = ref("");
    const selectedProjectName = ref("");

    const speckleStore = useSpeckleStore();
    const navStore = useNavigationStore();

    const openVersionModal = (project: ProjectId) => {
      versionModalOpen.value = true;
      
      // Update versions for this project so we can load into dropdown selection
      speckleStore.updateProjectVersions(project.id, 100, null);
      
      selectedProjectId.value = project.id;
      selectedProjectName.value = project.name;
    };

    const closeVersionModal = () => {
      versionModalOpen.value = false;
    };

    const openSlideOver = () => {
      navStore.toggleSlideover();
    }
    onMounted(speckleStore.updateProjects);

    return {
      speckleStore,
      versionModalOpen,
      selectedProjectId,
      selectedProjectName,
      openVersionModal,
      closeVersionModal,
      openSlideOver,
    };
  },
});
</script>