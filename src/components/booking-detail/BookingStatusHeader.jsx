export const STATUS_CONFIG = {
  pending: {
    icon: 'clock', bg: 'bg-amber-50', ring: 'text-amber-400',
    label: 'Payment Pending', subtitle: 'Your slot is reserved — complete payment to confirm.',
    badge: 'bg-amber-100 text-amber-700',
  },
  confirmed: {
    icon: 'check', bg: 'bg-[#84cc16]/10', ring: 'text-[#84cc16]',
    label: 'Booking Confirmed', subtitle: 'Your booking is confirmed and ready.',
    badge: 'bg-lime-100 text-lime-700',
  },
  active: {
    icon: 'play', bg: 'bg-blue-50', ring: 'text-blue-400',
    label: 'Currently Active', subtitle: 'Your booking is currently in progress.',
    badge: 'bg-blue-100 text-blue-700',
  },
  completed: {
    icon: 'check2', bg: 'bg-gray-50', ring: 'text-gray-400',
    label: 'Completed', subtitle: 'This booking has been completed.',
    badge: 'bg-gray-100 text-gray-600',
  },
  cancelled: {
    icon: 'x', bg: 'bg-red-50', ring: 'text-red-400',
    label: 'Booking Cancelled', subtitle: 'This booking has been cancelled.',
    badge: 'bg-red-100 text-red-600',
  },
  pending_balance: {
    icon: 'balance', bg: 'bg-orange-50', ring: 'text-orange-400',
    label: 'Balance Due', subtitle: 'Ride complete — please pay the remaining balance.',
    badge: 'bg-orange-100 text-orange-700',
  },
};

function StatusIcon({ type, className }) {
  if (type === 'clock') return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  if (type === 'check' || type === 'check2') return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
  if (type === 'x') return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  if (type === 'play') return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  );
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function BookingStatusHeader({ booking, cfg }) {
  const bookingDisplay = booking.bookingId || `#${booking._id.slice(-8).toUpperCase()}`;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-3 flex items-center gap-4">
        <div className={`w-14 h-14 ${cfg.bg} rounded-2xl flex items-center justify-center shrink-0`}>
          <StatusIcon type={cfg.icon} className={`w-7 h-7 ${cfg.ring}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-black text-gray-900">{cfg.label}</h1>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {booking.status?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{cfg.subtitle}</p>
        </div>
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-xs text-gray-400">Booking ID</p>
          <p className="text-xs font-mono font-bold text-gray-700">{bookingDisplay}</p>
        </div>
      </div>

      {/* Mobile booking ID row */}
      <div className="sm:hidden bg-white rounded-xl border border-gray-100 px-4 py-2.5 mb-3 flex justify-between items-center">
        <span className="text-xs text-gray-400">Booking ID</span>
        <span className="text-xs font-mono font-bold text-gray-700">{bookingDisplay}</span>
      </div>
    </>
  );
}
