export default function StarRow({ rating, numReviews, onReviewClick }) {
  if (rating == null) return null;
  return (
    <div className="flex items-center gap-1.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} className="w-4 h-4" fill={n <= Math.round(rating) ? '#84cc16' : 'none'}
          viewBox="0 0 24 24" stroke="#84cc16" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
      <span className="text-white font-bold text-sm ml-1">{rating}</span>
      {numReviews > 0 && (
        <button onClick={onReviewClick} className="text-white/60 text-xs hover:text-white transition-colors ml-0.5">
          ({numReviews} review{numReviews !== 1 ? 's' : ''})
        </button>
      )}
    </div>
  );
}
