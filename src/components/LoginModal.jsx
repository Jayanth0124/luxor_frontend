'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { setCredentials, updateUser } from '@/store/authSlice';
import api from '@/lib/api';

/* ─── OTP 6-box ───────────────────────────────────────────────────────── */
function OtpBoxes({ value, onChange }) {
  const refs = Array.from({ length: 6 }, () => useRef(null));

  const handle = (i, raw) => {
    const d = raw.replace(/\D/g, '').slice(-1);
    const n = [...value]; n[i] = d; onChange(n);
    if (d && i < 5) refs[i + 1].current?.focus();
  };
  const keyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (value[i]) { const n = [...value]; n[i] = ''; onChange(n); }
      else if (i > 0) refs[i - 1].current?.focus();
    }
  };
  const paste = (e) => {
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!t) return; e.preventDefault();
    const n = t.split('').concat(Array(6).fill('')).slice(0, 6);
    onChange(n); refs[Math.min(t.length, 5)].current?.focus();
  };

  return (
    <div className="grid grid-cols-6 gap-1.5">
      {refs.map((ref, i) => (
        <input key={i} ref={ref} type="text" inputMode="numeric" maxLength={1}
          value={value[i]}
          onChange={(e) => handle(i, e.target.value)}
          onKeyDown={(e) => keyDown(i, e)}
          onPaste={paste}
          className="w-full aspect-square text-center text-[#0a2535] text-lg font-black rounded-xl border-2 focus:outline-none transition-all"
          style={{ borderColor: value[i] ? '#84cc16' : '#e5e7eb', backgroundColor: value[i] ? '#f0fdf4' : '#f9fafb' }}
        />
      ))}
    </div>
  );
}

