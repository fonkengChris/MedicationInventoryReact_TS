// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDHN21a_r1Ho_xnTibzRIyBxlyI9-vbGDM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "medication-inventory-bf350.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "medication-inventory-bf350",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "medication-inventory-bf350.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "857385696434",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:857385696434:web:0b911595c3ee8173899dab",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6DV3XMM8GJ",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const auth = getAuth(app);

export { messaging, getToken, auth };
