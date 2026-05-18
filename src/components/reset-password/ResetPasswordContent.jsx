'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import PasswordField from './PasswordField';

export default function ResetPasswordContent() {
  const sp    = useSearchParams();
  const token = sp.get('token');

  const [newPass,     setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error,       setError]       = useState('');
  const [done,        setDone]        = useState(false);

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