/* ─── Countdown ───────────────────────────────────────────────────────── */
function useCountdown(secs) {
  const [left, setLeft] = useState(0);
  const start = (s = secs) => setLeft(s);
  useEffect(() => {
    if (!left) return;
    const id = setInterval(() => setLeft(l => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [left]);
  return { left, start };
}

/* ─── Shared styled input ─────────────────────────────────────────────── */
function TextInput({ label, type = 'text', value, onChange, placeholder, autoComplete, suffix, error }) {
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-1.5">{label}</label>
      <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors focus-within:border-[#84cc16] ${error ? 'border-red-400' : 'border-gray-200'}`}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
          className="flex-1 px-4 py-3 text-sm font-semibold text-[#0a2535] placeholder-gray-300 focus:outline-none bg-white"
        />
        {suffix}
      </div>
      {error && <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>}
    </div>
  );
}

/* ─── Eye icon ─────────────────────────────────────────────────────────── */
function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className="px-3 text-gray-400 hover:text-gray-600 transition-colors">
      {show
        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      }
    </button>
  );
}

/* ─── Submit button ────────────────────────────────────────────────────── */
function SubmitBtn({ label, disabled, loading, accent = false }) {
  return (
    <button type="submit" disabled={disabled || loading}
      className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-1"
      style={{
        backgroundColor: disabled || loading ? '#e5e7eb' : accent ? '#84cc16' : '#0a2535',
        color:           disabled || loading ? '#9ca3af' : accent ? '#0a2535' : '#fff',
      }}
    >
      {loading
        ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        : label}
    </button>
  );
}

/* ─── Main modal ──────────────────────────────────────────────────────── */
export default function LoginModal({ open, onClose, onSuccess }) {
  const dispatch = useDispatch();

  const [tab,       setTab]       = useState('otp');    // 'otp' | 'email'
  const [mode,      setMode]      = useState('login');  // 'login' | 'signup'
  const [step,      setStep]      = useState('phone');  // 'phone' | 'verify' | 'name' | 'email-otp'
  const [error,     setError]     = useState('');
  const [nameInput, setNameInput] = useState('');

  // Email OTP (signup)
  const [emailOtp,  setEmailOtp]  = useState(Array(6).fill(''));
  const { left: emailOtpLeft, start: startEmailOtp } = useCountdown(30);

  // OTP form
  const [mobile, setMobile] = useState('');
  const [otp,    setOtp]    = useState(Array(6).fill(''));
  const { left: resendLeft, start: startResend } = useCountdown(30);

  // Email form
  const [name,   setName]   = useState('');
  const [email,  setEmail]  = useState('');
  const [pass,   setPass]   = useState('');
  const [phone,  setPhone]  = useState('');
  const [showPw, setShowPw] = useState(false);

  const reset = () => {
    setTab('otp'); setMode('login'); setStep('phone'); setError('');
    setMobile(''); setOtp(Array(6).fill(''));
    setName(''); setEmail(''); setPass(''); setPhone(''); setShowPw(false);
    setNameInput(''); setEmailOtp(Array(6).fill(''));
  };

  useEffect(() => { if (!open) { const t = setTimeout(reset, 300); return () => clearTimeout(t); } }, [open]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  /* ── Mutations ── */
  const sendOtpMutation = useMutation({
    mutationFn: (mob) => api.post('/auth/user/send-otp', { mobile: mob }),
    onSuccess: () => { setStep('verify'); startResend(30); setError(''); },
    onError:   (e) => setError(e.response?.data?.message ?? 'Failed to send OTP.'),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({ mob, code }) => api.post('/auth/user/login', { mobile: mob, otp: code }),
    onSuccess: ({ data }) => {
      const userData = data.data.user;
      dispatch(setCredentials({
        accessToken:  data.data.accessToken,
        refreshToken: data.data.refreshToken,
        user: userData || { mobile },
      }));
      if (userData?.name) { onClose(); onSuccess?.(); }
      else setStep('name');
    },
    onError: (e) => setError(e.response?.data?.message ?? 'Invalid OTP. Try again.'),
  });

  const resendOtpMutation = useMutation({
    mutationFn: (mob) => api.post('/auth/user/send-otp', { mobile: mob }),
    onSuccess: () => { startResend(30); setOtp(Array(6).fill('')); setError(''); },
    onError:   (e) => setError(e.response?.data?.message ?? 'Failed to resend OTP.'),
  });

  const emailLoginMutation = useMutation({
    mutationFn: ({ em, pw }) => api.post('/auth/user/login-email', { email: em, password: pw }),
    onSuccess: ({ data }) => {
      const userData = data.data.user;
      dispatch(setCredentials({
        accessToken:  data.data.accessToken,
        refreshToken: data.data.refreshToken,
        user: userData || { email },
      }));
      if (userData?.name) { onClose(); onSuccess?.(); }
      else setStep('name');
    },
    onError: (e) => setError(e.response?.data?.message ?? 'Login failed. Check your credentials.'),
  });

  const sendEmailOtpMutation = useMutation({
    mutationFn: (em) => api.post('/auth/user/send-email-otp', { email: em }),
    onSuccess: () => { setStep('email-otp'); startEmailOtp(60); setError(''); },
    onError:   (e) => setError(e.response?.data?.message ?? 'Failed to send OTP.'),
  });

  const resendEmailOtpMutation = useMutation({
    mutationFn: (em) => api.post('/auth/user/send-email-otp', { email: em }),
    onSuccess: () => { startEmailOtp(60); setEmailOtp(Array(6).fill('')); setError(''); },
    onError:   (e) => setError(e.response?.data?.message ?? 'Failed to resend OTP.'),
  });

  const emailSignupMutation = useMutation({
    mutationFn: ({ nm, em, pw, mob, code }) =>
      api.post('/auth/user/signup-email-otp', { name: nm, email: em, password: pw, mobile: mob, emailOtp: code }),
    onSuccess: ({ data }) => {
      dispatch(setCredentials({
        accessToken:  data.data.accessToken,
        refreshToken: data.data.refreshToken,
        user: { name, email, mobile: phone },
      }));
      onClose();
      onSuccess?.();
    },
    onError: (e) => setError(e.response?.data?.message ?? 'Signup failed. Try again.'),
  });

  /* ── Handlers ── */
  const handleSendOtp = () => {
    setError('');
    if (!/^[6-9]\d{9}$/.test(mobile)) { setError('Enter a valid 10-digit Indian mobile number.'); return; }
    sendOtpMutation.mutate(mobile);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault(); setError('');
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the complete 6-digit OTP.'); return; }
    verifyOtpMutation.mutate({ mob: mobile, code });
  };

  const handleResend = () => {
    if (resendLeft > 0 || resendOtpMutation.isPending) return;
    setError('');
    resendOtpMutation.mutate(mobile);
  };

  const handleEmailLogin = (e) => {
    e.preventDefault(); setError('');
    emailLoginMutation.mutate({ em: email, pw: pass });
  };

  const handleSendEmailOtp = (e) => {
    e.preventDefault(); setError('');
    if (!name || !email || !pass || phone.length < 10) { setError('Please fill in all fields first.'); return; }
    if (pass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    sendEmailOtpMutation.mutate(email);
  };

  const handleEmailSignup = (e) => {
    e.preventDefault(); setError('');
    const code = emailOtp.join('');
    if (code.length < 6) { setError('Enter the complete 6-digit OTP.'); return; }
    emailSignupMutation.mutate({ nm: name, em: email, pw: pass, mob: phone, code });
  };

  const handleResendEmailOtp = () => {
    if (emailOtpLeft > 0 || resendEmailOtpMutation.isPending) return;
    setError('');
    resendEmailOtpMutation.mutate(email);
  };

  const saveNameMutation = useMutation({
    mutationFn: (name) => api.patch('/users/me', { name }),
    onSuccess: (_, name) => { dispatch(updateUser({ name })); onClose(); onSuccess?.(); },
    onError:   (_, name) => { dispatch(updateUser({ name })); onClose(); onSuccess?.(); },
  });

  const handleSaveName = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed) saveNameMutation.mutate(trimmed);
    else { onClose(); onSuccess?.(); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-[820px] rounded-3xl overflow-hidden shadow-2xl flex bg-white"
           style={{ minHeight: 540 }}>

        {/* ── LEFT — image panel ── */}
        <div className="hidden sm:flex relative w-[42%] flex-col justify-between p-8 overflow-hidden shrink-0">
          <Image src="/Images/camp1.jpg" alt="Luxor" fill className="object-cover" priority />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(10,37,53,0.96) 0%,rgba(10,37,53,0.75) 55%,rgba(10,37,53,0.4) 100%)' }} />

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#84cc16' }}>
              <span className="text-black font-black text-lg leading-none">L</span>
            </div>
            <span className="text-white font-black text-xl tracking-tight">LUXOR</span>
          </div>

          <div className="relative z-10">
            <h3 className="text-white font-black text-4xl leading-[1.05] mb-3">
              Travel<br />in Pure<br /><span style={{ color: '#84cc16' }}>Luxury.</span>
            </h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-[200px]">
              India&apos;s finest vehicles and glamping experiences.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {[['10,000+','Happy Customers'],['500+','Verified Listings'],['100+','Pickup Locations']].map(([n, l]) => (
              <div key={l} className="flex items-center gap-3">
                <div className="w-0.5 h-8 rounded-full" style={{ backgroundColor: '#84cc16' }} />
                <div>
                  <p className="text-white font-black text-sm leading-none">{n}</p>
                  <p className="text-white/40 text-xs mt-0.5">{l}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT — form panel ── */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white">

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div className="flex-1 flex flex-col justify-center px-8 py-10 w-full" style={{ maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>

            {/* Mobile-only logo */}
            <div className="flex sm:hidden items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#84cc16' }}>
                <span className="text-black font-black text-sm leading-none">L</span>
              </div>
              <span className="text-[#0a2535] font-black text-lg">LUXOR</span>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
              {step === 'name' ? 'ALMOST THERE' : step === 'email-otp' ? 'VERIFY EMAIL' : 'WELCOME'}
            </p>
            <h2 className="text-[#0a2535] font-black text-2xl leading-tight mb-5">
              {step === 'name'
                ? 'What should we call you?'
                : step === 'email-otp'
                  ? 'Check your email'
                  : tab === 'otp'
                    ? 'Sign in with mobile'
                    : mode === 'login' ? 'Sign in to Luxor' : 'Create your account'}
            </h2>

            {/* Tabs — hidden on name / email-otp steps */}
            {step !== 'name' && step !== 'email-otp' && (
              <div className="flex gap-0 border-b border-gray-100 mb-6">
                {[{ key: 'otp', label: 'Mobile OTP' }, { key: 'email', label: 'Email' }].map(({ key, label }) => (
                  <button key={key} type="button"
                    onClick={() => { setTab(key); setError(''); setStep('phone'); }}
                    className="pb-3 pr-5 text-sm font-black border-b-2 transition-colors"
                    style={{ borderColor: tab === key ? '#84cc16' : 'transparent', color: tab === key ? '#0a2535' : '#9ca3af' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Name collection step ── */}
            {step === 'name' && (
              <form onSubmit={handleSaveName}>
                <p className="text-sm text-gray-500 mb-5">
                  Your name helps us personalise your experience. You can skip this.
                </p>
                <TextInput
                  label="Your Name"
                  type="text"
                  value={nameInput}
                  placeholder="e.g. Rahul Sharma"
                  autoComplete="name"
                  onChange={(e) => setNameInput(e.target.value)}
                />
                <SubmitBtn label="Save & Continue" loading={saveNameMutation.isPending} accent />
                <button type="button" onClick={onClose}
                  className="w-full py-2.5 mt-2 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                  Skip for now
                </button>
              </form>
            )}

            {/* ── OTP: phone step ── */}
            {step !== 'name' && tab === 'otp' && step === 'phone' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
                <TextInput label="Mobile Number" type="tel" value={mobile} placeholder="9876543210"
                  autoComplete="tel"
                  onChange={(e) => { setError(''); setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); }}
                  suffix={<span className="pr-4 text-sm font-black text-gray-300">+91</span>}
                  error={error}
                />
                <SubmitBtn
                  label={<>Send OTP <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg></>}
                  disabled={mobile.length < 10}
                  loading={sendOtpMutation.isPending}
                />
                <p className="text-gray-400 text-xs text-center mt-5">
                  New to Luxor? We&apos;ll create your account automatically.
                </p>
              </form>
            )}

            {/* ── OTP: verify step ── */}
            {step !== 'name' && tab === 'otp' && step === 'verify' && (
              <form onSubmit={handleVerifyOtp}>
                <button type="button" onClick={() => { setStep('phone'); setOtp(Array(6).fill('')); setError(''); }}
                  className="flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-[#0a2535] transition-colors mb-5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
                  Change number
                </button>
                <p className="text-sm text-gray-500 mb-4">
                  OTP sent to <span className="text-[#0a2535] font-black">+91 {mobile}</span>
                </p>
                <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-3">
                  Enter 6-digit OTP
                </label>
                <OtpBoxes value={otp} onChange={setOtp} />
                {error && <p className="text-red-500 text-xs font-semibold mt-2">{error}</p>}
                <SubmitBtn label="Verify & Login" disabled={otp.some(d => !d)} loading={verifyOtpMutation.isPending} accent />
                <div className="flex items-center justify-center mt-3 gap-1">
                  <span className="text-xs text-gray-400">Didn&apos;t receive it?</span>
                  <button type="button" onClick={handleResend} disabled={resendLeft > 0 || resendOtpMutation.isPending}
                    className="text-xs font-black transition-colors"
                    style={{ color: resendLeft > 0 ? '#9ca3af' : '#84cc16' }}>
                    {resendLeft > 0 ? `Resend in ${resendLeft}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* ── Email login ── */}
            {step !== 'name' && tab === 'email' && mode === 'login' && (
              <form onSubmit={handleEmailLogin}>
                <TextInput label="Email Address" type="email" value={email} placeholder="you@example.com"
                  autoComplete="email" onChange={(e) => { setError(''); setEmail(e.target.value); }} />
                <TextInput label="Password" type={showPw ? 'text' : 'password'} value={pass} placeholder="••••••••"
                  autoComplete="current-password" onChange={(e) => { setError(''); setPass(e.target.value); }}
                  suffix={<EyeToggle show={showPw} onToggle={() => setShowPw(v => !v)} />}
                />
                <div className="text-right -mt-1 mb-1">
                  <a href="/forgot-password" onClick={onClose}
                    className="text-xs font-bold text-gray-400 hover:text-[#0a2535] transition-colors">
                    Forgot password?
                  </a>
                </div>
                {error && <p className="text-red-500 text-xs font-semibold mb-2">{error}</p>}
                <SubmitBtn label="Login" disabled={!email || !pass} loading={emailLoginMutation.isPending} />
                <p className="text-gray-400 text-xs text-center mt-4">
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); setError(''); }}
                    className="font-black text-[#0a2535] hover:underline">Sign up</button>
                </p>
              </form>
            )}

            {/* ── Email signup (details) ── */}
            {step !== 'name' && step !== 'email-otp' && tab === 'email' && mode === 'signup' && (
              <form onSubmit={handleSendEmailOtp}>
                <TextInput label="Full Name" type="text" value={name} placeholder="Rahul Sharma"
                  autoComplete="name" onChange={(e) => { setError(''); setName(e.target.value); }} />
                <TextInput label="Email Address" type="email" value={email} placeholder="you@example.com"
                  autoComplete="email" onChange={(e) => { setError(''); setEmail(e.target.value); }} />
                <TextInput label="Mobile Number" type="tel" value={phone} placeholder="9876543210"
                  autoComplete="tel" onChange={(e) => { setError(''); setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); }}
                  suffix={<span className="pr-4 text-sm font-black text-gray-300">+91</span>}
                />
                <TextInput label="Password" type={showPw ? 'text' : 'password'} value={pass} placeholder="Min. 8 characters"
                  autoComplete="new-password" onChange={(e) => { setError(''); setPass(e.target.value); }}
                  suffix={<EyeToggle show={showPw} onToggle={() => setShowPw(v => !v)} />}
                />
                {error && <p className="text-red-500 text-xs font-semibold mb-2">{error}</p>}
                <SubmitBtn label="Send Verification OTP" disabled={!name || !email || !pass || phone.length < 10} loading={sendEmailOtpMutation.isPending} accent />
                <p className="text-gray-400 text-xs text-center mt-4">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('login'); setError(''); }}
                    className="font-black text-[#0a2535] hover:underline">Sign in</button>
                </p>
              </form>
            )}

            {/* ── Email signup OTP verify ── */}
            {step === 'email-otp' && (
              <form onSubmit={handleEmailSignup}>
                <button type="button" onClick={() => { setStep('phone'); setEmailOtp(Array(6).fill('')); setError(''); }}
                  className="flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-[#0a2535] transition-colors mb-5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
                  Back to details
                </button>
                <p className="text-sm text-gray-500 mb-4">
                  We sent a 6-digit code to <span className="text-[#0a2535] font-black">{email}</span>
                </p>
                <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-3">
                  Enter 6-digit OTP
                </label>
                <OtpBoxes value={emailOtp} onChange={setEmailOtp} />
                {error && <p className="text-red-500 text-xs font-semibold mt-2">{error}</p>}
                <SubmitBtn label="Verify & Create Account" disabled={emailOtp.some(d => !d)} loading={emailSignupMutation.isPending} accent />
                <div className="flex items-center justify-center mt-3 gap-1">
                  <span className="text-xs text-gray-400">Didn&apos;t receive it?</span>
                  <button type="button" onClick={handleResendEmailOtp}
                    disabled={emailOtpLeft > 0 || resendEmailOtpMutation.isPending}
                    className="text-xs font-black transition-colors"
                    style={{ color: emailOtpLeft > 0 ? '#9ca3af' : '#84cc16' }}>
                    {emailOtpLeft > 0 ? `Resend in ${emailOtpLeft}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
