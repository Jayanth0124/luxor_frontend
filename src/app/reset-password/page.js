'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      className="px-3 text-gray-400 hover:text-gray-600 transition-colors absolute right-0 top-1/2 -translate-y-1/2">
      {show
        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      }
    </button>
  );
}

function PasswordField({ label, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 focus:outline-none focus:border-[#84cc16] transition-colors"
        />
        <EyeToggle show={show} onToggle={() => setShow(v => !v)} />
      </div>
    </div>
  );
}

function ResetPasswordContent() {
  const sp     = useSearchParams();
  const router = useRouter();
  const token  = sp.get('token');

  const [newPass,    setNewPass]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error,      setError]      = useState('');
  const [done,       setDone]       = useState(false);

  const mutation = useMutation({
    mutationFn: ({ tok, pw }) => api.post('/auth/user/reset-password-token', { token: tok, newPassword: pw }),
    onSuccess:  () => setDone(true),
    onError:    (e) => setError(e.response?.data?.message ?? 'Reset failed. The link may have expired.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    if (!token) { setError('Reset token is missing.'); return; }
    if (newPass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    mutation.mutate({ tok: token, pw: newPass });
  };

  if (!token) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-gray-500 mb-6">Invalid reset link. Please request a new one.</p>
        <Link href="/forgot-password" className="text-sm font-bold" style={{ color: '#84cc16' }}>
          Forgot Password
        </Link>
      </div>
    );
  }

  return (
    <div className="px-8 py-10">
      {!done ? (
        <>
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#f0fdf4] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" style={{ color: '#84cc16' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Set New Password</h1>
            <p className="text-sm text-gray-500">Choose a strong password for your Luxor account.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <PasswordField label="New Password" value={newPass}
              onChange={(e) => { setError(''); setNewPass(e.target.value); }}
              placeholder="Min. 8 characters" autoComplete="new-password" />
            <PasswordField label="Confirm Password" value={confirmPass}
              onChange={(e) => { setError(''); setConfirmPass(e.target.value); }}
              placeholder="Repeat your new password" autoComplete="new-password" />
            {error && <p className="text-red-500 text-xs font-semibold mb-3">{error}</p>}
            <button type="submit" disabled={mutation.isPending || !newPass || !confirmPass}
              className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center disabled:opacity-50"
              style={{ backgroundColor: '#84cc16', color: '#0a2535' }}>
              {mutation.isPending
                ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : 'Reset Password'}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h1>
          <p className="text-sm text-gray-500 mb-8">Your password has been updated. You can now sign in with your new password.</p>
          <Link href="/"
            className="inline-block px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-[#0a2535] transition-colors hover:opacity-90"
            style={{ backgroundColor: '#84cc16' }}>
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4" style={{ backgroundColor: '#f5f6f7' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="px-8 py-6 text-center" style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)' }}>
          <span className="text-2xl font-black text-white tracking-tight">LUXOR</span>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
