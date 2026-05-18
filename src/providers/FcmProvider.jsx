'use client';

import { useEffect } from 'react';
import { requestFcmToken } from '@/lib/firebase';
import api from '@/lib/api';
import FcmToast from '@/components/FcmToast';

// Call this after a successful login to register the FCM token with the backend.
// Usage: await registerFcmToken();
export const registerFcmToken = async () => {
  try {
    const token = await requestFcmToken();
    if (token) {
      await api.post('/notifications/register-token', { token, platform: 'web' });
    }
  } catch (err) {
    console.warn('FCM token registration failed:', err.message);
  }
};

// Call this on logout to remove the FCM token from the backend.
export const unregisterFcmToken = async () => {
  try {
    await api.delete('/notifications/register-token');
  } catch {
    // ignore — token cleanup is best-effort
  }
};

// FcmProvider mounts the foreground toast listener globally.
// Wrap your app (or authenticated layout) with this component.
export default function FcmProvider({ children }) {
  return (
    <>
      {children}
      <FcmToast />
    </>
  );
}
