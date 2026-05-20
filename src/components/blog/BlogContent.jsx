'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import PostStreamItem from './PostStreamItem';

const DUMMY_POSTS = [
  {
    _id: '1',
    slug: 'himalayan-ascent',
    title: 'The Himalayan Ascent',
    subtitle: 'A Journey Beyond the Clouds',
    excerpt: 'We pushed our luxury SUVs to their limits traversing the treacherous Spiti Valley roads, discovering untamed beauty at 14,000 feet. The air grows thin, but the engine roars louder.',
    category: 'Expedition',
    type: 'blog',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop',
    authorName: 'Luxor Team',
    publishedAt: '2023-10-15T00:00:00.000Z',
    readTime: 8,
  },
  {
    _id: '2',
    slug: 'coastal-drive-goa',
    title: 'Chasing Sunsets',
    subtitle: 'The Ultimate Coastal Drive',
    excerpt: 'A 500km journey along the Konkan coast in our premium caravans, exploring hidden beaches and dense mangrove forests. Salt in the air and freedom on the dashboard.',
    category: 'Travel Notes',
    type: 'vlog',
    coverImage: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=2000&auto=format&fit=crop',
    authorName: 'Sarah Jenkins',
    publishedAt: '2023-09-28T00:00:00.000Z',
    readTime: 5,
  },
  {
    _id: '3',
    slug: 'desert-safari-thar',
    title: 'Golden Dunes of Thar',
    subtitle: 'Navigating the Unforgiving Sands',
    excerpt: 'Surviving the extreme heat and unpredictable sands of the Thar Desert. A true test of our 4x4 expedition vehicles against nature\'s harshest playground.',
    category: 'Field Report',
    type: 'blog',
    coverImage: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2000&auto=format&fit=crop',
    authorName: 'Luxor Team',
    publishedAt: '2023-11-05T00:00:00.000Z',
    readTime: 12,
  },
  {
    _id: '4',
    slug: 'forest-canopy-coorg',
    title: 'Into the Emerald Canopy',
    subtitle: 'Camping in India\'s Coffee Country',
    excerpt: 'Camping under the dense, rain-soaked canopy of the Western Ghats. A journey into the heart of India\'s coffee country where the mist never truly lifts.',
    category: 'Expedition',
    type: 'vlog',
    coverImage: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=2000&auto=format&fit=crop',
    authorName: 'Alex Mercer',
    publishedAt: '2023-12-10T00:00:00.000Z',
    readTime: 6,
  }
];

export default function BlogContent() {
  const [type, setType] = useState('');

  // Parallax for Hero
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 1000], ['0%', '30%']);
  const yText = useTransform(scrollY, [0, 800], ['0%', '15%']);

  const posts = DUMMY_POSTS.filter(p => type === '' || p.type === type);

  return (
    <main className="min-h-screen bg-[#fcfcfc] overflow-hidden text-gray-900 selection:bg-[#84cc16] selection:text-white font-sans">

      {/* ── CINEMATIC HERO ── */}
      <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ y: yBg }}>
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2500&auto=format&fit=crop"
            alt="Travel Hero"
            className="w-full h-full object-cover opacity-80"
          />
          {/* Light theme gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#fcfcfc] via-[#fcfcfc]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fcfcfc]/40 via-transparent to-transparent" />
        </motion.div>

        <motion.div style={{ y: yText }} className="relative z-10 max-w-5xl mx-auto px-4 text-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <span className="w-8 h-[1px] bg-[#84cc16]" />
            <span className="text-[#84cc16] text-[10px] font-black uppercase tracking-[0.4em]">Luxor Journal</span>
            <span className="w-8 h-[1px] bg-[#84cc16]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="text-6xl md:text-8xl lg:text-[8rem] font-black tracking-tighter leading-[0.9] mb-8 text-gray-900"
          >
            The Art Of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400 italic font-light">Exploration.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}
            className="text-gray-600 font-bold tracking-widest uppercase text-xs md:text-sm max-w-xl mx-auto leading-relaxed"
          >
            A curated stream of cinematic journeys, field reports, and untamed routes across the subcontinent.
          </motion.p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10"
        >
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
          <div className="w-[1px] h-16 bg-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#84cc16] animate-[scrollDown_2s_infinite]" />
          </div>
        </motion.div>
      </section>

      {/* ── IMMERSIVE FILTER STRIP ── */}
      <section className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-y border-gray-100 py-4 transition-all shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
            Filter Stream
          </div>
          <div className="flex items-center gap-6 md:gap-12 mx-auto sm:mx-0">
            {[
              { label: 'All Stories', value: '' },
              { label: 'Journals', value: 'blog' },
              { label: 'Films', value: 'vlog' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setType(f.value)}
                className={`relative text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-500 py-2 ${type === f.value ? 'text-[#84cc16]' : 'text-gray-400 hover:text-gray-900'
                  }`}
              >
                {f.label}
                {type === f.value && (
                  <motion.span layoutId="activeStreamTab" className="absolute -bottom-4 left-0 right-0 h-[2px] bg-[#84cc16]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CINEMATIC CONTENT STREAM ── */}
      <section className="pb-40 w-full bg-[#fcfcfc]">
        {posts.length === 0 ? (
          <div className="h-[50vh] flex items-center justify-center text-gray-400 tracking-widest uppercase text-sm font-bold">
            No entries found in this stream.
          </div>
        ) : (
          <div className="flex flex-col">
            {posts.map((post, index) => {

              const isEven = index % 2 === 0;

              return (
                <div key={post._id} className="relative w-full">

                  {/* The Post Item (Alternating Stacked Layout) */}
                  <PostStreamItem post={post} index={index} isEven={isEven} />

                  {/* ── FULLSCREEN BREATHER BANNERS ── */}
                  {index === 0 && (
                    <div className="relative w-full h-[70vh] my-10 md:my-20 overflow-hidden group">
                      <div className="absolute inset-0 bg-white z-10 opacity-10 group-hover:opacity-0 transition-opacity duration-1000" />
                      <motion.div
                        initial={{ scale: 1.1 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 2, ease: 'easeOut' }}
                        className="w-full h-full"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=2500&auto=format&fit=crop"
                          alt="Cinematic Breather"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-xl tracking-[0.2em] uppercase text-center px-4 leading-tight">
                          Where The <br className="md:hidden" />Road <br className="hidden md:block" />Ends.
                        </h2>
                      </div>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="relative w-full h-[60vh] my-10 md:my-20 overflow-hidden group bg-gray-50">
                      <div className="w-full max-w-[1600px] h-full mx-auto flex items-center justify-center relative">
                        <img
                          src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2000&auto=format&fit=crop"
                          alt="Offroad Lifestyle"
                          className="w-4/5 h-4/5 object-cover rounded-sm opacity-90 group-hover:opacity-100 transition-opacity duration-1000 grayscale group-hover:grayscale-0 shadow-xl"
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full text-center pointer-events-none">
                          <p className="text-sm md:text-lg font-mono text-gray-900 tracking-[0.5em] uppercase bg-white/90 backdrop-blur-md inline-block px-10 py-4 border border-gray-200 shadow-2xl">
                            Uncharted Territory
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </section>

      <style jsx global>{`
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </main>
  );
}
