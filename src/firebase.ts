import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  authDomain: import.meta.env.VITE_GOOGLE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_GOOGLE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_GOOGLE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_GOOGLE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_GOOGLE_APP_ID,
  measurementId: import.meta.env.VITE_GOOGLE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app);

const testEmail = 'test@example.com';
const testPassword = 'dummyPassword123';

const login = async () => {
  try {
    // Try to create the user
    await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('User created successfully');

    // Sign in the user
    await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('User signed in successfully');

    // Get the current user
    const user = auth.currentUser;
    console.log('Current user:', user);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      // If the email is already in use, sign in the user
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('User signed in successfully');

      // Get the current user
      const user = auth.currentUser;
      console.log('Current user:', user);
    } else {
      console.error('Error:', error);
    }
  }
};

// Call the login function to test the sign-in process
login();

export { db, auth };