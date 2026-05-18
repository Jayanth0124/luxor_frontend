'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onForegroundMessage } from '@/lib/firebase';

let _nextId = 0;

export default function FcmToast() {
  const qc = useQueryClient();
  const [toasts, setToasts] = useState([]);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      const id    = ++_nextId;
      const title = payload.notification?.title ?? 'Luxor';
      const body  = payload.notification?.body  ?? '';

      setToasts((prev) => [...prev, { id, title, body }]);
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setTimeout(() => dismiss(id), 6000);
    });

    return unsubscribe;
  }, [qc]);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-slide-in pointer-events-auto flex items-start gap-3 bg-white border border-gray-100 text-gray-900 rounded-2xl shadow-xl px-4 py-3 min-w-72 max-w-sm"
        >
          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#84cc16' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-gray-900">{t.title}</p>
            {t.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.body}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-gray-300 hover:text-gray-600 text-lg leading-none mt-0.5"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
