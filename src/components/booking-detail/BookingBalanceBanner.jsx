export default function BookingBalanceBanner({ booking, payStep, payError, isBusy, onPay }) {
  return (
    <div className="mb-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-semibold text-orange-800">Balance payment required</p>
          <div className="mt-2 space-y-1 text-xs text-orange-700">
            <div className="flex justify-between">
              <span>Advance paid</span>
              <span className="font-medium">₹{booking.kmAdvancePaid?.toLocaleString('en-IN')}</span>
            </div>
            {booking.actualKm != null && (
              <div className="flex justify-between">
                <span>{booking.actualKm} km × ₹{booking.pricePerKm}/km</span>
                <span className="font-medium">₹{booking.finalRideAmount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between pt-1.5 border-t border-orange-200">
              <span className="font-bold text-orange-900">Balance due</span>
              <span className="font-black text-orange-900">₹{booking.remainingBalance?.toLocaleString('en-IN')}</span>
            </div>
          </div>
          {payError && <p className="text-xs text-red-500 mt-1">{payError}</p>}
          <button
            onClick={onPay}
            disabled={isBusy}
            className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {payStep === 'loading' ? 'Loading…'
              : payStep === 'paying' ? 'Opening payment…'
              : `Pay Balance · ₹${booking.remainingBalance?.toLocaleString('en-IN')}`}
          </button>
        </div>
      </div>
    </div>
  );
}
