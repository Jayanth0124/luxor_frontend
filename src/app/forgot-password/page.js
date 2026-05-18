'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const mutation = useMutation({
    mutationFn: (em) => api.post('/auth/user/forgot-password', { email: em }),
    onSuccess:  () => setSent(true),
    onError:    (e) => setError(e.response?.data?.message ?? 'Something went wrong. Please try again.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    mutation.mutate(email);
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4" style={{ backgroundColor: '#f5f6f7' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="px-8 py-6 text-center" style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)' }}>
          <span className="text-2xl font-black text-white tracking-tight">LUXOR</span>
        </div>

        <div className="px-8 py-10">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-[#f0fdf4] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7" style={{ color: '#84cc16' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
                <p className="text-sm text-gray-500">
                  Enter the email address associated with your Luxor account and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setError(''); setEmail(e.target.value); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#84cc16] transition-colors mb-4"
                />
                {error && <p className="text-red-500 text-xs font-semibold mb-3">{error}</p>}
                <button type="submit" disabled={mutation.isPending || !email}
                  className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center disabled:opacity-50"
                  style={{ backgroundColor: '#84cc16', color: '#0a2535' }}>
                  {mutation.isPending
                    ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                Remember your password?{' '}
                <Link href="/" className="font-bold text-gray-600 hover:text-gray-900 transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h1>
              <p className="text-sm text-gray-500 mb-2">
                If <span className="font-semibold text-gray-700">{email}</span> is registered with a password account, you&apos;ll receive a reset link shortly.
              </p>
              <p className="text-xs text-gray-400 mb-8">The link expires in 1 hour. Check your spam folder if you don&apos;t see it.</p>
              <Link href="/"
                className="inline-block px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#84cc16', color: '#4a7c01' }}>
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
