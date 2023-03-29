import { initializeApp } from "firebase/app";
import { getFirestore, doc, initializeFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.VUE_APP_FIRE_BASE_API_KEY,
  authDomain: process.env.VUE_APP_FIRE_BASE_URL,
  projectId: "specklelca",
  storageBucket: "specklelca.appspot.com", 
  messagingSenderId: "493195109226",
  appId: "1:493195109226:web:a80c3fe330b2f956c13b13",
};

const firebaseApp = initializeApp(config);

initializeFirestore(firebaseApp, {
  ignoreUndefinedProperties: true
});

const db = getFirestore(firebaseApp);

// const mapperDB = doc(db, "mapperList/linkLca");
export default db;
