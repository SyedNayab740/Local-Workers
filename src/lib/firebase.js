// src/lib/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHnp7oLzgS0l7W7gZg-6c-bD1_3z2RFCA",
  authDomain: "local-workers-b33d2.firebaseapp.com",
  projectId: "local-workers-b33d2",
  storageBucket: "local-workers-b33d2.firebasestorage.app",
  messagingSenderId: "768305995847",
  appId: "1:768305995847:web:e55e98b6d5535d81121162"
};

const app = initializeApp(firebaseConfig);

// ✅ THIS WAS MISSING / BROKEN BEFORE
export const auth = getAuth(app);
export const db = getFirestore(app);