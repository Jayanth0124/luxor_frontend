import { fmtDate, fmtDatetime } from '@/utils/date';

function Detail({ label, value, span = false }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-all">{value || '—'}</p>
    </div>
  );
}

export default function BookingDetailsCard({ booking, isVehicle }) {
  const unit = booking.bookingUnit ?? (isVehicle ? 'day' : 'night');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Booking Details</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Detail label={isVehicle ? 'Pickup Date' : 'Check-in'}   value={fmtDate(booking.startDate)} />
        <Detail label={isVehicle ? 'Drop-off Date' : 'Check-out'} value={fmtDate(booking.endDate)}   />
        {isVehicle && booking.pickupLocation  && <Detail label="Pickup Location"  value={booking.pickupLocation}  span />}
        {isVehicle && booking.dropoffLocation && <Detail label="Drop-off Location" value={booking.dropoffLocation} span />}
        <Detail
          label="Duration"
          value={`${booking.totalUnits} ${unit}${booking.totalUnits !== 1 ? 's' : ''}`}
        />
        <Detail
          label="Guests"
          value={`${booking.guests ?? 1} guest${(booking.guests ?? 1) !== 1 ? 's' : ''}`}
        />
        {booking.roomSnapshot?.category && (
          <Detail label="Room Type" value={booking.roomSnapshot.category} />
        )}
        {booking.roomSnapshot?.capacity && (
          <Detail label="Room Capacity" value={`Up to ${booking.roomSnapshot.capacity} guests`} />
        )}
        {booking.roomSnapshot?.price != null && (
          <Detail label="Rate / Night" value={`₹${Number(booking.roomSnapshot.price).toLocaleString('en-IN')}`} />
        )}
        <Detail label="Booked On" value={fmtDatetime(booking.createdAt)} span />
      </div>
      {booking.specialRequests && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-1.5">Special Requests</p>
          <p className="text-sm text-gray-700 leading-relaxed">{booking.specialRequests}</p>
        </div>
      )}
    </div>
  );
}
