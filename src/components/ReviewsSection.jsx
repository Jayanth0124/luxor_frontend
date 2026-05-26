'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/authSlice';
import {
  getPublicReviews,
  checkReviewEligibility,
  submitReview,
} from '@/services/reviews.service';

/* ── Enterprise Star Rating Display ─────────────────────────────── */
function Stars({ rating, size = 'sm', interactive = false, value, onChange }) {
  const sz = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const display = interactive ? value : rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(n)}
          className={`outline-none ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <svg
            className={`${sz} transition-colors duration-200`}
            fill={n <= display ? '#111827' : 'transparent'}
            viewBox="0 0 24 24"
            stroke={n <= display ? '#111827' : '#D1D5DB'}
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ── Editorial Review Card ──────────────────────────────────────── */
function ReviewCard({ review }) {
  const u = review.user;
  const name = u?.name || u?.email?.split('@')[0] || (u?.mobile ? `Guest ···${u.mobile.slice(-4)}` : 'Verified Guest');
  const initial = name[0]?.toUpperCase() || 'G';
  const date = new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' });

  return (
    <div className="py-6 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {u?.profilePic ? (
            <img src={u.profilePic} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-100" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-900 shrink-0 text-sm">
              {initial}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-gray-900">{name}</p>
            <p className="text-xs font-medium text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>
        <div className="shrink-0">
          <Stars rating={review.rating} />
        </div>
      </div>

      {review.title && (
        <h4 className="text-sm font-bold text-gray-900 mb-2">{review.title}</h4>
      )}
      {review.body && (
        <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
      )}
    </div>
  );
}

/* ── Minimalist Write Review Form ───────────────────────────────── */
function WriteReviewForm({ refType, entityId }) {
  const qc = useQueryClient();
  const isAuth = useSelector(selectIsAuthenticated);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const { data: eligible, isLoading: checkingEligibility } = useQuery({
    queryKey: ['review-eligible', refType, entityId],
    queryFn: () => checkReviewEligibility(refType, entityId),
    enabled: isAuth && Boolean(entityId),
    staleTime: 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: () => submitReview({ refType, refId: entityId, rating, title, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', refType, entityId] });
      qc.invalidateQueries({ queryKey: ['review-eligible', refType, entityId] });
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to submit review.'),
  });

  if (!isAuth) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mt-8">
        <p className="text-sm font-bold text-gray-900 mb-1">Share your experience</p>
        <p className="text-xs text-gray-500 mb-4">You must be signed in to leave a review.</p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('luxor:require-login', { detail: { redirect: window.location.pathname } }))}
          className="text-xs font-bold uppercase tracking-widest px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors outline-none"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (checkingEligibility) return null;

  if (!eligible?.eligible) {
    return (
      <div className="bg-gray-50 rounded-xl p-5 mt-8 border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 text-center uppercase tracking-widest">{eligible?.reason || 'Complete a booking to review.'}</p>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center mt-8">
        <p className="text-sm font-bold text-green-800">Review submitted successfully.</p>
        <p className="text-xs font-medium text-green-600 mt-1">Thank you for sharing your experience with the community.</p>
      </div>
    );
  }

  const ratingLabels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Exceptional' };

  return (
    <div className="mt-10 pt-8 border-t border-gray-200">
      <h4 className="text-base font-extrabold text-gray-900 mb-6">Write a Review</h4>

      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Overall Rating</p>
          <div className="flex items-center gap-4">
            <Stars size="lg" interactive value={rating} onChange={setRating} />
            {rating > 0 && (
              <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">{ratingLabels[rating]}</span>
            )}
          </div>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience (optional)"
          maxLength={120}
          className="w-full border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-gray-900 transition-colors bg-transparent placeholder-gray-400 font-medium"
        />

        <div className="relative">
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share the details of your journey..."
            maxLength={1200}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-900 transition-colors bg-transparent placeholder-gray-400 font-medium"
          />
          <span className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-400">{body.length}/1200</span>
        </div>

        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

        <button
          onClick={() => { setError(''); mutation.mutate(); }}
          disabled={rating === 0 || mutation.isPending}
          className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all disabled:opacity-40 hover:bg-black outline-none"
        >
          {mutation.isPending ? 'Submitting…' : 'Publish Review'}
        </button>
      </div>
    </div>
  );
}

/* ── Main ReviewsSection ────────────────────────────────────────── */
export default function ReviewsSection({ refType, entityId, averageRating, totalReviews }) {
  const [page, setPage] = useState(1);
  const LIMIT = 5;

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', refType, entityId, page],
    queryFn: () => getPublicReviews(refType, entityId, { page, limit: LIMIT }),
    enabled: Boolean(entityId),
    staleTime: 2 * 60 * 1000,
  });

  const reviews = data?.reviews ?? [];
  const total = data?.total ?? totalReviews ?? 0;
  const breakdown = data?.breakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalPages = Math.ceil(total / LIMIT);

  const avg = averageRating ?? (
    total > 0
      ? Math.round(([5, 4, 3, 2, 1].reduce((s, n) => s + n * (breakdown[n] || 0), 0) / total) * 10) / 10
      : null
  );

  return (
    <section className="mt-12 bg-white rounded-2xl p-8 border border-gray-200 shadow-sm w-full">
      <h2 className="text-xl font-extrabold text-gray-900 mb-8">Guest Reviews</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">

        {/* Left Column: Aggregates & Form */}
        <div>
          {avg != null ? (
            <div className="mb-8">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-6xl font-black tracking-tighter text-gray-900 leading-none">{avg}</span>
                <span className="text-sm font-bold text-gray-400">/ 5</span>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <Stars rating={Math.round(avg)} />
                <span className="text-xs font-semibold text-gray-500">({total} reviews)</span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((n) => {
                  const count = breakdown[n] ?? 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={n} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-600 w-2 text-right">{n}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-900 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-6 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <span className="text-sm font-semibold text-gray-500">No ratings yet.</span>
            </div>
          )}

          <WriteReviewForm refType={refType} entityId={entityId} />
        </div>

        {/* Right Column: Review List */}
        <div>
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-32 w-full" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <>
              <div className="flex flex-col">
                {reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-6">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="text-xs font-bold uppercase tracking-widest text-gray-900 disabled:opacity-30 hover:underline outline-none">
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gray-400">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="text-xs font-bold uppercase tracking-widest text-gray-900 disabled:opacity-30 hover:underline outline-none">
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-gray-50 rounded-xl border border-gray-100">
              <svg className="w-8 h-8 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <p className="text-sm font-bold text-gray-500">No reviews yet</p>
              <p className="text-xs font-medium text-gray-400 mt-1">Be the first to leave a review.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}