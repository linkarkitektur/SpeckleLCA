import firebase from "firebase/app";
import { serverTimestamp } from "firebase/firestore";
import "firebase/firestore";

const config = {
  apiKey: process.env.VUE_APP_FIRE_BASE_API_KEY,
  authDomain: process.env.VUE_APP_FIRE_BASE_URL,
  projectId: "linklca",
  storageBucket: "linklca.appspot.com",
  messagingSenderId: "672281257450",
  appId: "1:672281257450:web:6fe2b06e8b90f11b063e93",
};

const firebaseApp = firebase.initializeApp(config);
const timestamp = serverTimestamp();

export { timestamp };
export default firebaseApp.firestore();
