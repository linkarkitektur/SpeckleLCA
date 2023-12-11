<template>
  <div class="relative isolate overflow-hidden bg-white">
    <svg class="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
      <defs>
        <pattern id="0787a7c5-978c-4f66-83c7-11c213f99cb7" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
          <path d="M.5 200V.5H200" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" stroke-width="0" fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)" />
    </svg>
    <div class="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
      <div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
        <img class="h-11" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&amp;shade=600" alt="Your Company" />
        <div class="mt-24 sm:mt-32 lg:mt-16">
          <a href="https://github.com/linkarkitektur/SpeckleLCA" class="inline-flex space-x-6">
            <span class="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">Latest commits</span>
            <span class="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
              <span>
                <span v-if="latestCommit">{{ latestCommit }}</span>
                <span v-else>Loading...</span>
              </span>
              <ChevronRightIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </a>
        </div>
        <h1 class="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">SpeckLCA</h1>
        <p class="mt-6 text-lg leading-8 text-gray-600">SpeckLCA is a opensource sustainability calculation software leveraging speckle as an information exchange platform. Join our efforts at our Github and start using the project!</p>
        <div class="mt-10 flex items-center gap-x-6">
          <a href="/projects" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Get started</a>
          <a href="#features" class="text-sm font-semibold leading-6 text-gray-900">Learn more <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <div class="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
        <div class="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
          <div class="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <img src="https://tailwindui.com/img/component-images/project-app-screenshot.png" alt="App screenshot" width="2432" height="1442" class="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ChevronRightIcon } from '@heroicons/vue/20/solid'
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent ({
  name: "Hero",
  components: {
    ChevronRightIcon
  },
  setup() {
    const latestCommit = ref<string | null>(null);

    const fetchLatestCommit = async() => {
      try {
        const accessToken = import.meta.env.VITE_GITHUB_TOKEN || false;
        const headers: Record<string, string> = {};
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(
          'https://api.github.com/repos/linkarkitektur/SpeckleLCA/commits/main',
          {
            headers,
          }
        );
        const data = await response.json();
        const latestCommitMessage: string = data.commit.message;
        latestCommit.value = latestCommitMessage;
      } catch (error) {
        console.error('Error fetching latest commit:', error);
      }
    };
    onMounted(fetchLatestCommit);

    return {
      latestCommit,
    };
  }
});
</script>