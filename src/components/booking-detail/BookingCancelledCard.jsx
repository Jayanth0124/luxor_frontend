import { fmtDate } from '@/utils/date';

export default function BookingCancelledCard({ booking }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
      <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-2">Booking Cancelled</p>
      <div className="space-y-1.5 text-sm">
        {booking.cancelledBy && (
          <p className="text-gray-600">
            Cancelled by{' '}
            <span className="font-semibold capitalize">{booking.cancelledBy}</span>
            {booking.cancelledAt && (
              <span className="text-gray-400"> on {fmtDate(booking.cancelledAt)}</span>
            )}
          </p>
        )}
        {booking.cancellationReason && (
          <p className="text-gray-600 italic">"{booking.cancellationReason}"</p>
        )}
      </div>
    </div>
  );
}
