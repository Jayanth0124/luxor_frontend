'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PostStreamItem({ post, index, isEven, isDark }) {
  const cover = post.coverImage;

  const fadeGradient = isDark 
    ? 'from-gray-950 via-gray-950/80 to-transparent' 
    : 'from-[#fcfcfc] via-[#fcfcfc]/80 to-transparent';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} w-full min-h-[70vh] lg:h-[85vh] relative border-b transition-colors duration-500 ${
        isDark ? 'border-gray-900 bg-gray-950' : 'border-gray-100 bg-[#fcfcfc]'
      }`}
    >
      {/* ── IMAGE SECTION (50%) ── */}
      <div className={`w-full lg:w-1/2 h-[50vh] lg:h-full relative overflow-hidden group transition-colors duration-500 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <Link href={`/blog/${post.slug}`} className="block w-full h-full relative outline-none">
          <div className={`absolute inset-0 transition-colors duration-500 z-0 ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`} />
          {cover ? (
            <motion.img 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              src={cover} 
              alt={post.title} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700 relative z-10"
            />
          ) : (
            <div className={`w-full h-full transition-colors duration-500 ${isDark ? 'bg-gray-900' : 'bg-gray-200'}`} />
          )}

          {/* Fade gradients to blend into the text side and background */}
          <div className={`hidden lg:block absolute top-0 bottom-0 ${isEven ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} ${fadeGradient} transition-all duration-500 w-48 z-20 pointer-events-none`} />
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-gray-950' : 'from-[#fcfcfc]'} via-transparent to-transparent lg:hidden z-20 pointer-events-none`} />
          
          {/* Floating Action Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
            <div className={`w-24 h-24 rounded-full border flex flex-col items-center justify-center hover:bg-[#84cc16] hover:text-white hover:border-[#84cc16] transition-all duration-500 shadow-2xl ${
              isDark ? 'bg-gray-900/80 border-gray-800 text-white' : 'bg-white/60 border-white text-gray-900'
            }`}>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Explore</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </div>
        </Link>
      </div>

      {/* ── TYPOGRAPHY / CONTENT SECTION (50%) ── */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-16 lg:py-0 transition-colors duration-500 ${
        isDark ? 'bg-gray-950' : 'bg-[#fcfcfc]'
      } ${isEven ? 'lg:pl-16 xl:pl-32' : 'lg:pr-16 xl:pr-32'} relative z-10`}>
        
        {/* Top Meta */}
        <div className="flex items-center gap-4 mb-8">
          <span className={`text-[9px] font-black uppercase tracking-[0.3em] text-[#84cc16] border px-3 py-1.5 rounded-sm transition-all duration-500 ${
            isDark ? 'border-[#84cc16]/55 bg-[#84cc16]/10' : 'border-[#84cc16]/30 bg-[#84cc16]/5'
          }`}>
            {post.category}
          </span>
          <div className={`w-12 h-[1px] transition-colors duration-500 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            Vol. 0{index + 1}
          </span>
        </div>

        {/* Cinematic Title */}
        <Link href={`/blog/${post.slug}`} className="group outline-none block w-full max-w-xl">
          <h2 className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] tracking-[-0.04em] mb-3 group-hover:text-[#84cc16] transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {post.title}
          </h2>
          {post.subtitle && (
            <h3 className={`text-xl md:text-3xl lg:text-4xl font-light italic tracking-tight leading-tight transition-colors duration-500 ${
              isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-500'
            }`}>
              {post.subtitle}
            </h3>
          )}
        </Link>

        {/* Excerpt */}
        <p className={`mt-8 text-sm md:text-base font-medium leading-relaxed max-w-md transition-colors duration-500 ${
          isDark ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {post.excerpt}
        </p>

        {/* Bottom Details */}
        <div className={`mt-12 flex items-center justify-between border-t pt-6 max-w-md transition-colors duration-500 ${
          isDark ? 'border-gray-900' : 'border-gray-100'
        }`}>
          <div className="flex flex-col gap-1">
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
              isDark ? 'text-gray-200' : 'text-gray-900'
            }`}>
              By {post.authorName}
            </span>
            {post.publishedAt && (
              <span className="text-[10px] font-mono text-gray-400">
                {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
          
          <Link href={`/blog/${post.slug}`} className={`text-[10px] font-black uppercase tracking-[0.3em] hover:text-[#84cc16] transition-colors ${
            isDark ? 'text-white' : 'text-gray-900'
          } flex items-center gap-2`}>
            Read <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
