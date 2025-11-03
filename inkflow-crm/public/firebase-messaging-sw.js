// Firebase Cloud Messaging Service Worker (V1 API)
// This file handles background notifications when the app is closed

console.log('[Service Worker] Firebase Messaging SW loaded');

// Listen for push events (sent by Firebase)
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received:', event);

  let notificationData = {
    title: 'New Client Added',
    body: 'A new client has been added to your CRM',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'new-client-notification',
    requireInteraction: true
  };

  // If FCM sent data with the push
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[Service Worker] Push data:', payload);

      // Extract notification data from FCM payload
      if (payload.notification) {
        notificationData.title = payload.notification.title || notificationData.title;
        notificationData.body = payload.notification.body || notificationData.body;
      }

      // Store custom data for click handling
      notificationData.data = payload.data || {};
    } catch (e) {
      console.error('[Service Worker] Error parsing push data:', e);
    }
  }

  // Show the notification
  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
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
    }
  );

  event.waitUntil(promiseChain);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Open the app when "View Client" is clicked
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Service worker installation
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim());
});
