// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDHN21a_r1Ho_xnTibzRIyBxlyI9-vbGDM",
  authDomain:
    process.env.NODE_ENV === "development"
      ? "localhost"
      : "medication-inventory-bf350.firebaseapp.com",
  projectId: "medication-inventory-bf350",
  storageBucket: "medication-inventory-bf350.firebasestorage.app",
  messagingSenderId: "857385696434",
  appId: "1:857385696434:web:0b911595c3ee8173899dab",
  measurementId: "G-6DV3XMM8GJ",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const auth = getAuth(app);

export { messaging, getToken, auth };
