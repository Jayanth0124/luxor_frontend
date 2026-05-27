'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPosts } from '@/services/blog.service';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const DUMMY_POSTS = [
  {
    _id: '1',
    slug: 'himalayan-ascent',
    title: 'The Himalayan Ascent: Trailing Spiti Valley Trails',
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
    title: 'Chasing Sunsets: The Ultimate Coastal Escape',
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
    title: 'Golden Dunes of Thar: Surviving Sand Traps',
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
    title: 'Into the Emerald Canopy of Coorg Coffee Country',
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

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-3xl ${className}`} />;
}

export default function BlogSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Split layout states
  const [hoveredSide, setHoveredSide] = useState(null); // 'left' | 'right' | null
  const [activeVlogIndex, setActiveVlogIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    getPosts()
      .then((data) => {
        if (data && data.length > 0) {
          setPosts(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && posts.length === 0) return null;

  // Filter posts strictly into Blogs and Vlogs
  const blogPosts = posts.filter((p) => p.type === 'blog' || !p.type);
  const vlogPosts = posts.filter((p) => p.type === 'vlog');
  const activeVlog = vlogPosts[activeVlogIndex] || vlogPosts[0];

  return (
    <section className="py-20 px-4 sm:px-6 md:px-12 xl:px-20 bg-[#fbfaf8] border-t border-gray-100 overflow-hidden font-sans">
      <div className="max-w-screen-xl mx-auto space-y-12">
        
        {/* Modern Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#84cc16]">Stories & Media</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Our Blog & Vlog</h2>
          </div>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#84cc16] transition-colors duration-200"
          >
            Explore all
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
            <Skeleton className="h-full" />
            <Skeleton className="h-full" />
          </div>
        ) : (
          /* Immersive Split-Screen Container */
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch min-h-[620px] relative">
            
            {/* ── LEFT SIDE: CINEMATIC VLOG EXPERIENCE ───────────────────── */}
            <div
              onMouseEnter={() => setHoveredSide('left')}
              onMouseLeave={() => setHoveredSide(null)}
              className={`flex-1 flex flex-col justify-between bg-gradient-to-b from-[#fbf9f4] to-[#f5efe2] border border-[#ecdcb8]/70 rounded-[36px] p-6 sm:p-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden relative group ${
                hoveredSide === 'left'
                  ? 'lg:flex-[1.3] lg:max-w-[60%]'
                  : hoveredSide === 'right'
                  ? 'lg:flex-[0.7] lg:max-w-[40%] opacity-85'
                  : 'lg:flex-[1.0] lg:max-w-[50%]'
              }`}
            >
              <div className="space-y-4 z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#84cc16]">Vlog</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LUXOR TV Originals</span>
                </div>

                {/* Main Video View Screen */}
                {activeVlog && (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#e6ddca] shadow-md border border-[#ecdcb8]/30">
                    <img
                      src={activeVlog.coverImage}
                      alt={activeVlog.title}
                      className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
                    />
                    {/* Soft Cinematic Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15" />

                    {/* Floating Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-white/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#84cc16] transition-all duration-300 ease-out">
                        <svg className="w-6 h-6 text-gray-900 group-hover:text-white ml-0.5 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-lg border border-white/10">
                      {activeVlog.readTime ? `0${activeVlog.readTime}:00` : '05:40'}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Vlog Metadata Panel */}
              {activeVlog && (
                <div className="space-y-4 pt-6 z-10">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#84cc16]">
                      {activeVlog.category || 'CINEMATIC'}
                    </div>
                    <h3 className="text-gray-900 font-sans font-bold text-xl sm:text-2xl leading-tight group-hover:translate-x-0.5 transition-transform duration-300">
                      {activeVlog.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                      Streamed · {formatDate(activeVlog.publishedAt || activeVlog.createdAt)}
                    </p>
                  </div>

                  {/* Multi-Vlog Selector (Thumbnails) */}
                  {vlogPosts.length > 1 && (
                    <div className="flex gap-2.5 pt-4 border-t border-[#ecdcb8]/30">
                      {vlogPosts.map((v, i) => (
                        <button
                          key={v._id}
                          onClick={() => setActiveVlogIndex(i)}
                          className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                            activeVlogIndex === i
                              ? 'border-[#84cc16] scale-105 shadow-sm'
                              : 'border-transparent opacity-50 hover:opacity-80'
                          }`}
                        >
                          <img src={v.coverImage} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT SIDE: EDITORIAL BLOG STORIES ─────────────────────── */}
            <div
              onMouseEnter={() => setHoveredSide('right')}
              onMouseLeave={() => setHoveredSide(null)}
              className={`flex-1 flex flex-col bg-white border border-gray-100 rounded-[36px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                hoveredSide === 'right'
                  ? 'lg:flex-[1.3] lg:max-w-[60%]'
                  : hoveredSide === 'left'
                  ? 'lg:flex-[0.7] lg:max-w-[40%] opacity-85'
                  : 'lg:flex-[1.0] lg:max-w-[50%]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#84cc16]">Blog</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Magazine Journal</span>
              </div>

              {/* Scrollable Editorial List with Fade-out mask */}
              <div className="flex-1 overflow-y-auto max-h-[460px] pr-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-transparent">
                {blogPosts.map((post) => (
                  <Link
                    href={`/blog/${post.slug}`}
                    key={post._id}
                    className="group/item block space-y-3 pb-6 border-b border-gray-50 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em]">
                      <span className="text-[#84cc16]">{post.category || 'EXPEDITION'}</span>
                      <span className="text-gray-400">{post.readTime || 8} MIN READ</span>
                    </div>

                    <h4 className="text-gray-900 leading-tight font-serif text-xl sm:text-2xl font-bold group-hover/item:text-[#84cc16] transition-colors duration-300">
                      {post.title}
                    </h4>

                    {post.excerpt && (
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-light line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      <span>{post.authorName || 'LUXOR TEAM'}</span>
                      <span>·</span>
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                  </Link>
                ))}

                {blogPosts.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-12">No blogs found.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
