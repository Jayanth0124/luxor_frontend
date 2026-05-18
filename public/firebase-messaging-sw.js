// Firebase Cloud Messaging Service Worker
// Handles background push notifications when the browser tab is not focused.
//
// ⚠️  Service workers cannot access Next.js env vars (NEXT_PUBLIC_*).
//     Fill in your Firebase project values directly below.
//     These are PUBLIC credentials — safe to include in frontend code.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyDVf4siqFzhXAy6VQxVn8J7I8AmhuI69UY',
  authDomain:        'luxor-c82c6.firebaseapp.com',
  projectId:         'luxor-c82c6',
  messagingSenderId: '225699115712',
  appId:             '1:225699115712:web:2e9be70559252dde90f325',
});

const messaging = firebase.messaging();

// Background message handler — shows a native browser notification
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'Luxor';
  const body  = payload.notification?.body  ?? '';
  const icon  = payload.notification?.icon  ?? '/favicon.ico';

  self.registration.showNotification(title, {
    body,
    icon,
    badge: icon,
    data:  payload.data ?? {},
  });
});

// Handle notification click — focus the existing tab or open a new one
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    }),
  );
});
