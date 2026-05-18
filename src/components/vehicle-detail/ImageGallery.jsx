'use client';

import { useState } from 'react';
import Image from 'next/image';

function isExternal(url) {
  return url?.startsWith('http://') || url?.startsWith('https://');
}

export default function ImageGallery({ images = [], fallback = '/Images/car.jpg', name = '' }) {
  const [active,    setActive]    = useState(0);
  const [lightbox,  setLightbox]  = useState(false);

  const list    = images.length > 0 ? images : [{ url: fallback, caption: name }];
  const mainSrc = list[active]?.url || fallback;

  // Thumbnails displayed in the right column (indices other than active, up to 2 visible)
  const thumbIndices = list.length > 1
    ? list.map((_, i) => i).filter(i => i !== 0).slice(0, 2)
    : [];

  return (
    <>
      {/* ── Gallery grid ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className={`grid gap-2 rounded-2xl overflow-hidden ${list.length > 1 ? 'grid-cols-[1fr_180px] sm:grid-cols-[1fr_220px]' : 'grid-cols-1'}`}>

          {/* Main image */}
          <div
            className="relative cursor-pointer"
            style={{ height: '340px' }}
            onClick={() => setLightbox(true)}
          >
            <Image
              src={mainSrc}
              alt={list[active]?.caption || name}
              fill
              className="object-cover"
              unoptimized={isExternal(mainSrc)}
            />
          </div>

          {/* Right thumbnail column */}
          {thumbIndices.length > 0 && (
            <div className="flex flex-col gap-2">
              {thumbIndices.map((idx) => (
                <div
                  key={idx}
                  className={`relative flex-1 cursor-pointer overflow-hidden ${idx === list.length - 1 && list.length > 3 ? 'relative' : ''}`}
                  onClick={() => setActive(idx)}
                >
                  <Image
                    src={list[idx]?.url || fallback}
                    alt={list[idx]?.caption || ''}
                    fill
                    className="object-cover hover:brightness-90 transition-all"
                    unoptimized={isExternal(list[idx]?.url)}
                  />
                  {/* "View all photos" overlay on last thumb if more exist */}
                  {idx === thumbIndices[thumbIndices.length - 1] && list.length > 3 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
                      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white"
                    >
                      <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold">+{list.length - 3} photos</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip (when > 3 images) */}
        {list.length > 3 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {list.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  active === i ? 'border-[#84cc16]' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.caption || ''}
                  fill
                  className="object-cover"
                  unoptimized={isExternal(img.url)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setActive(p => Math.max(0, p - 1)); }}
            disabled={active === 0}
            className="absolute left-4 text-white/80 hover:text-white disabled:opacity-30"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative w-full max-w-3xl h-[70vh]" onClick={e => e.stopPropagation()}>
            <Image
              src={list[active]?.url || fallback}
              alt={list[active]?.caption || name}
              fill
              className="object-contain"
              unoptimized={isExternal(list[active]?.url)}
            />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setActive(p => Math.min(list.length - 1, p + 1)); }}
            disabled={active === list.length - 1}
            className="absolute right-4 text-white/80 hover:text-white disabled:opacity-30"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <p className="absolute bottom-4 text-white/50 text-xs">{active + 1} / {list.length}</p>
        </div>
      )}
    </>
  );
}
