'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPosts } from '@/services/blog.service';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CategoryBadge({ category, type }) {
  if (!category && type !== 'vlog') return null;
  const label = type === 'vlog' ? 'Vlog' : category;
  const classes = type === 'vlog'
    ? 'bg-purple-500 text-white'
    : 'bg-[#84cc16] text-white';
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${classes}`}>
      {label}
    </span>
  );
}

/* ── Featured (large) card ──────────────────────────────────────── */
function FeaturedCard({ post }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative rounded-3xl overflow-hidden bg-gray-900 flex flex-col justify-end min-h-[420px] sm:min-h-[500px]"
    >
      {/* Image */}
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Play button for vlogs */}
      {post.type === 'vlog' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 space-y-3">
        <CategoryBadge category={post.category} type={post.type} />
        <h2 className="text-white text-xl sm:text-2xl font-bold leading-snug line-clamp-2 group-hover:text-[#84cc16] transition-colors duration-200">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-white/70 text-sm line-clamp-2 leading-relaxed hidden sm:block">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 text-white/50 text-xs pt-1">
          {post.authorName && <span>{post.authorName}</span>}
          {post.authorName && <span>·</span>}
          {post.readTime > 0 && <span>{post.readTime} min read</span>}
          {post.readTime > 0 && <span>·</span>}
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Compact side card ──────────────────────────────────────────── */
function CompactCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200"
    >
      {post.coverImage && (
        <div className="shrink-0 w-24 h-20 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-1.5">
        <CategoryBadge category={post.category} type={post.type} />
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#84cc16] transition-colors duration-200">
          {post.title}
        </h3>
        <p className="text-xs text-gray-400">
          {formatDate(post.publishedAt || post.createdAt)}
          {post.readTime > 0 && <> · {post.readTime} min</>}
        </p>
      </div>
    </Link>
  );
}

/* ── Bottom row card ────────────────────────────────────────────── */
function GridCard({ post }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-white"
    >
      {post.coverImage ? (
        <div className="relative h-44 bg-gray-100 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {post.type === 'vlog' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-lime-50 to-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-lime-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <CategoryBadge category={post.category} type={post.type} />
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#84cc16] transition-colors duration-200 flex-1">
          {post.title}
        </h3>
        <p className="text-xs text-gray-400 mt-auto">
          {formatDate(post.publishedAt || post.createdAt)}
          {post.readTime > 0 && <span className="ml-1.5">· {post.readTime} min read</span>}
        </p>
      </div>
    </Link>
  );
}

/* ── Skeleton loaders ───────────────────────────────────────────── */
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />;
}

/* ── Main section ───────────────────────────────────────────────── */
export default function BlogSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts({ page: 1, limit: 6 })
      .then((d) => setPosts(d?.posts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && posts.length === 0) return null;

  const [featured, ...rest] = posts;
  const sideCards = rest.slice(0, 2);
  const gridCards = rest.slice(2, 5);

  return (
    <section className="py-14 px-4 sm:px-6 md:px-12 xl:px-20 bg-white border-t border-gray-100">
      <div className="max-w-screen-xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#84cc16] mb-1">Stories & Insights</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">From Our Blog</h2>
          </div>
          <Link
            href="/blog"
            className="group flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#84cc16] transition-colors duration-200"
          >
            View all
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {loading ? (
          /* Loading state */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2"><Skeleton className="h-[420px] sm:h-[500px]" /></div>
            <div className="flex flex-col gap-3">
              <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Top row: featured + side cards */}
            {featured && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <FeaturedCard post={featured} />
                </div>
                <div className="flex flex-col justify-between gap-3">
                  {sideCards.map((p) => (
                    <CompactCard key={p._id} post={p} />
                  ))}
                  {sideCards.length < 2 && (
                    <Link
                      href="/blog"
                      className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 p-4 text-sm text-gray-400 hover:border-[#84cc16] hover:text-[#84cc16] transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      More stories
                    </Link>
                  )}
                  {/* CTA box */}
                  <div className="rounded-2xl bg-gradient-to-br from-lime-50 to-green-50 border border-lime-100 p-5 space-y-2">
                    <p className="text-sm font-semibold text-gray-800">Explore more stories</p>
                    <p className="text-xs text-gray-500 leading-relaxed">Travel tips, destination guides, vlog highlights and more.</p>
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-[#84cc16] hover:underline"
                    >
                      Visit our blog
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom row: grid cards */}
            {gridCards.length > 0 && (
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {gridCards.map((p) => (
                  <GridCard key={p._id} post={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
