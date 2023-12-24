/**
 * Entry point of the application.
 * Initializes the Vue app, Pinia store, router, and mounts the app to the DOM.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

export default app
