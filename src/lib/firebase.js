import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ─── Firebase config (NEXT_PUBLIC_ prefix exposes to client bundle) ───────────

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = Object.values(firebaseConfig).every(Boolean);
const isSecureContext = typeof window !== 'undefined' && (window.isSecureContext || location.hostname === 'localhost');

let app       = null;
let messaging = null;

if (isConfigured && isSecureContext) {
  app       = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  messaging = getMessaging(app);
}

// ─── Request permission + get FCM registration token ─────────────────────────

export const requestFcmToken = async () => {
  if (!isConfigured || !messaging) {
    console.warn('Firebase not configured — skipping FCM token request.');
    return null;
  }

  if (!('Notification' in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.info('Notification permission denied.');
    return null;
  }

  try {
    const swReg = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/' },
    );

    const token = await getToken(messaging, {
      vapidKey:                  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    return token || null;
  } catch (err) {
    console.warn('FCM getToken failed:', err.message);
    return null;
  }
};

// ─── Remove FCM token (call on logout) ───────────────────────────────────────

export const removeFcmToken = async () => {
  if (!isConfigured || !messaging) return;
  try {
    const { deleteToken } = await import('firebase/messaging');
    await deleteToken(messaging);
  } catch {
    // ignore
  }
};

// ─── Handle foreground messages (tab is open) ────────────────────────────────

export const onForegroundMessage = (callback) => {
  if (!isConfigured || !messaging) return () => {};
  return onMessage(messaging, callback);
};

export { messaging };
