'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

function isExternal(url) {
  return url?.startsWith('http://') || url?.startsWith('https://');
}

export default function ImageGallery({ images = [], fallback = '/Images/car.jpg', name = '' }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const list = images.length > 0 ? images : [{ url: fallback, caption: name }];

  return (
    <>
      {/* Grid Architecture */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 bg-gray-200">

        {/* Main Large Image */}
        <div className="relative col-span-1 md:col-span-2 row-span-2 h-full cursor-pointer group" onClick={() => { setActive(0); setLightbox(true); }}>
          <Image src={list[0]?.url || fallback} alt={name} fill className="object-cover group-hover:brightness-90 transition-all" unoptimized={isExternal(list[0]?.url)} />
        </div>

        {/* Top Middle */}
        {list[1] && (
          <div className="hidden md:block relative col-span-1 row-span-1 h-full cursor-pointer group" onClick={() => { setActive(1); setLightbox(true); }}>
            <Image src={list[1].url} alt={name} fill className="object-cover group-hover:brightness-90 transition-all" unoptimized={isExternal(list[1].url)} />
          </div>
        )}

        {/* Top Right */}
        {list[2] && (
          <div className="hidden md:block relative col-span-1 row-span-1 h-full cursor-pointer group" onClick={() => { setActive(2); setLightbox(true); }}>
            <Image src={list[2].url} alt={name} fill className="object-cover group-hover:brightness-90 transition-all" unoptimized={isExternal(list[2].url)} />
          </div>
        )}

        {/* Bottom Middle */}
        {list[3] && (
          <div className="hidden md:block relative col-span-1 row-span-1 h-full cursor-pointer group" onClick={() => { setActive(3); setLightbox(true); }}>
            <Image src={list[3].url} alt={name} fill className="object-cover group-hover:brightness-90 transition-all" unoptimized={isExternal(list[3].url)} />
          </div>
        )}

        {/* Bottom Right */}
        {list[4] && (
          <div className="hidden md:block relative col-span-1 row-span-1 h-full cursor-pointer group" onClick={() => { setActive(4); setLightbox(true); }}>
            <Image src={list[4].url} alt={name} fill className="object-cover group-hover:brightness-90 transition-all" unoptimized={isExternal(list[4].url)} />
            {list.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-sm">+{list.length - 5} Photos</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => { setActive(0); setLightbox(true); }}
          className="absolute bottom-4 right-4 bg-white text-gray-900 text-sm font-bold px-4 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Show all photos
        </button>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
            <div className="flex items-center justify-between p-6">
              <span className="text-white/50 text-sm font-semibold">{active + 1} / {list.length}</span>
              <button onClick={() => setLightbox(false)} className="text-white hover:text-gray-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 relative flex items-center justify-center px-4 md:px-16" onClick={() => setLightbox(false)}>
              <button onClick={(e) => { e.stopPropagation(); setActive(p => Math.max(0, p - 1)); }} disabled={active === 0} className="absolute left-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white disabled:opacity-0 hover:bg-white/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="relative w-full max-w-5xl h-[75vh]" onClick={e => e.stopPropagation()}>
                <Image src={list[active]?.url || fallback} alt={name} fill className="object-contain" unoptimized={isExternal(list[active]?.url)} />
              </div>
              <button onClick={(e) => { e.stopPropagation(); setActive(p => Math.min(list.length - 1, p + 1)); }} disabled={active === list.length - 1} className="absolute right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white disabled:opacity-0 hover:bg-white/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}