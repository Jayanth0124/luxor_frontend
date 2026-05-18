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

/* ── Star rating display ────────────────────────────────────────── */
function Stars({ rating, size = 'sm', interactive = false, value, onChange }) {
  const sz = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const display = interactive ? value : rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(n)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <svg className={`${sz} transition-colors`} fill={n <= display ? '#84cc16' : 'none'}
            viewBox="0 0 24 24" stroke={n <= display ? '#84cc16' : '#d1d5db'} strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ── Rating bar ─────────────────────────────────────────────────── */
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-400 w-2 text-right shrink-0">{star}</span>
      <svg className="w-3 h-3 text-[#84cc16] shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#84cc16] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-5 text-right shrink-0">{count}</span>
    </div>
  );
}

/* ── Single review card ─────────────────────────────────────────── */
function ReviewCard({ review }) {
  const u       = review.user;
  const name    = u?.name || u?.email?.split('@')[0] || (u?.mobile ? `User ···${u.mobile.slice(-4)}` : 'Guest');
  const initial = name[0]?.toUpperCase() || 'G';
  const date    = new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', day: 'numeric' });

  // Pastel avatar colors from initial
  const colors = ['#f7fee7,#65a30d', '#fef9c3,#ca8a04', '#fce7f3,#be185d', '#ede9fe,#7c3aed', '#e0f2fe,#0369a1'];
  const [bg, fg] = colors[initial.charCodeAt(0) % colors.length].split(',');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {u?.profilePic ? (
            <img src={u.profilePic} alt={name} className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-white ring-offset-1 shadow" />
          ) : (
            <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shrink-0 shadow"
              style={{ backgroundColor: bg, color: fg }}>
              {initial}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-gray-900">{name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Stars rating={review.rating} />
          <span className="text-[10px] font-semibold text-[#84cc16] bg-lime-50 px-2 py-0.5 rounded-full">
            {review.rating === 5 ? 'Excellent' : review.rating === 4 ? 'Very Good' : review.rating === 3 ? 'Good' : review.rating === 2 ? 'Fair' : 'Poor'}
          </span>
        </div>
      </div>

      {/* Body */}
      {review.title && (
        <p className="text-sm font-semibold text-gray-900 mb-1.5">{review.title}</p>
      )}
      {review.body && (
        <p className="text-sm text-gray-500 leading-relaxed">{review.body}</p>
      )}
    </div>
  );
}

/* ── Write review form ──────────────────────────────────────────── */
function WriteReviewForm({ refType, entityId }) {
  const qc      = useQueryClient();
  const isAuth  = useSelector(selectIsAuthenticated);

  const [rating, setRating] = useState(0);
  const [title,  setTitle]  = useState('');
  const [body,   setBody]   = useState('');
  const [error,  setError]  = useState('');

  const { data: eligible, isLoading: checkingEligibility } = useQuery({
    queryKey: ['review-eligible', refType, entityId],
    queryFn:  () => checkReviewEligibility(refType, entityId),
    enabled:  isAuth && Boolean(entityId),
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
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
        <div className="w-10 h-10 bg-lime-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">Share your experience</p>
        <p className="text-xs text-gray-400 mb-4">Sign in to leave a review</p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('luxor:require-login', { detail: { redirect: window.location.pathname } }))}
          className="text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
          style={{ backgroundColor: '#84cc16', color: '#1a2e05' }}
        >
          Sign In
        </button>
      </div>
    );
  }

  if (checkingEligibility) return null;

  if (!eligible?.eligible) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5">
        <p className="text-xs text-gray-400 text-center">{eligible?.reason || 'Complete a booking to leave a review.'}</p>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="bg-lime-50 border border-lime-200 rounded-2xl p-6 text-center">
        <svg className="w-10 h-10 text-[#84cc16] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-bold text-lime-800">Review submitted!</p>
        <p className="text-xs text-lime-600 mt-1">Thank you for sharing your experience.</p>
      </div>
    );
  }

  const ratingLabels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <div className="bg-gray-50 px-5 py-4 border-b border-gray-100">
        <h4 className="text-sm font-bold text-gray-900">Write a Review</h4>
        <p className="text-xs text-gray-400 mt-0.5">Your feedback helps other travellers</p>
      </div>

      <div className="p-5 space-y-4">
        {/* Star selector */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Rating</p>
          <div className="flex items-center gap-3">
            <Stars size="lg" interactive value={rating} onChange={setRating} />
            {rating > 0 && (
              <span className="text-xs font-bold text-[#84cc16]">{ratingLabels[rating]}</span>
            )}
          </div>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summary (optional)"
          maxLength={120}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#84cc16] transition-colors bg-white"
        />

        <div>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience in detail..."
            maxLength={1200}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#84cc16] transition-colors bg-white"
          />
          <p className="text-[10px] text-gray-300 mt-1 text-right">{body.length}/1200</p>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          onClick={() => { setError(''); mutation.mutate(); }}
          disabled={rating === 0 || mutation.isPending}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 hover:brightness-105"
          style={{ backgroundColor: '#84cc16', color: '#1a2e05' }}
        >
          {mutation.isPending ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}

/* ── Main ReviewsSection component ─────────────────────────────── */
export default function ReviewsSection({ refType, entityId, averageRating, totalReviews }) {
  const [page, setPage] = useState(1);
  const LIMIT = 5;

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', refType, entityId, page],
    queryFn:  () => getPublicReviews(refType, entityId, { page, limit: LIMIT }),
    enabled:  Boolean(entityId),
    staleTime: 2 * 60 * 1000,
  });

  const reviews    = data?.reviews   ?? [];
  const total      = data?.total     ?? totalReviews ?? 0;
  const breakdown  = data?.breakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalPages = Math.ceil(total / LIMIT);

  const avg = averageRating ?? (
    total > 0
      ? Math.round(([5,4,3,2,1].reduce((s,n) => s + n * (breakdown[n]||0), 0) / total) * 10) / 10
      : null
  );

  return (
    <section className="mt-10 pt-10 border-t border-gray-100">
      {/* Section heading */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900">Guest Reviews</h2>
          {total > 0 && <p className="text-sm text-gray-400 mt-0.5">{total} verified review{total !== 1 ? 's' : ''}</p>}
        </div>
        {avg != null && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5">
            <span className="text-2xl font-black text-gray-900">{avg}</span>
            <div>
              <Stars rating={Math.round(avg)} />
              <p className="text-[10px] text-gray-400 mt-0.5 text-right">out of 5</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">

        {/* Left: breakdown + write form */}
        <div className="space-y-5">
          {/* Rating breakdown card */}
          {avg != null && (
            <div className="bg-gray-900 rounded-2xl p-5 text-white">
              <div className="flex items-end gap-3 mb-5">
                <span className="text-5xl font-black leading-none">{avg}</span>
                <div className="pb-1">
                  <Stars rating={Math.round(avg)} />
                  <p className="text-xs text-gray-400 mt-1">{total} review{total !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[5,4,3,2,1].map((n) => {
                  const count = breakdown[n] ?? 0;
                  const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={n} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-2 text-right shrink-0">{n}</span>
                      <svg className="w-3 h-3 text-[#84cc16] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#84cc16] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-4 text-right shrink-0">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <WriteReviewForm refType={refType} entityId={entityId} />
        </div>

        {/* Right: review list */}
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map((i) => (
                <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-36" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <>
              <div className="space-y-4">
                {reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:border-[#84cc16] transition-colors">
                    ← Prev
                  </button>
                  <span className="text-sm text-gray-400">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:border-[#84cc16] transition-colors">
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl">
              <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <p className="text-sm font-medium text-gray-400">No reviews yet</p>
              <p className="text-xs text-gray-300 mt-1">Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
