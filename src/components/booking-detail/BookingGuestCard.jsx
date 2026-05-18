function Detail({ label, value, span = false }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-all">{value || '—'}</p>
    </div>
  );
}

export default function BookingGuestCard({ booking }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Guest Information</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Detail label="Full Name" value={booking.guestName}  />
        <Detail label="Phone"     value={booking.guestPhone} />
        <Detail label="Email"     value={booking.guestEmail} span />
      </div>
    </div>
  );
}
