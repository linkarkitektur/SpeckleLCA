<template>
  <Sidebar />
</template>

<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { defineComponent, ref, computed } from 'vue';
import { useSpeckleStore } from './stores/speckle';
import router from './router';
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import './index.css'

export default defineComponent({
  name: "App",
  components: {
    Sidebar,
  },
  setup() {
    const serverUrl = ref(import.meta.env.VITE_APP_SERVER_URL);

    const store = useSpeckleStore();
    const isAuthenticated = computed(() => store.isAuthenticated);
    const user = computed(() => store.getUserInfo);
    const project = computed(() => store.getProjectDetails);

    const projectId = computed(() => store.getProjectDetails?.id);

    const navigateToVersionPage = () => {
      if (projectId.value) {
        router.push(`/streams/${projectId.value}`);
      }
    };
    
    const navigateToProject = (event: any) => {
      router.push(`/`);
    };

    const login = () => {
      store.login();
    };

    const logout = () => {
      store.logout;
    };

    return {
      serverUrl,
      isAuthenticated,
      user,
      project,
      navigateToProject,
      navigateToVersionPage,
      login,
      logout,
    };
  },
});
</script>