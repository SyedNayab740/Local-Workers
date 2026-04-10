import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "PASTE_YOURS",
  authDomain: "local-workers-b33d2.firebaseapp.com",
  projectId: "local-workers-b33d2",
  storageBucket: "local-workers-b33d2.appspot.com",
  messagingSenderId: "768305995847",
  appId: "1:768305995847:web:e55e98b6d5535d81121162"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);