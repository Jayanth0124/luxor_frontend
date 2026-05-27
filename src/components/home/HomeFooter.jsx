'use client';

import { useState } from 'react';
import Link from 'next/link';

const PARTNER_URL = process.env.NEXT_PUBLIC_PARTNER_URL || 'http://localhost:9124/';

const NAV = {
  Explore: [
    { label: 'Vehicles', href: '/vehicles' },
    { label: 'Campsites', href: '/campsites' },
    { label: 'Destinations', href: '#' },
    { label: 'Best Deals', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Partner With Us', href: PARTNER_URL },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Safety', href: '#' },
    { label: 'Policies', href: '#' },
  ],
};

const SOCIALS = [
  { name: 'Instagram', href: '#', icon: 'IG' },
  { name: 'Twitter', href: '#', icon: 'X' },
  { name: 'YouTube', href: '#', icon: 'YT' },
];

export default function HomeFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative overflow-hidden bg-[#f6f8f2] border-t border-[#e7eddc]">

      {/* ── TOP SIMPLE SECTION (No Background Image) ── */}
      <div className="relative border-b border-[#e7eddc] bg-[#eff2ea]">
        <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 text-center">

          {/* TITLE */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] font-black tracking-tight text-[#1e293b] max-w-4xl mx-auto text-center">
            Explore Beautiful
            <span className="block text-[#84cc16]">Roads Less Traveled</span>
          </h2>

          {/* TEXT */}
          <p className="mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-[#64748b] mx-auto text-center">
            Discover scenic roadtrips, peaceful campsites, hidden destinations, and unforgettable outdoor journeys.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/vehicles"
              className="h-14 inline-flex items-center justify-center rounded-2xl bg-[#84cc16] px-7 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(132,204,22,0.25)] transition-all hover:-translate-y-0.5"
            >
              Explore Vehicles
            </Link>
            <Link
              href="/campsites"
              className="h-14 inline-flex items-center justify-center rounded-2xl border border-[#dbe6ce] bg-white px-7 text-sm font-black uppercase tracking-[0.18em] text-[#1e293b] transition-all hover:bg-gray-50"
            >
              Discover Campsites
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER (Identical Structure, Clean Formatting) ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.7fr_1fr] gap-12">

          {/* BRAND */}
          <div>
            {/* LOGO */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#84cc16] flex items-center justify-center shadow-[0_10px_25px_rgba(132,204,22,0.2)]">
                <span className="text-white text-xl font-black">L</span>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-[#1e293b]">LUXOR</h3>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#84cc16]">Scenic Escapes</p>
              </div>
            </div>

            {/* TEXT */}
            <p className="max-w-sm text-sm leading-relaxed text-[#64748b]">
              Nature-inspired journeys, scenic roadtrips, peaceful destinations, and memorable travel experiences.
            </p>

            {/* SOCIALS */}
            <div className="flex items-center gap-3 mt-6">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  className="w-10 h-10 rounded-xl border border-[#dbe6ce] bg-white flex items-center justify-center text-xs font-black text-[#64748b] transition-all hover:border-[#84cc16] hover:text-[#84cc16] hover:-translate-y-0.5"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(NAV).map(([heading, items]) => (
              <div key={heading}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#84cc16] mb-4">
                  {heading}
                </h4>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-[#64748b] text-xs sm:text-sm font-semibold transition-colors hover:text-[#1e293b]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* NEWSLETTER */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#84cc16] mb-4">
              Travel Updates
            </h4>
            <h3 className="text-xl font-black tracking-tight text-[#1e293b]">
              Stay Connected
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#64748b]">
              Receive destination ideas, travel inspiration, and scenic getaway updates.
            </p>

            {/* SUBSCRIPTION FEEDBACK */}
            {subscribed ? (
              <div className="mt-6 rounded-xl bg-[#eef5e7] border border-[#dbe6ce] p-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#84cc16]" />
                  <span className="text-xs font-bold text-[#5c6b4f]">
                    You’re subscribed successfully.
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex items-center h-12 rounded-xl border border-[#dbe6ce] bg-white overflow-hidden">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    placeholder="Enter your email"
                    className="flex-1 h-full bg-transparent px-4 text-xs sm:text-sm font-semibold text-[#1e293b] outline-none placeholder:text-[#94a3b8]"
                  />
                  <button
                    onClick={handleSubscribe}
                    className="h-full px-5 bg-[#84cc16] text-white text-xs font-black uppercase tracking-[0.15em] transition-all hover:brightness-105"
                  >
                    Join
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-[#94a3b8]">
                  No spam. Only peaceful travel inspiration.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* BOTTOM META BAR */}
        <div className="mt-12 pt-6 border-t border-[#e7eddc] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#94a3b8]">
            © {new Date().getFullYear()} Luxor Escapes. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {['Privacy', 'Terms', 'Cookies', 'Support'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94a3b8] transition-colors hover:text-[#84cc16]"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

      </div>

    </footer>
  );
}