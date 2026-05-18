'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '@/services/blog.service';
import PostCard from './PostCard';

export default function BlogContent() {
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['public-blog', type, page],
    queryFn: () => getPosts({ type: type || undefined, page, limit: 9 }),
  });

  const posts    = data?.posts ?? [];
  const total    = data?.total ?? 0;
  const lastPage = Math.ceil(total / 9);

  return (
    <main className="min-h-screen bg-gray-50">
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
