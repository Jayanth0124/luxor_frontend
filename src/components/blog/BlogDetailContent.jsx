'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@/store/authSlice';
import { getPost, getComments } from '@/services/blog.service';
import CommentForm from './CommentForm';
import Comment from './Comment';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1').replace('/api/v1', '');

function imgUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export default function BlogDetailContent() {
  const { slug } = useParams();
  const user     = useSelector(selectUser);
  const isAuth   = useSelector(selectIsAuthenticated);

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getPost(slug),
    enabled: Boolean(slug),
  });

  const { data: commentsData } = useQuery({
    queryKey: ['blog-comments', post?._id],
    queryFn: () => getComments(post._id),
    enabled: Boolean(post?._id),
  });

  const comments = commentsData?.comments ?? [];

  if (isLoading) return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-64 bg-gray-200 rounded-2xl mt-6" />
      </div>
    </main>
  );

  if (isError || !post) return (
    <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-bold text-gray-800 mb-2">Post not found</p>
        <Link href="/blog" className="text-[#84cc16] hover:underline text-sm">← Back to Blog</Link>
      </div>
    </main>
  );

  const cover = imgUrl(post.coverImage);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-[#1a1a1a]">
        {cover && (
          <div className="relative h-64 sm:h-[480px] overflow-hidden">
            <img src={cover} alt={post.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent" />
          </div>
        )}
        <div className={`max-w-7xl mx-auto px-4 ${cover ? 'pb-10 -mt-32 relative z-10' : 'pt-24 pb-16'}`}>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gray-300 truncate max-w-[200px]">{post.title}</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${post.type === 'vlog' ? 'bg-purple-500 text-white' : 'bg-[#84cc16] text-gray-900'}`}>
              {post.type}
            </span>
            {post.category && <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{post.category}</span>}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
            {post.authorName && <span>{post.authorName}</span>}
            {post.publishedAt && (
              <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            )}
            <span>{post.readTime} min read</span>
            <span>{post.views} views</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {post.type === 'vlog' && post.videoUrl && (
          <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
            <iframe
              src={post.videoUrl}
              className="w-full h-full"
              allowFullScreen
              title={post.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {post.content && (
          <article
            className="prose prose-gray prose-base max-w-none blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            {post.tags.map((t) => (
              <Link
                key={t}
                href={`/blog?tag=${t}`}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-[#84cc16]/10 hover:text-[#84cc16] transition-colors"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}

        <section className="space-y-8">
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-black text-gray-900 mb-6">
              Comments ({comments.length})
            </h2>

            {comments.length > 0 && (
              <div className="space-y-6 mb-10">
                {comments.map((c) => (
                  <Comment key={c._id} comment={c} blogId={post._id} user={user} isAuth={isAuth} />
                ))}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4">Leave a Comment</h3>
              {isAuth && (
                <p className="text-xs text-gray-400 mb-3">
                  Commenting as <span className="font-semibold text-gray-600">{user?.name || 'you'}</span>
                </p>
              )}
              <CommentForm blogId={post._id} user={user} isAuth={isAuth} />
              <p className="text-xs text-gray-400 mt-3">Comments are reviewed before appearing.</p>
            </div>
          </div>
        </section>

        <div className="pb-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    </main>
  );
}
