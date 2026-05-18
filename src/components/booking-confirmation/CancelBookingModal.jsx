export default function CancelBookingModal({ cancelReason, setCancelReason, cancelError, isPending, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-black text-gray-900">Cancel Booking?</h2>
        <p className="text-sm text-gray-500">This action cannot be undone.</p>
        <textarea
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation (optional)"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        {cancelError && <p className="text-xs text-red-500">{cancelError}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Keep Booking
          </button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50">
            {isPending ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
