<template>
  <div class="grid min-h-screen">
    <div
      class="place-self-center max-w-2xl p-6 rounded-lg bg-white shadow-xl outline outline-1 outline-primary-100/10 text-center"
    >
      <p class="text-primary-100 font-semibold">404</p>
      <h1
        class="mt-4 text-3xl font-bold tracking-tight text-primary-300 sm:text-5xl"
      >
        Uh-oh!
      </h1>
      <p class="mt-8 font-medium leading-7 text-primary-400">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <div class="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="/dashboard"
          class="rounded-md bg-primary-400 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >Go Back Home</a
        >
        <!-- TODO Actually set up support mail. -->
        <a
          href="mailto:support@project.com"
          class="text-sm font-medium text-primary-400 hover:text-primary-500"
          >Contact Support <span aria-hidden="true">&rarr;</span></a
        >
      </div>
    </div>
  </div>
</template>
