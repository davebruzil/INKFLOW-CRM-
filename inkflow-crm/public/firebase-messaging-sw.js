// Firebase Cloud Messaging Service Worker (V1 API)
// This file handles background notifications when the app is closed or not in focus

// Import Firebase scripts for service worker (V9 modular SDK)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyAK7fpgpjWVz-y1lWGTpAEzEFWvuOZDYo4",
  authDomain: "easybook-d2633.firebaseapp.com",
  projectId: "easybook-d2633",
  storageBucket: "easybook-d2633.firebasestorage.app",
  messagingSenderId: "87072368963",
  appId: "1:87072368963:web:98552a5be13f8cb628a7f6"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Client Added';
  const notificationOptions = {
    body: payload.notification?.body || 'A new client has been added to your CRM',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'new-client-notification',
    requireInteraction: true,
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View Client'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Open the app when "View Client" is clicked
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
