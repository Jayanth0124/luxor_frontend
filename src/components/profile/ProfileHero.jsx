'use client';

import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUser } from '@/store/authSlice';
import api from '@/lib/api';

export function getInitials(user) {
  if (!user) return 'U';
  if (user.name)   return user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  if (user.email)  return user.email[0].toUpperCase();
  if (user.mobile) return user.mobile.slice(-2);
  return 'U';
}

export default function ProfileHero({ user }) {
  const dispatch    = useDispatch();
  const fileRef     = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');

  const initials    = getInitials(user);
  const displayName = user?.name || user?.email || (user?.mobile ? `+91 ${user.mobile}` : 'User');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(updateUser({ profilePic: data.data.profilePic }));
    } catch {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div
      className="w-full"
      style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 45%, #1a6b3a 75%, #166534 100%)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex items-center gap-5">

        {/* Avatar with upload overlay */}
        <div className="relative shrink-0 group">
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt={displayName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/20 shadow-lg"
            />
          ) : (
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-bold text-2xl sm:text-3xl border-2 border-white/20 shadow-lg"
              style={{ backgroundColor: '#84cc16', color: '#1a2e05' }}
            >
              {initials}
            </div>
          )}

          {/* Upload button overlay */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            title="Change photo"
            className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Info */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{displayName}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
            {user?.mobile && (
              <span className="flex items-center gap-1.5 text-sm text-white/70">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +91 {user.mobile}
              </span>
            )}
            {user?.email && (
              <span className="flex items-center gap-1.5 text-sm text-white/70 truncate">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user.email}
              </span>
            )}
          </div>
          {error && <p className="text-xs text-red-300 mt-2">{error}</p>}
          <p className="text-xs text-white/40 mt-1.5">Hover on photo to change</p>
        </div>
      </div>
    </div>
  );
}
