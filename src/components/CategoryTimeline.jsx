'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const CATEGORIES = [
  {
    label: 'Vehicles',
    href: '/vehicles',
    color: '#84cc16',
    bg: '#eef6df',
    route: 'Mobility',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0" />
      </svg>
    ),
  },
  {
    label: 'Campsites',
    href: '/campsites',
    color: '#0ea5e9',
    bg: '#e0f2fe',
    route: 'Nature',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 20l9-16 9 16" />
      </svg>
    ),
  },
  {
    label: 'Weekend',
    href: '/campsites',
    color: '#f59e0b',
    bg: '#fef3c7',
    route: 'Escape',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
      </svg>
    ),
  },
  {
    label: 'Self Drive',
    href: '/vehicles',
    color: '#8b5cf6',
    bg: '#ede9fe',
    route: 'Freedom',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17l6-6" />
      </svg>
    ),
  },
  {
    label: 'Corporate',
    href: '/vehicles',
    color: '#ef4444',
    bg: '#fee2e2',
    route: 'Business',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
      </svg>
    ),
  },
];

export default function CategoryTimeline() {
  return (
    <section className="relative px-4 sm:px-6 md:px-10 xl:px-16 py-8 overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        <div className="relative">
          <div className="hidden lg:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent rounded-full" />
            <motion.div animate={{ x: ['-10%', '110%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute top-1/2 -translate-y-1/2 w-32 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#84cc16] to-transparent blur-[1px]" />
            <motion.div animate={{ x: ['110%', '-10%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} className="absolute top-1/2 -translate-y-1/2 w-24 h-[2px] rounded-full bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
          </div>
          <div className="relative flex items-center lg:justify-between gap-4 overflow-x-auto lg:overflow-visible scrollbar-hide pb-2">
            {CATEGORIES.map(({ label, href, color, bg, icon, route }) => (
              <motion.div key={label} whileHover={{ y: -8 }} transition={{ duration: 0.3 }} className="relative shrink-0 lg:shrink flex flex-col items-center">
                <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }} className="hidden lg:block absolute top-1/2 -translate-y-1/2 z-0">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}` }} />
                </motion.div>
                <Link href={href} className="group relative z-10">
                  <div className="relative overflow-hidden flex flex-col items-center justify-center w-[150px] sm:w-[170px] rounded-[2rem] border border-white/30 bg-white/70 backdrop-blur-3xl px-5 py-5 shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at top, ${color}18, transparent 70%)` }} />
                    <motion.div whileHover={{ scale: 1.12, rotate: 8 }} transition={{ duration: 0.25 }} className="relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl" style={{ backgroundColor: bg, color }}>
                      {icon}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 animate-ping" style={{ backgroundColor: `${color}25` }} />
                    </motion.div>
                    <div className="relative z-10 mt-4 text-center">
                      <h3 className="text-[15px] font-bold tracking-tight text-[#111827]">{label}</h3>
                      <div className="flex items-center justify-center gap-1.5 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400">{route}</span>
                      </div>
                    </div>
                    <motion.div initial={{ width: 0 }} whileHover={{ width: '70%' }} transition={{ duration: 0.4 }} className="absolute bottom-0 h-[2px] rounded-full" style={{ backgroundColor: color }} />
                    <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: color }} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
