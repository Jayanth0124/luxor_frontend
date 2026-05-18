'use client';

import Link from 'next/link';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1').replace('/api/v1', '');

function imgUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export default function PostCard({ post }) {
  const cover = imgUrl(post.coverImage);
  return (
    <Link href={`/blog/${post.slug}`} className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
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
