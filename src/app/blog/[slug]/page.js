'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@/store/authSlice';
import { getPost, getComments, postComment, likeComment } from '@/services/blog.service';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1').replace('/api/v1', '');
function imgUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

// ── Comment form ────────────────────────────────────────────────────────────
function CommentForm({ blogId, parentId = null, onSuccess, user, isAuth }) {
  const qc = useQueryClient();
  const [content,     setContent]     = useState('');
  const [guestName,   setGuestName]   = useState('');
  const [guestEmail,  setGuestEmail]  = useState('');
  const [submitted,   setSubmitted]   = useState(false);

  const mut = useMutation({
    mutationFn: () => postComment(blogId, {
      content,
      guestName:  isAuth ? undefined : guestName,
      guestEmail: isAuth ? undefined : guestEmail,
      parentComment: parentId || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-comments', blogId] });
      setContent('');
      setSubmitted(true);
      if (onSuccess) onSuccess();
    },
  });

  if (submitted) {
    return (
      <p className="text-sm text-green-600 font-medium py-3">
        Comment submitted! It will appear after moderation.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {!isAuth && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name *"
            required
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition"
          />
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="Email (optional)"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition"
          />
        </div>
      )}
      <textarea
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? 'Write a reply…' : 'Share your thoughts…'}
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition resize-none"
      />
      {mut.isError && <p className="text-xs text-red-500">Failed to submit. Please try again.</p>}
      <button
        onClick={() => mut.mutate()}
        disabled={!content.trim() || (!isAuth && !guestName.trim()) || mut.isPending}
        className="bg-[#84cc16] hover:bg-[#78b715] disabled:opacity-50 text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl transition"
      >
        {mut.isPending ? 'Posting…' : parentId ? 'Post Reply' : 'Post Comment'}
      </button>
    </div>
  );
}

// ── Single comment ──────────────────────────────────────────────────────────
function Comment({ comment, blogId, user, isAuth }) {
  const qc = useQueryClient();
  const [showReply, setShowReply] = useState(false);

  const likeMut = useMutation({
    mutationFn: () => likeComment(comment._id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-comments', blogId] }),
  });

  const displayName = comment.user?.name || comment.guestName || 'Anonymous';

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16] font-bold text-sm shrink-0">
          {displayName[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-800">{displayName}</span>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1.5 px-1">
            <button
              onClick={() => likeMut.mutate()}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#84cc16] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.25M9 21H5.25a2.25 2.25 0 01-2.25-2.25V10.5a2.25 2.25 0 012.25-2.25H9" />
              </svg>
              {comment.likes > 0 ? comment.likes : ''} Like
            </button>
            <button
              onClick={() => setShowReply((v) => !v)}
              className="text-xs text-gray-400 hover:text-[#84cc16] transition-colors"
            >
              Reply
            </button>
          </div>

          {/* Reply form */}
          {showReply && (
            <div className="mt-3 pl-2">
              <CommentForm
                blogId={blogId}
                parentId={comment._id}
                onSuccess={() => setShowReply(false)}
                user={user}
                isAuth={isAuth}
              />
            </div>
          )}

          {/* Nested replies */}
          {comment.replies?.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
              {comment.replies.map((reply) => (
                <div key={reply._id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">
                    {(reply.user?.name || reply.guestName || 'A')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{reply.user?.name || reply.guestName || 'Anonymous'}</span>
                      <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function BlogDetailPage() {
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
      {/* Hero */}
      <section className="bg-[#1a1a1a]">
        {cover && (
          <div className="relative h-64 sm:h-[480px] overflow-hidden">
            <img src={cover} alt={post.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent" />
          </div>
        )}
        <div className={`max-w-7xl mx-auto px-4 ${cover ? 'pb-10 -mt-32 relative z-10' : 'pt-24 pb-16'}`}>
          {/* Breadcrumb */}
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
        {/* Vlog embed */}
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

        {/* Article content */}
        {post.content && (
          <article
            className="prose prose-gray prose-base max-w-none blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {/* Tags */}
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

        {/* Comments */}
        <section className="space-y-8">
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-black text-gray-900 mb-6">
              Comments ({comments.length})
            </h2>

            {/* Existing comments */}
            {comments.length > 0 && (
              <div className="space-y-6 mb-10">
                {comments.map((c) => (
                  <Comment key={c._id} comment={c} blogId={post._id} user={user} isAuth={isAuth} />
                ))}
              </div>
            )}

            {/* Leave a comment */}
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

        {/* Back link */}
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
