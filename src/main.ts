/**
 * Entry point of the application.
 * Initializes the Vue app, Pinia store, router, and mounts the app to the DOM.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createGtag } from 'vue-gtag'

import App from './App.vue'
import router from './router'
import { initializeFirebase } from '@/firebase'

import './index.css'

import { clickOutsideDirective } from '@/directives/clickDirectives'

// Create the Vue 3 application.
const app = createApp(App)

// Setup our Pinia store, and initialize the router.
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const gtag = createGtag({
  tagId: "G-M3Y1M4BRW5"
})

app.use(pinia)
app.use(router)
app.use(gtag)

// Create directives
app.directive('click-outside' ,clickOutsideDirective)

// Mount the app.
app.mount('#app')

initializeFirebase()

export default app
