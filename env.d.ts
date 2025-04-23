/**
 * This file contains the type definitions for the environment variables used in the project.
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
	VITE_GITHUB_TOKEN: string
	VITE_SPECKLE_SERVER_URL: string
	VITE_SPECKLE_ID: string
	VITE_SPECKLE_SECRET: string
	VITE_FIREBASE_API_KEY: string
	VITE_FIREBASE_AUTH_DOMAIN: string
	VITE_FIREBASE_PROJECT_ID: string
	VITE_FIREBASE_STORAGE_BUCKET: string
	VITE_FIREBASE_MESSAGING_SENDER_ID: string
	VITE_FIREBASE_APP_ID: string
	VITE_FIREBASE_MEASUREMENT_ID: string
}
