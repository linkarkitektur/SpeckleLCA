import { initializeApp } from 'firebase/app'
import { Firestore, getFirestore } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useSettingsStore } from '@/stores/settingStore'

export let db: Firestore = null

export function initializeFirebase() {
  const settingsStore = useSettingsStore()

  if (!settingsStore.keySettings.firebaseConfig || !settingsStore.keySettings.firebaseConfig.apiKey) {
    console.error('Firebase configuration or API key not found in settings')
  }

  const app = initializeApp(settingsStore.keySettings.firebaseConfig)
  const tempDb = getFirestore(app)
  const auth = getAuth(app)

  login(auth)

  // update database when intialized
  db = tempDb

  return { tempDb, auth }
}

async function login(auth) {
  const testEmail = 'test@example.com'
  const testPassword = 'dummyPassword123'
  try {
    // Try to create the user
    await createUserWithEmailAndPassword(auth, testEmail, testPassword)
    console.log('User created successfully')

    // Sign in the user
    await signInWithEmailAndPassword(auth, testEmail, testPassword)
    console.log('User signed in successfully')

    // Get the current user
    const user = auth.currentUser
    console.log('Current user:', user)
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      // If the email is already in use, sign in the user
      await signInWithEmailAndPassword(auth, testEmail, testPassword)
      console.log('User signed in successfully')

      // Get the current user
      const user = auth.currentUser
      console.log('Current user:', user)
    } else {
      console.error('Error:', error)
    }
  }
}