'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '@/services/blog.service';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1').replace('/api/v1', '');

function imgUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

function PostCard({ post }) {
  const cover = imgUrl(post.coverImage);
  return (
    <Link href={`/blog/${post.slug}`} className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {cover ? (
          <img src={cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${post.type === 'vlog' ? 'bg-purple-500 text-white' : 'bg-[#84cc16] text-gray-900'}`}>
            {post.type}
          </span>
          {post.featured && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-gray-700">Featured</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {post.category && (
          <p className="text-xs font-semibold text-[#84cc16] uppercase tracking-wider mb-1.5">{post.category}</p>
        )}
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#84cc16] transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            {post.authorName && <span>{post.authorName}</span>}
            {post.publishedAt && (
              <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            )}
          </div>
          <span>{post.readTime} min read</span>
        </div>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">#{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const [type,   setType]   = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['public-blog', type, page],
    queryFn: () => getPosts({ type: type || undefined, page, limit: 9 }),
  });

  const posts    = data?.posts ?? [];
  const total    = data?.total ?? 0;
  const lastPage = Math.ceil(total / 9);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#1a1a1a] pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Stories & <span className="text-[#84cc16]">Vlogs</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Travel guides, adventure stories, tips and video journals from the road.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Type filter */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { label: 'All',   value: '' },
            { label: 'Blogs', value: 'blog' },
            { label: 'Vlogs', value: 'vlog' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setType(f.value); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                type === f.value
                  ? 'bg-[#84cc16] text-gray-900'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-semibold mb-1">No posts yet</p>
            <p className="text-sm">Check back soon for stories and vlogs.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p) => <PostCard key={p._id} post={p} />)}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 disabled:opacity-40 hover:border-gray-300 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-400 px-3">{page} / {lastPage}</span>
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 disabled:opacity-40 hover:border-gray-300 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
