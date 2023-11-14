import { createApp } from 'vue'
import { createPinia } from 'pinia'

import * as Sentry from "@sentry/vue";

import App from './App.vue'
import router from './router'
import './index.css'

const app = createApp(App)

Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    debug: true, // Set this to `false` for production
    attachStacktrace: true,
    integrations: [
        new Sentry.BrowserTracing({
            // TODO: Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
            tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        }),
        new Sentry.Replay({
            // TODO: Additional SDK configuration goes in here, for example:
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
    // TODO: Performance Monitoring (set appropriate for debug / production.)
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

/*
 * Check to see if Sentry is initialized. If it is, send an info message to Sentry.
*/
if (Sentry.getCurrentHub().getClient()) {
    Sentry.captureMessage("Sentry initilized!", "info");
}

app.use(createPinia())
app.use(router)

app.mount('#app')
