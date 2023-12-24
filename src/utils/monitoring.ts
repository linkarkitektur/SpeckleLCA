import * as Sentry from "@sentry/vue";
import app from "../main";
import router from "../router";
import type { Vue } from "@sentry/vue/types/types";

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  debug: true, // TODO Set this to `false` for production
  attachStacktrace: true,
  integrations: [
    new Sentry.BrowserTracing({
      // TODO Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
    }),
    new Sentry.Replay({
      // Additional SDK configuration:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Performance (set appropriately for production.)
  tracesSampleRate: 1.0, // Capture 100% of transactions
  replaysSessionSampleRate: 0.5, // Change the sample rate to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

/**
 * Configures global error handling for Vue application.
 * @param {Vue} app - The Vue 3 application instance.
 */
export function configureGlobalErrorHandling(app: Vue) {
  app.config.errorHandler = (err: any, vm: any, info: any) => {
    Sentry.captureException(err, {
      extra: { info }
    });
    console.error(`Error: ${err}, Info: ${info}`);
  };
}

/**
 * Checks if Sentry is initialized and logs a message to the console..
 */
export function checkSentryInitialized(): void {
  const time = new Date().toTimeString();

  if (Sentry.getCurrentHub().getClient()) {
    console.log(`[Sentry] - Intialised at ${time}`); // Additionally log the message to console.
  }
}

/**
 * Logs a message to Sentry and the console with the specified severity level.
 * @param message The message to be logged.
 * @param severity The severity level of the message. Can be one of "info", "warning", "error", "debug", or "fatal".
 */
export function logMessageToSentry(message: string, severity: "info" | "warning" | "error" | "debug" | "fatal") {
  const time = new Date().toTimeString();
  Sentry.captureMessage(message, severity);
  console.log(`[Sentry] - Severity: ${severity}, Info: ${message} at ${time}`); // Additionally log the message to console.
}

/**
 * Reports an error to Sentry and logs it to the console.
 * @param error - The error to be reported.
 */
export function reportErrorToSentry(error: Error) {
  const time = new Date().toTimeString();
  Sentry.captureException(error);
  console.log(`[Sentry] - Error: ${error.name} at ${time}`); // Additionally log the message to console.
}

/**
 * Starts a performance transaction in Sentry.
 * @param {string} name - The name of the transaction.
 * @returns The transaction handle.
 */
export function startPerformanceTransaction(name: string) {
  return Sentry.startTransaction({ name });
}

// Example usage in a Vue component:
// import { reportErrorToSentry, logMessageToSentry, startPerformanceTransaction } from './sentry-monitoring.js';

// In a component method:
// try {
//   // Your code here
// } catch (error) {
//   reportErrorToSentry(error);
// }