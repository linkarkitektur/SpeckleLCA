<template>
  <div id="features" class="overflow-hidden bg-white py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
        <div class="lg:ml-auto lg:pl-4 lg:pt-4">
          <div class="lg:max-w-lg">
            <h2 class="text-base font-semibold leading-7 text-indigo-600">Sustainability in the cloud</h2>
            <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Go green through SpeckLCA</p>
            <p class="mt-6 text-lg leading-8 text-gray-600">SpeckLCA is using modern technology to provide precise and stable calculations directly from your uploaded 3D models. By developing in a modular way you can make your own extensions to improve the app for your specific needs.</p>
            <dl class="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
              <div v-for="feature in features" :key="feature.name" class="relative pl-9">
                <dt class="inline font-semibold text-gray-900">
                  <component :is="feature.icon" class="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                  {{ feature.name }}
                </dt>
                {{ ' ' }}
                <dd class="inline">{{ feature.description }}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div class="flex items-start justify-end lg:order-first">
          <img src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png" alt="Product screenshot" class="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]" width="2432" height="1442" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { HomeModernIcon, FunnelIcon, ServerStackIcon } from '@heroicons/vue/20/solid'
import { defineComponent } from 'vue';

export default defineComponent ({
  name: "Features",
  components: {
  },
  setup() {
    const features = [
      {
        name: '3D models',
        description:
          'By simple integration with 3D software and cloud hosting you can connect your sustainability reports directly to your models.',
        icon: HomeModernIcon,
      },
      {
        name: 'Materials',
        description: 'Mapping materials towards your models is at the core of LCA, so we made it as simple as possible with a vast array of filters.',
        icon: FunnelIcon,
      },
      {
        name: 'Modular',
        description: 'SpeckLCA is built on a  simple modular system made for you to expand and contribute towards a more sustainable future.',
        icon: ServerStackIcon,
      },
    ];

    return {
      features,
    };
  }
});
</script>