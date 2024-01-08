<template>
  <div class="grid min-h-screen select-none">
    <div
      class="place-self-center max-w-2xl p-6 rounded-xl bg-white shadow-xl outline outline-1 outline-primary-100/10 text-center"
    >
      <img
        class="mx-auto h-20 opacity-20"
        src="/logo.jpeg"
        alt="Link I/O Logo"
      />
      <h2
        class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-primary-400"
      >
        Welcome to SpeckLCA
      </h2>

      <div class="mt-6 mx-auto">
        <div>
          <button
            :click="login()"
            class="flex w-full justify-center rounded-md bg-primary-400 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Sign In With Speckle
          </button>
        </div>

        <p class="mt-6 text-center text-sm text-primary-500">
          Don't have an account?
          {{ ' ' }}
          <a
            href="https://speckle.systems/"
            class="font-semibold leading-6 text-primary-300 hover:text-primary-400"
            >Get one here.</a
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useSpeckleStore } from '@/stores/speckle'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginComponent',
  setup() {
    const speckleStore = useSpeckleStore()

    const login = () => {
      speckleStore.login()
    }

    return {
      login,
      speckleStore,
    }
  },
})
</script>
