import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC0IBi-jGrDD_J2D0jW1PxR9bk1z9SCKiU",
  authDomain: "localwala-d105d.firebaseapp.com",
  projectId: "localwala-d105d",
  storageBucket: "localwala-d105d.firebasestorage.app",
  messagingSenderId: "952352779850",
  appId: "1:952352779850:web:7541f4d5073b78297480b3"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);