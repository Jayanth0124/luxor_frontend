'use client';

import { useState } from 'react';
import axios from 'axios';

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

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: SUBJECTS[0], message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await axios.post(`${BASE}/contact`, form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#1a1a1a] pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Get in Touch
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Have a question or need help? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left — contact info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Contact Info</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We typically respond within 24 hours on business days.
            </p>
          </div>

          <div className="space-y-4">
            <ContactInfoItem
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              label="Email"
              value="hello@luxorstays.com"
            />
            <ContactInfoItem
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
              label="Phone"
              value="+91 98765 43210"
            />
            <ContactInfoItem
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              label="Location"
              value="Bengaluru, Karnataka, India"
            />
          </div>
        </div>

        {/* Right — form */}
        <div className="lg:col-span-2">
          {status === 'success' ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#84cc16]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#84cc16]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Message Sent!</h3>
              <p className="text-sm text-gray-500 mb-6">Thanks for reaching out. We&apos;ll get back to you soon.</p>
              <button
                onClick={() => setStatus('idle')}
                className="text-sm font-semibold text-[#84cc16] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Full Name" required>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition"
                  />
                </Field>
                <Field label="Email Address" required>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Phone Number">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition"
                  />
                </Field>
                <Field label="Subject" required>
                  <select
                    value={form.subject}
                    onChange={(e) => set('subject', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition bg-white"
                  >
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Message" required>
                <textarea
                  rows={5}
                  placeholder="Write your message here…"
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition resize-none"
                />
              </Field>

              {status === 'error' && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#84cc16] hover:bg-[#78b715] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition"
              >
                {status === 'loading' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">
        {label}{required && <span className="text-[#84cc16] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ContactInfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-xl bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16] shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}
