<template>
  <div v-if="show">
    <div
      class="flex select-none w-full mx-auto fixed bottom-4 align-bottom justify-end right-4"
    >
      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div
          v-for="item in stats"
          :key="item.name"
          class="overflow-hidden rounded-lg bg-white px-2 py-3 shadow-md shadow-gray-300 outline outline-1 outline-gray-200/80 sm:p-6"
        >
          <dt class="truncate text-center text-sm font-normal text-gray-400">
            {{ item.name }}
          </dt>
          <dd
            class="mt-1 text-center text-3xl font-bold tracking-tight text-gray-700"
          >
            {{ item.stat }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SpeckleStats',
  props: {
    visible: Boolean,
    names: Array,
    vals: Array,
  },
  setup(props) {
    const show = props.visible
    let stats = []

    for (let i = 0; i < props.names.length; i++) {
      stats.push({ name: props.names[i], stat: props.vals[i] })
    }

    return { stats, show }
  },
}
</script>
