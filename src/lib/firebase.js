// src/lib/firebase.js
// REPLACE these values with your own Firebase project config
// Get them from: Firebase Console → Project Settings → Your Apps → Web App
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHnp7oLzgS0l7W7gZg-6c-bD1_3z2RFCA",
  authDomain: "local-workers-b33d2.firebaseapp.com",
  projectId: "local-workers-b33d2",
  storageBucket: "local-workers-b33d2.firebasestorage.app",
  messagingSenderId: "768305995847",
  appId: "1:768305995847:web:e55e98b6d5535d81121162",
  measurementId: "G-383JZFWLG8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
