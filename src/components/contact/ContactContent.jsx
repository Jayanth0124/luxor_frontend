'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Leaf, ChevronDown } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1';

const SUBJECTS = [
  'General Inquiry',
  'Booking Help',
  'Vehicle Rental',
  'Campsite / Stay',
  'Payment Issue',
  'Partnership',
  'Other',
];

export default function ContactContent() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: SUBJECTS[0],
    message: '',
  });

  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function set(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      await axios.post(`${BASE}/contact`, form);
      setStatus('success');
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: SUBJECTS[0],
        message: '',
      });
    } catch (err) {
      setStatus('error');
      // If the backend isn't running or returns an error, gracefully catch it.
      setErrorMsg(err?.response?.data?.message || 'Unable to connect to the server. Please try again.');
    }
  }

  return (
    <main className="bg-[#f6f8f2] min-h-screen py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ── TOP HEADER ── */}
        <div className="text-center mb-12 lg:mb-16">

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#1e293b] leading-[1.1]">
            Let’s Plan Your
            <span className="block text-[#84cc16]">Next Journey</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg leading-relaxed text-[#64748b]">
            Have questions about roadtrips, vehicle rentals, stays, or travel plans? Our team is here to help you.
          </p>
        </div>

        {/* ── MAIN CARD ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.42fr_0.58fr] bg-white border border-[#e8eee1] rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-[0_15px_60px_rgba(0,0,0,0.04)]">
          
          {/* LEFT SIDE: Contact Info */}
          <div className="relative bg-[#eef5e7] p-8 md:p-12 lg:p-14 flex flex-col justify-between">
            {/* Soft Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#84cc16]/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-20">
              <h2 className="text-3xl font-black tracking-tight text-[#1e293b]">
                Contact Info
              </h2>
              <p className="mt-4 text-base md:text-lg leading-relaxed text-[#64748b]">
                We usually respond within 24 hours on business days.
              </p>

              {/* Info List */}
              <div className="mt-12 space-y-8">
                {/* Email */}
                <div className="flex items-start gap-4 md:gap-5">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-[#84cc16]" />
                  </div>
                  <div>
                    <span className="text-xs md:text-sm font-medium text-[#94a3b8]">Email</span>
                    <p className="mt-1 text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-[#1e293b] break-all">
                      hello@luxorstays.com
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 md:gap-5">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Phone className="w-5 h-5 md:w-6 md:h-6 text-[#84cc16]" />
                  </div>
                  <div>
                    <span className="text-xs md:text-sm font-medium text-[#94a3b8]">Phone</span>
                    <p className="mt-1 text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-[#1e293b]">
                      +91 98765 43210
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4 md:gap-5">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#84cc16]" />
                  </div>
                  <div>
                    <span className="text-xs md:text-sm font-medium text-[#94a3b8]">Location</span>
                    <p className="mt-1 text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-[#1e293b]">
                      Bengaluru, Karnataka, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nature Card */}
            <div className="mt-12 rounded-[1.5rem] bg-white/80 backdrop-blur-xl border border-white p-6 relative z-20">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#84cc16]" />
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.18em] text-[#84cc16]">
                  Scenic Travel Support
                </span>
              </div>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-[#64748b]">
                We help travelers plan scenic roadtrips, vehicle rentals, campsite stays, and peaceful nature escapes.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Contact Form */}
          <div className="p-8 md:p-12 lg:p-14">
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-[#84cc16] flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(132,204,22,0.3)]">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl md:text-4xl font-black tracking-tight text-[#1e293b]">Message Sent</h3>
                <p className="mt-4 max-w-sm text-base md:text-lg text-[#64748b]">
                  Thank you for contacting us. Our team will reach out shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-[#84cc16] transition-colors"
                >
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block mb-2 text-xs md:text-sm font-bold text-[#334155]">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      required
                      className="w-full h-14 md:h-16 rounded-xl border border-[#dfe7d6] bg-[#fbfcf9] px-4 md:px-6 text-sm md:text-base font-semibold text-[#1e293b] outline-none transition-all focus:border-[#84cc16] focus:bg-white placeholder:text-[#cbd5e1]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block mb-2 text-xs md:text-sm font-bold text-[#334155]">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      required
                      className="w-full h-14 md:h-16 rounded-xl border border-[#dfe7d6] bg-[#fbfcf9] px-4 md:px-6 text-sm md:text-base font-semibold text-[#1e293b] outline-none transition-all focus:border-[#84cc16] focus:bg-white placeholder:text-[#cbd5e1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="block mb-2 text-xs md:text-sm font-bold text-[#334155]">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      className="w-full h-14 md:h-16 rounded-xl border border-[#dfe7d6] bg-[#fbfcf9] px-4 md:px-6 text-sm md:text-base font-semibold text-[#1e293b] outline-none transition-all focus:border-[#84cc16] focus:bg-white placeholder:text-[#cbd5e1]"
                    />
                  </div>

                  {/* Subject (Custom Dropdown) */}
                  <div>
                    <label className="block mb-2 text-xs md:text-sm font-bold text-[#334155]">Subject</label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full h-14 md:h-16 rounded-xl border bg-[#fbfcf9] px-4 md:px-6 text-sm md:text-base font-semibold text-[#1e293b] outline-none transition-all flex items-center justify-between ${
                          isDropdownOpen ? 'border-[#84cc16] bg-white ring-2 ring-[#84cc16]/10' : 'border-[#dfe7d6]'
                        }`}
                      >
                        {form.subject}
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#84cc16]' : ''}`} 
                        />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#dfe7d6] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden"
                          >
                            <div className="max-h-60 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                              {SUBJECTS.map((item) => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => {
                                    set('subject', item);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-5 py-3 text-sm md:text-base font-medium transition-colors hover:bg-[#f6f8f2] ${
                                    form.subject === item ? 'text-[#84cc16] bg-[#f6f8f2]' : 'text-[#334155]'
                                  }`}
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block mb-2 text-xs md:text-sm font-bold text-[#334155]">Message</label>
                  <textarea
                    rows={6}
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#dfe7d6] bg-[#fbfcf9] p-4 md:p-6 text-sm md:text-base font-semibold text-[#1e293b] outline-none resize-none transition-all focus:border-[#84cc16] focus:bg-white placeholder:text-[#cbd5e1]"
                  />
                </div>

                {/* Error Message Display */}
                {status === 'error' && errorMsg && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-red-800">{errorMsg}</p>
                  </div>
                )}

                {/* Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full h-14 md:h-16 rounded-xl bg-[#84cc16] disabled:opacity-70 disabled:hover:brightness-100 text-white text-base md:text-lg font-bold shadow-[0_12px_30px_rgba(132,204,22,0.25)] transition-all hover:brightness-105 active:scale-[0.98]"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}