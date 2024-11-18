<template>
  <div class="relative isolate select-none overflow-hidden bg-white">
    <!-- Transparent Gridded Overlay -->
    <svg
      class="absolute inset-0 -z-10 h-full w-full stroke-green-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
          width="200"
          height="200"
          x="50%"
          y="-1"
          patternUnits="userSpaceOnUse"
        >
          <path d="M.5 200V.5H200" fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        stroke-width="0"
        fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)"
      />
    </svg>

    <div
      class="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-20"
    >
      <div
        class="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8"
      >
        <!-- Main App Icon -->
        <img
          class="h-20"
          :src="iconUrl"
          alt="SpeckLCA Logo"
        />

        <!-- Main hero section. -->
        <h1
          class="mt-10 text-4xl font-semibold tracking-tight text-green-600 sm:text-6xl"
        >
          SpeckLCA
        </h1>

        <p class="ml-1 mt-6 mr-10 text-lg leading-8 text-gray-700">
          SpeckLCA enables cloud-based sustainability calculations across the
          AECO value chain. Leveraging the power of open data through the
          Speckle interoperability system, our vision is to make the LCA process
          accessible to all.<br /><br />

          Start using the software today, or join us in making it better over on
          Github!
        </p>

        <div class="mt-10 flex items-center gap-x-6">
          <a
            href="/projects"
            class="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >Get Started</a
          >
          <a
            href="#features"
            class="text-sm font-semibold leading-6 text-gray-900"
            >Learn More <span aria-hidden="true">→</span></a
          >
        </div>

        <!-- Commmits Section -->
        <div class="object-bottom h-56 overflow-hidden">
          <div class="mt-12 sm:mt-10 lg:mt-12">
            <button
              type="button"
              class="rounded bg-green-100 px-2 py-1 text-sm font-semibold text-green-600 shadow-md"
            >
              Latest Commits
            </button>

            <a
              href="https://github.com/linkarkitektur/SpeckleLCA"
              class="ml-1 mt-1 inline-flex mr-6"
            >
              <span
                class="items-center mr-6 text-sm font-medium leading-6 text-gray-400"
              >
                <span>
                  <span class="flex items-center" v-if="latestCommit">
                    {{ latestCommit }}
                    <ChevronRightIcon
                      class="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                  <span v-else>Loading...</span>
                </span>
                
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- App Screenshot Right -->
      <div
        class="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-7xl lg:flex-none xl:ml-32"
      >
        <div class="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
          <div
            class="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4"
          >
            <img
              :src="appScreenshotUrl"
              alt="App screenshot"
              width="2432"
              height="1442"
              class="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ChevronRightIcon } from '@heroicons/vue/20/solid'
import { defineComponent, ref, onMounted } from 'vue'

import icon from '@/assets/icons/logo.svg'
import appScreenshot from '@/assets/images/AppPicture3D.png'

export default defineComponent({
  name: 'HeroComponent',
  components: {
    ChevronRightIcon,
  },
  setup() {
    const latestCommit = ref<string | null>(null)

    const fetchLatestCommit = async () => {
      try {
        const accessToken = import.meta.env.VITE_GITHUB_TOKEN || false
        const headers: Record<string, string> = {}
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }

        const response = await fetch(
          'https://api.github.com/repos/linkarkitektur/SpeckleLCA/commits/main',
          {
            headers,
          }

        )
        const data = await response.json()
        const latestCommitMessage: string = data.commit.message.split('\n')[0]
        latestCommit.value = latestCommitMessage

      } catch (error) {
        console.error('Error fetching latest commit:', error)
      }
    }
    onMounted(fetchLatestCommit)

    return {
      latestCommit,
      iconUrl: icon,
      appScreenshotUrl: appScreenshot,
    }
  },
})
</script>