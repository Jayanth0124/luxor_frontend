export default function BookingPaymentBanner({ booking, payStep, payError, isBusy, onPay }) {
  return (
    <div className="mb-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 flex items-start gap-3">
      <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">Payment not completed</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Your slot is temporarily held. Complete payment within 30 minutes or it will be released.
        </p>
        {payError && <p className="text-xs text-red-500 mt-1">{payError}</p>}
        <button
          onClick={onPay}
          disabled={isBusy}
          className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {payStep === 'loading' ? 'Loading…'
            : payStep === 'paying' ? 'Opening payment…'
            : `Complete Payment · ₹${booking.amountDue?.toLocaleString('en-IN')}`}
        </button>
      </div>
    </div>
  );
}
