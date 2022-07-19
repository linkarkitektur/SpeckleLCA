import { initializeApp } from "firebase/app";
import { getFirestore, doc } from "firebase/firestore";

const config = {
  apiKey: "AIzaSyAthaBO8gmMnhcg2DcwRCf71JWjNAnKni0",
  authDomain: "linklca.firebaseapp.com",
  projectId: "linklca",
  storageBucket: "linklca.appspot.com", 
  messagingSenderId: "672281257450",
  appId: "1:672281257450:web:6fe2b06e8b90f11b063e93",
};

const firebaseApp = initializeApp(config);
const db = getFirestore(firebaseApp);

const mapperDB = doc(db, "mapperList/linkLca");
export default mapperDB;
