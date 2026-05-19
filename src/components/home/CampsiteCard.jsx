'use client';

import Image from 'next/image';
import Link from 'next/link';

// ─── Inline Premium Icons ──────────────────────────────────────────────────
const StarIcon = ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>;
const MapPinIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const UsersIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const TentIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 20l9-16 9 16M3 20h18M9 20l3-5.333L15 20" /></svg>;
const ArrowRightIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>;

export default function CampsiteCard({ campsite: c }) {
  return (
    <Link href={`/campsites/${c.slug}`} className="group block w-full h-full outline-none">
      <div className="relative flex flex-col h-full overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-2">

        {/* ── CINEMATIC TOP IMAGE ── */}
        <div className="relative h-[280px] sm:h-[300px] w-full overflow-hidden shrink-0 bg-gray-900">
          <Image
            src={c.image || c.images?.[0]?.url || '/Images/camp.jpg'}
            alt={c.name}
            fill
            className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
            unoptimized={c.image?.startsWith('http')}
          />

          {/* Deep Travel Dark Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 opacity-90 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

          {/* Floating Top Elements */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
              {c.type}
            </div>
          </div>

          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <StarIcon className="w-3 h-3 text-[#f59e0b]" />
              {c.rating} <span className="text-[9px] font-normal text-white/70 ml-0.5">({c.reviews})</span>
            </div>
          </div>

          {/* Image Content */}
          <div className="absolute bottom-5 left-5 right-5 z-10">
            <h3 className="text-2xl font-black text-white leading-tight tracking-tight drop-shadow-lg group-hover:text-[#84cc16] transition-colors duration-300">
              {c.name}
            </h3>
            <div className="flex items-center gap-1.5 text-white/80 mt-2">
              <MapPinIcon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest drop-shadow-md truncate">{c.location}</span>
            </div>
          </div>
        </div>

        {/* ── PREMIUM SPECS SECTION ── */}
        <div className="flex-1 p-5 lg:p-6 flex flex-col bg-white">

          {/* Icons Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#84cc16]/10 group-hover:text-[#84cc16] group-hover:border-[#84cc16]/20 transition-colors">
                <UsersIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Capacity</span>
                <span className="block text-xs font-bold text-gray-900 leading-none">Up to {c.guests} Pax</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#84cc16]/10 group-hover:text-[#84cc16] group-hover:border-[#84cc16]/20 transition-colors">
                <TentIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Experience</span>
                <span className="block text-xs font-bold text-gray-900 leading-none truncate">{c.type}</span>
              </div>
            </div>
          </div>

          {/* Bottom Price Footer */}
          <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Starting from</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900 tracking-tight">₹{Number(c.price).toLocaleString('en-IN')}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">/ night</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-[#84cc16] shadow-sm flex items-center justify-center transition-colors duration-300 text-gray-400 group-hover:text-white">
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}