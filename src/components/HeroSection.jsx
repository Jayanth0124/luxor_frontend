'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';
import WebGLBackground from './WebGLBackground';

const HERO_CONTENT = {
  vehicle: {
    title: "CONQUER THE",
    titleHighlight: "UNSEEN TRAILS",
    // subtitle: "Rent high-end, self-drive adventure vehicles engineered for your most ambitious overland journeys."
  },
  campsite: {
    title: "DISCOVER NATURE'S",
    titleHighlight: "FINEST RETREATS",
    // subtitle: "Disconnect from the noise and reconnect under the stars at our exclusive, hand-picked luxury campsites."
  }
};

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState('vehicle');
  const currentText = HERO_CONTENT[activeTab];

  return (
    <section className="relative w-full min-h-[850px] lg:min-h-[100vh] flex flex-col justify-center bg-black pt-32 pb-24 font-sans z-30 overflow-hidden">

      {/* ── WebGL displacement background morph ── */}
      <WebGLBackground activeTab={activeTab} />

      {/* ── Smooth Animated Wave Separator (Pure White) ── */}
      <svg className="hero-waves select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g className="parallax">
          <use xlinkHref="#gentle-wave" x="48" y="0" />
          <use xlinkHref="#gentle-wave" x="48" y="3" />
          <use xlinkHref="#gentle-wave" x="48" y="5" />
          <use xlinkHref="#gentle-wave" x="48" y="7" />
        </g>
      </svg>

      {/* ── Main Layout Content ── */}
      <div className="relative z-[10] w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16 flex flex-col">

        {/* ── Typography & Stats ── */}
        <div className="flex flex-col items-center text-center mx-auto mb-12 max-w-3xl">

          {/* ── Synced Framer Motion Text Overlay ── */}
          <div className="min-h-[160px] sm:min-h-[220px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
                className="flex flex-col items-center"
              >
                <h1 className="text-white font-black leading-[1.05] tracking-tight mb-5 drop-shadow-lg" style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.75rem)' }}>
                  {currentText.title} <br />
                  <span className="text-[#84cc16] block mt-2">{currentText.titleHighlight}</span>
                </h1>

                <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-6 font-light drop-shadow-md">
                  {currentText.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Minimalist Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
            <StatBlock value="4.9/5" label="Average Rating" />
            <div className="w-px h-10 bg-white/30 hidden sm:block" />
            <StatBlock value="50+" label="Locations" />
            <div className="w-px h-10 bg-white/30 hidden sm:block" />
            <StatBlock value="10k+" label="Travelers" />
          </div>
        </div>

        {/* ── Search Bar Section ── */}
        <div className="w-full relative z-20 mt-4">
          <SearchBar tab={activeTab} onTabChange={setActiveTab} />
        </div>

      </div>

      {/* ── Wave Animation Styles ── */}
      <style>{`
        .hero-waves {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 6vh;
          min-height: 50px;
          max-height: 100px;
          z-index: 10;
        }
        .parallax > use {
          animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
        }
        .parallax > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; fill: rgba(255,255,255,0.3); }
        .parallax > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; fill: rgba(255,255,255,0.5); }
        .parallax > use:nth-child(3) { animation-delay: -4s; animation-duration: 13s; fill: rgba(255,255,255,0.7); }
        .parallax > use:nth-child(4) { animation-delay: -5s; animation-duration: 20s; fill: #ffffff; }
        @keyframes move-forever {
          0% { transform: translate3d(-90px, 0, 0); }
          100% { transform: translate3d(85px, 0, 0); }
        }
      `}</style>

    </section>
  );
}

/* ── UI Helpers ── */
function StatBlock({ value, label }) {
  return (
    <div className="flex flex-col">
      <span className="text-white font-black text-2xl">{value}</span>
      <span className="text-white/80 text-[11px] font-semibold uppercase tracking-[0.2em] mt-1">{label}</span>
    </div>
  );
}
