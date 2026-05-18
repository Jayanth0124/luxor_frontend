'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export default function SecurityCard({ user }) {
  const dispatch = useDispatch();

  const [verifyMsg, setVerifyMsg] = useState('');
  const verifyMutation = useMutation({
    mutationFn: () => api.post('/users/me/send-verification-email'),
    onSuccess:  () => setVerifyMsg('Verification email sent! Check your inbox.'),
    onError:    (e) => setVerifyMsg(e.response?.data?.message ?? 'Failed to send email.'),
  });

  const [showPwForm,  setShowPwForm]  = useState(false);
  const [currentPw,   setCurrentPw]  = useState('');
  const [newPw,       setNewPw]      = useState('');
  const [confirmPw,   setConfirmPw]  = useState('');
  const [pwError,     setPwError]    = useState('');
  const [pwSuccess,   setPwSuccess]  = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]    = useState(false);

  const pwMutation = useMutation({
    mutationFn: ({ cur, nw }) => api.patch('/users/me/password', { currentPassword: cur, newPassword: nw }),
    onSuccess: () => {
      setPwSuccess('Password changed successfully.');
      setPwError(''); setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => { setShowPwForm(false); setPwSuccess(''); }, 2000);
    },
    onError: (e) => setPwError(e.response?.data?.message ?? 'Failed to change password.'),
  });

  const handlePwSubmit = (e) => {
    e.preventDefault(); setPwError(''); setPwSuccess('');
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    pwMutation.mutate({ cur: currentPw, nw: newPw });
  };

  const hasEmail    = !!user?.email;
  const isVerified  = !!user?.emailVerified;
  const hasPassword = !!user?.hasPassword;

  const eyeSvg = (show) => show
    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;

  const pwInput = (label, value, onChange, show, onToggle, autoComplete) => (
    <div className="mb-3">
      <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1.5">{label}</label>
      <div className="relative flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#84cc16] transition-colors">
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete}
          className="flex-1 px-4 py-2.5 text-sm text-gray-900 focus:outline-none bg-white" />
        <button type="button" onClick={onToggle} className="px-3 text-gray-400 hover:text-gray-600">{eyeSvg(show)}</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {hasEmail && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Email Verification</h2>
          </div>
          <div className="px-6 py-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isVerified ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              {isVerified
                ? <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                : <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                {isVerified
                  ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Verified
                    </span>
                  : <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Unverified</span>
                }
              </div>
              {!isVerified && (
                <>
                  <p className="text-sm text-gray-500 mb-3 leading-relaxed">Verify your email to secure your account and receive booking updates.</p>
                  {verifyMsg
                    ? <p className="text-xs font-semibold" style={{ color: verifyMsg.includes('sent') ? '#16a34a' : '#ef4444' }}>{verifyMsg}</p>
                    : <button onClick={() => verifyMutation.mutate()} disabled={verifyMutation.isPending}
                        className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition-colors hover:bg-[#f7fee7] disabled:opacity-50"
                        style={{ borderColor: '#84cc16', color: '#4a7c01' }}>
                        {verifyMutation.isPending ? 'Sending…' : 'Send Verification Email'}
                      </button>
                  }
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Password & Authentication</h2>
          {!showPwForm && (
            <button onClick={() => { setShowPwForm(true); setPwError(''); setPwSuccess(''); }}
              className="text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-lg border transition-colors hover:bg-[#f7fee7]"
              style={{ borderColor: '#84cc16', color: '#4a7c01' }}>
              {hasPassword ? 'Change Password' : 'Set Password'}
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          {!showPwForm ? (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {hasPassword ? 'Password set' : 'No password set'}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {hasPassword
                    ? 'Use a strong, unique password to keep your account secure.'
                    : 'Set a password to enable email login in addition to mobile OTP.'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePwSubmit} className="max-w-sm">
              {hasPassword && pwInput('Current Password', currentPw, (e) => setCurrentPw(e.target.value), showCurrent, () => setShowCurrent(v => !v), 'current-password')}
              {pwInput('New Password', newPw, (e) => setNewPw(e.target.value), showNew, () => setShowNew(v => !v), 'new-password')}
              {pwInput('Confirm New Password', confirmPw, (e) => setConfirmPw(e.target.value), showNew, () => setShowNew(v => !v), 'new-password')}
              {pwError   && <p className="text-red-500 text-xs font-semibold mb-3">{pwError}</p>}
              {pwSuccess && <p className="text-emerald-600 text-xs font-semibold mb-3">{pwSuccess}</p>}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setShowPwForm(false); setPwError(''); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={pwMutation.isPending || !newPw || !confirmPw}
                  className="text-xs font-black uppercase tracking-wider px-5 py-2 rounded-lg text-[#1a2e05] transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#84cc16' }}>
                  {pwMutation.isPending ? 'Saving…' : 'Save Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
