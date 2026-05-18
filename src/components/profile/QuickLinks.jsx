'use client';

import Link from 'next/link';

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#84cc16] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default function QuickLinks({ onMyBookings }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-6">
      <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Quick Links</h2>
      <div className="space-y-2">
        <button onClick={onMyBookings}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
          <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">My Bookings</span>
          <ArrowIcon />
        </button>
        <Link href="/vehicles"
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
          <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Browse Vehicles</span>
          <ArrowIcon />
        </Link>
        <Link href="/campsites"
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
          <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Browse Campsites</span>
          <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}
