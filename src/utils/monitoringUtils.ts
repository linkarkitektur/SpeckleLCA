import * as Sentry from '@sentry/vue'

/**
 * Checks if Sentry is initialized and logs a message to the console..
 */
export function checkSentryInitialized(): void {
	const time = new Date().toTimeString()

	if (Sentry.getCurrentHub().getClient()) {
		console.log(`[Sentry] - Intialised at ${time}`) // Additionally log the message to console.
	}
}

/**
 * Logs a message to Sentry and the console with the specified severity level.
 * @param message The message to be logged.
 * @param severity The severity level of the message. Can be one of "info", "warning", "error", "debug", or "fatal".
 */
export function logMessageToSentry(
	message: string,
	severity: 'info' | 'warning' | 'error' | 'debug' | 'fatal'
) {
	const time = new Date().toTimeString()
	Sentry.captureMessage(message, severity)
	console.log(`[Sentry] - Severity: ${severity}, Info: ${message} at ${time}`) // Additionally log the message to console.
}

/**
 * Reports an error to Sentry and logs it to the console.
 * @param error - The error to be reported.
 */
export function reportErrorToSentry(error: Error) {
	const time = new Date().toTimeString()
	Sentry.captureException(error)
	console.log(`[Sentry] - Error: ${error.name} at ${time}`) // Additionally log the message to console.
}

/**
 * Starts a performance transaction in Sentry.
 * @param {string} name - The name of the transaction.
 * @returns The transaction handle.
 */
export function startPerformanceTransaction(name: string) {
	return Sentry.startTransaction({ name })
}

// Example usage in a Vue component:
// import { reportErrorToSentry, logMessageToSentry, startPerformanceTransaction } from './sentry-monitoring.js';

// In a component method:
// try {
//   // Your code here
// } catch (error) {
//   reportErrorToSentry(error);
// }
