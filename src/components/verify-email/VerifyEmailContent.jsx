'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { updateUser } from '@/store/authSlice';
import api from '@/lib/api';

export default function VerifyEmailContent() {
  const sp       = useSearchParams();
  const dispatch = useDispatch();
  const token    = sp.get('token');

  const [status,  setStatus]  = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Verification link is missing or invalid.'); return; }

    api.post('/auth/user/verify-email', { token })
      .then(() => {
        dispatch(updateUser({ emailVerified: true }));
        setStatus('success');
      })
      .catch((e) => {
        setStatus('error');
        setMessage(e.response?.data?.message ?? 'This verification link is invalid or has expired.');
      });
  }, [token]);

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4" style={{ backgroundColor: '#f5f6f7' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="px-8 py-6 text-center" style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)' }}>
          <span className="text-2xl font-black text-white tracking-tight">LUXOR</span>
        </div>

        <div className="px-8 py-10 text-center">
          {status === 'loading' && (
            <>
              <div className="w-10 h-10 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
              <p className="text-sm text-gray-500">Verifying your email address…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h1>
              <p className="text-sm text-gray-500 mb-8">Your email address has been verified successfully.</p>
              <Link href="/profile"
                className="inline-block px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-[#0a2535] transition-colors hover:opacity-90"
                style={{ backgroundColor: '#84cc16' }}>
                Go to Profile
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-sm text-gray-500 mb-8">{message}</p>
              <Link href="/profile"
                className="inline-block px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#84cc16', color: '#4a7c01' }}>
                Back to Profile
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
