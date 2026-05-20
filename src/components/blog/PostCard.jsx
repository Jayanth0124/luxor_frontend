'use client';

import Link from 'next/link';

export default function PostCard({ post }) {
  // Use the post.coverImage directly (handling our dummy data structure)
  // or fallback to original imgUrl function logic if it was a real DB entry
  const cover = post.coverImage;

  return (
    <Link href={`/blog/${post.slug}`} className="group block relative w-full h-[500px] rounded-[2rem] overflow-hidden outline-none">
      
      {/* ── CINEMATIC BACKGROUND ── */}
      <div className="absolute inset-0 bg-[#0a1017]">
        {cover ? (
          <img 
            src={cover} 
            alt={post.title} 
            className="w-full h-full object-cover opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-[2s] ease-out" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
            </svg>
          </div>
        )}
        
        {/* Deep immersive gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-[#05080f]/40 to-transparent opacity-95 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05080f]/80 via-transparent to-transparent opacity-80" />
      </div>

      {/* ── FLOATING GPS / EXPEDITION DATA ── */}
      <div className="absolute top-6 left-6 right-6 flex items-start justify-between z-10 pointer-events-none">
        <div className="flex flex-col gap-3">
          {/* Status Glass Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 w-max shadow-lg">
            {post.status === 'Active Route' ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            )}
            <span className="text-[9px] font-black uppercase tracking-widest text-white">{post.status || 'Archived'}</span>
          </div>
          
          {/* Coordinates & Elevation (Reveals on Hover) */}
          <div className="opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75 flex flex-col gap-1.5 border-l border-[#84cc16]/50 pl-3">
            <div>
              <span className="block text-[8px] font-mono text-[#84cc16] uppercase tracking-widest leading-none">Coords</span>
              <span className="block text-[10px] font-mono text-white/80">{post.coordinates || 'UNKNOWN'}</span>
            </div>
            {post.elevation && (
              <div>
                <span className="block text-[8px] font-mono text-[#84cc16] uppercase tracking-widest leading-none mt-1">Elev</span>
                <span className="block text-[10px] font-mono text-white/80">{post.elevation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Read Time / Type indicator */}
        <div className="flex flex-col items-end gap-2 text-right">
          <span className="text-[9px] font-black px-2.5 py-1 rounded-sm bg-black/40 backdrop-blur-sm border border-white/10 text-white uppercase tracking-widest">
            {post.type}
          </span>
          {post.readTime && (
            <span className="text-[9px] font-mono text-gray-500 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-sm">
              {post.readTime} MIN READ
            </span>
          )}
        </div>
      </div>

      {/* ── LOGBOOK CONTENT ── */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10 flex flex-col justify-end">
        
        {/* Category Label */}
        {post.category && (
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-[1px] bg-[#84cc16]" />
            <p className="text-[9px] font-black text-[#84cc16] uppercase tracking-[0.25em]">{post.category}</p>
          </div>
        )}

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-black text-white leading-[1.1] mb-4 tracking-[-0.02em] group-hover:text-[#84cc16] transition-colors duration-300">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-6 font-medium group-hover:text-gray-300 transition-colors duration-300">
            {post.excerpt}
          </p>
        )}

        {/* Meta Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-auto">
          <div className="flex items-center gap-3">
            {post.authorName && (
              <span className="text-xs font-black text-white uppercase tracking-widest">{post.authorName}</span>
            )}
            <span className="text-gray-700 text-xs font-black">/</span>
            {post.publishedAt && (
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
          
          <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-[#84cc16] group-hover:border-[#84cc16] transition-all duration-300 text-white group-hover:text-black">
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
