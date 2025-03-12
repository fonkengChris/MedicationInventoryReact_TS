// firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"
);

// Use development configuration
firebase.initializeApp({
  apiKey: "AIzaSyDHN21a_r1Ho_xnTibzRIyBxlyI9-vbGDM",
  authDomain: "localhost",
  projectId: "medication-inventory-bf350",
  storageBucket: "medication-inventory-bf350.firebasestorage.app",
  messagingSenderId: "857385696434",
  appId: "1:857385696434:web:0b911595c3ee8173899dab",
  measurementId: "G-6DV3XMM8GJ",
});

const messaging = firebase.messaging();

// Optional: Add background message handler
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png",
    badge: "/notification-badge.png",
    tag: "medication-alert",
    data: payload.data,
  };

  console.log("[firebase-messaging-sw.js] Creating notification with:", {
    title: notificationTitle,
    options: notificationOptions,
  });

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Add service worker lifecycle handlers
self.addEventListener("install", (event) => {
  console.log("[firebase-messaging-sw.js] Service Worker installed");
});

self.addEventListener("activate", (event) => {
  console.log("[firebase-messaging-sw.js] Service Worker activated");
});
