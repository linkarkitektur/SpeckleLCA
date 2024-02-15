/**
 * Entry point of the application.
 * Initializes the Vue app, Pinia store, router, and mounts the app to the DOM.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import * as Sentry from '@sentry/vue'

import './index.css'
import type { Vue } from '@sentry/vue/types/types'

// Create the Vue 3 application.
const app = createApp(App)

// Initialize Sentry for application-wide
// error monitoring and performance tracking.
Sentry.init({
  app,
  // dsn: import.meta.env.VITE_SENTRY_DSN,
  debug: false, // TODO Set this to `false` for production
  attachStacktrace: true,
  integrations: [
    new Sentry.BrowserTracing({
      // TODO Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
      routingInstrumentation: Sentry.vueRouterInstrumentation(router)
    }),
    new Sentry.Replay({
      // Additional SDK configuration:
      maskAllText: true,
      blockAllMedia: true
    })
  ],
  // Performance (set appropriately for production.)
  tracesSampleRate: 0.1, // Capture 100% of transactions
  replaysSessionSampleRate: 0.5, // Change the sample rate to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

/**
 * Configures global error handling for Vue application.
 * @param {Vue} app - The Vue 3 application instance.
 */
export function configureGlobalErrorHandling(app: Vue) {
  app.config.errorHandler = (err: any, vm: any, info: any) => {
    Sentry.captureException(err, {
      extra: { info }
    })
    console.error(`Error: ${err}, Info: ${info}`)
  }
}

// Setup our Pinia store, and initialize the router.
app.use(createPinia())
app.use(router)

// Mount the app.
app.mount('#app')

export default app
