'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import VehicleListings from './VehicleListings';
import CampsiteListings from './CampsiteListings';
import BlogSection from './BlogSection';

/* ── Category Quick Links ──────────────────────────────────────── */
const CATEGORIES = [
  {
    label: 'Book Vehicle',
    href: '/vehicles',
    color: '#84cc16',
    bg: '#f7fee7',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    label: 'Book Campsite',
    href: '/campsites',
    color: '#0ea5e9',
    bg: '#f0f9ff',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-5a3 3 0 016 0v5" />
      </svg>
    ),
  },
  {
    label: 'Weekend Getaway',
    href: '/campsites',
    color: '#f59e0b',
    bg: '#fffbeb',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    label: 'Self Drive',
    href: '/vehicles',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
      </svg>
    ),
  },
  {
    label: 'Corporate Travel',
    href: '/vehicles',
    color: '#6b7280',
    bg: '#f9fafb',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    label: 'Hourly Rental',
    href: '/vehicles',
    color: '#ec4899',
    bg: '#fdf2f8',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Best Deals',
    href: '/vehicles',
    color: '#ef4444',
    bg: '#fef2f2',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    label: 'Destinations',
    href: '/campsites',
    color: '#10b981',
    bg: '#ecfdf5',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
];

/* ── Floating Capsule Component ────────────────────────────────── */
function CategoryCapsule({ label, href, color, bg, icon }) {
  // Split label to stack nicely inside the pill shape
  const words = label.split(' ');

  return (
    <Link href={href} className="snap-center shrink-0 focus:outline-none outline-none">
      <motion.div
        initial="initial"
        whileHover="hover"
        whileTap={{ scale: 0.95 }}
        variants={{
          initial: {
            y: 0,
            borderColor: "rgba(243, 244, 246, 1)", // gray-100
            boxShadow: "0px 10px 30px -10px rgba(0,0,0,0.03)",
            backgroundColor: "rgba(255,255,255,0.95)"
          },
          hover: {
            y: -8,
            borderColor: `${color}40`, // Soft border matching accent color
            boxShadow: `0px 24px 40px -12px ${color}30`,
            backgroundColor: "rgba(255,255,255,1)",
            transition: { type: "spring", stiffness: 400, damping: 25 }
          }
        }}
        className="group relative flex flex-col items-center justify-start gap-3 w-[100px] h-[130px] sm:w-[106px] sm:h-[136px] lg:w-[116px] lg:h-[144px] pt-5 lg:pt-6 rounded-[2.5rem] backdrop-blur-xl border transition-colors z-10 overflow-hidden"
      >
        {/* Inner Ambient Glow on Hover */}
        <motion.div
          variants={{
            initial: { opacity: 0 },
            hover: { opacity: 1 }
          }}
          className="absolute top-0 left-0 w-full h-1/2 opacity-20 blur-[20px] rounded-t-[2.5rem] pointer-events-none transition-opacity duration-500"
          style={{ backgroundImage: `linear-gradient(to bottom, ${color}, transparent)` }}
        />

        {/* Floating Indicator Dot */}
        <motion.div
          variants={{
            initial: { y: 10, opacity: 0, scale: 0.5 },
            hover: { y: 0, opacity: 1, scale: 1 }
          }}
          className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        />

        {/* Icon Container */}
        <div className="relative flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full z-10">

          {/* Hover Pulse Ring (Activates ONLY on hover) */}
          <motion.div
            variants={{
              initial: { scale: 1, opacity: 0 },
              hover: {
                scale: [1, 1.6, 1],
                opacity: [0, 0.4, 0],
                transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }
            }}
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color }}
          />

          {/* Solid Icon Background */}
          <div className="absolute inset-0 rounded-full transition-transform duration-300 group-hover:scale-[1.05]" style={{ backgroundColor: bg }} />

          {/* Icon SVG */}
          <motion.div
            variants={{
              initial: { scale: 1, rotate: 0 },
              hover: { scale: 1.15, rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }
            }}
            className="relative z-10 flex items-center justify-center"
            style={{ color: color }}
          >
            {icon}
          </motion.div>
        </div>

        {/* Label Typography */}
        <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 text-center leading-[1.2] tracking-wide group-hover:text-gray-900 transition-colors duration-300 z-10 px-2">
          {words.map((word, i) => (
            <span key={i} className="block">{word}</span>
          ))}
        </span>

        {/* Animated Accent Line */}
        <motion.div
          variants={{
            initial: { width: "0px", opacity: 0 },
            hover: { width: "24px", opacity: 1 }
          }}
          className="absolute bottom-4 h-[3px] rounded-full"
          style={{ backgroundColor: color }}
        />
      </motion.div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════ */

export default function HomeClient() {
  return (
    <div className="bg-white font-sans overflow-hidden">

      {/* ── Floating Capsule Navigation Strip ── */}
      <section className="relative w-full border-b border-gray-100 bg-gradient-to-b from-gray-50/40 to-white pt-4 pb-2">

        {/* Subtle Ambient Background Lighting */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-[15%] w-[400px] h-[400px] bg-[#84cc16]/5 blur-[120px] rounded-full -translate-y-1/2" />
          <div className="absolute top-1/2 right-[15%] w-[400px] h-[400px] bg-[#0ea5e9]/5 blur-[120px] rounded-full -translate-y-1/2" />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 lg:justify-center overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 md:px-12 xl:px-16 pb-10 pt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {CATEGORIES.map((cat) => (
              <CategoryCapsule key={cat.label} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Vehicles ── */}
      <VehicleListings />

      {/* ── Featured Campsites ── */}
      <CampsiteListings />

      {/* ── Blog & Vlogs ── */}
      <BlogSection />

    </div>
  );
}