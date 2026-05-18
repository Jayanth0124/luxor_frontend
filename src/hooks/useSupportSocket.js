'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { store } from '@/store/store';
import { selectAccessToken } from '@/store/authSlice';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8081';

export default function useSupportSocket({ onMessage, onStatusChange } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = selectAccessToken(store.getState());
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket'],
    });

    socketRef.current = socket;

    if (onMessage)      socket.on('support:message',      onMessage);
    if (onStatusChange) socket.on('support:status_change', onStatusChange);

    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef;
}
