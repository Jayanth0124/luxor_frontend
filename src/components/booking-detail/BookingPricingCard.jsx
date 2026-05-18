function Row({ label, value, muted = false }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${muted ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-sm font-semibold ${muted ? 'text-gray-400' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}

function PaymentStatusBadge({ status }) {
  const map = {
    paid:     'bg-lime-100 text-lime-700',
    pending:  'bg-amber-100 text-amber-700',
    failed:   'bg-red-100 text-red-600',
    refunded: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status ?? '—'}
    </span>
  );
}

/**
 * How much of booking.addonsTotal was included in the original booking total (at creation time),
 * vs paid separately via post-booking addon requests.
 *
 * Formula: totalAmount = subtotal + originalAddons + driverChargeTotal - discountAmount
 * So:      originalAddons = totalAmount - subtotal - driverChargeTotal + discountAmount
 */
function splitAddons(booking) {
  const originalAddonsTotal = Math.max(
    0,
    (booking.totalAmount    || 0)
    - (booking.subtotal        || 0)
    - (booking.driverChargeTotal || 0)
    + (booking.discountAmount  || 0),
  );
  const postBookingAddonsTotal = Math.max(0, (booking.addonsTotal || 0) - originalAddonsTotal);
  return { originalAddonsTotal, postBookingAddonsTotal };
}

function PerKmPricing({ booking, isPending }) {
  // For per-km bookings the advance is not derived from a subtotal formula,
  // so treat all addonsTotal as post-booking add-on payments.
  const postBookingAddonsTotal = booking.addonsTotal || 0;

  return (
    <div className="space-y-2">
      <Row label="Pricing Mode" value={`Per km · ₹${booking.pricePerKm?.toLocaleString('en-IN')}/km`} />
      {booking.minimumKm && <Row label="Minimum Km" value={`${booking.minimumKm} km`} muted />}
      {booking.driverChargeTotal > 0 && (
        <Row label={`Driver (${booking.driverChargePerDay?.toLocaleString('en-IN')} × ${booking.totalUnits ?? '—'} days)`} value={`₹${booking.driverChargeTotal?.toLocaleString('en-IN')}`} />
      )}
      {booking.discountAmount > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-green-600">Coupon ({booking.couponCode})</span>
          <span className="text-sm font-semibold text-green-600">−₹{booking.discountAmount?.toLocaleString('en-IN')}</span>
        </div>
      )}
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <span className="text-sm font-bold text-gray-900">
          {isPending ? 'Advance Due' : 'Advance Paid'}
        </span>
        <span className={`text-base font-black ${isPending ? 'text-amber-500' : 'text-[#84cc16]'}`}>
          ₹{booking.amountDue?.toLocaleString('en-IN')}
        </span>
      </div>
      {booking.actualKm != null && (
        <>
          <Row label={`${booking.actualKm} km travelled`} value={`₹${booking.finalRideAmount?.toLocaleString('en-IN')}`} />
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-900">Remaining Balance</span>
            <span className="text-base font-black text-orange-500">
              ₹{booking.remainingBalance?.toLocaleString('en-IN')}
            </span>
          </div>
        </>
      )}
      {booking.status === 'completed' && booking.finalRideAmount != null && (
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-sm font-bold text-gray-900">Total Paid</span>
          <span className="text-base font-black text-gray-800">
            ₹{booking.finalRideAmount?.toLocaleString('en-IN')}
          </span>
        </div>
      )}
      {!isPending && booking.actualKm == null && booking.status !== 'completed' && (
        <p className="text-xs text-gray-400 pt-1">Final amount calculated after your ride.</p>
      )}
      {postBookingAddonsTotal > 0 && (
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-sm text-violet-600">Post-booking Add-ons</span>
          <span className="text-sm font-semibold text-violet-700">
            +₹{postBookingAddonsTotal.toLocaleString('en-IN')}
          </span>
        </div>
      )}
    </div>
  );
}

function StandardPricing({ booking, isPending }) {
  const unit = booking.bookingUnit ?? 'day';
  const { originalAddonsTotal, postBookingAddonsTotal } = splitAddons(booking);
  // grossTotal is the pre-discount sum (original booking only)
  const grossTotal = (booking.subtotal ?? 0) + originalAddonsTotal;
  const balanceDue = booking.paymentType === 'deposit' ? (booking.totalAmount - booking.amountDue) : 0;

  return (
    <div className="space-y-2">
      <Row
        label={`₹${booking.pricePerUnit?.toLocaleString('en-IN')} × ${booking.totalUnits} ${unit}${booking.totalUnits !== 1 ? 's' : ''}`}
        value={`₹${booking.subtotal?.toLocaleString('en-IN')}`}
      />
      {originalAddonsTotal > 0 && (
        <Row label="Add-ons" value={`₹${originalAddonsTotal.toLocaleString('en-IN')}`} />
      )}
      {booking.driverIncluded && (
        <Row label="Driver" value="Included" muted />
      )}
      {!booking.driverIncluded && booking.driverChargeTotal > 0 && (
        <Row
          label={booking.driverChargePerDay
            ? `Driver (₹${booking.driverChargePerDay.toLocaleString('en-IN')}/day × ${booking.totalUnits} days)`
            : 'Driver Charge'}
          value={`₹${booking.driverChargeTotal.toLocaleString('en-IN')}`}
        />
      )}
      {booking.discountAmount > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-green-600">Coupon ({booking.couponCode})</span>
          <span className="text-sm font-semibold text-green-600">−₹{booking.discountAmount?.toLocaleString('en-IN')}</span>
        </div>
      )}
      {grossTotal !== booking.totalAmount && booking.discountAmount > 0 && (
        <Row label="After Discount" value={`₹${booking.totalAmount?.toLocaleString('en-IN')}`} />
      )}
      {booking.paymentType === 'deposit' && (
        <Row label="Payment Type" value="25% deposit" muted />
      )}
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <span className="text-sm font-bold text-gray-900">
          {isPending ? 'Amount Due' : 'Amount Paid'}
        </span>
        <span className={`text-base font-black ${isPending ? 'text-amber-500' : 'text-[#84cc16]'}`}>
          ₹{booking.amountDue?.toLocaleString('en-IN')}
        </span>
      </div>
      {booking.paymentType === 'deposit' && !isPending && balanceDue > 0 && (
        <p className="text-xs text-gray-400">
          ₹{balanceDue.toLocaleString('en-IN')} remaining to be paid on arrival.
        </p>
      )}
      {postBookingAddonsTotal > 0 && (
        <>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-violet-600">Post-booking Add-ons</span>
            <span className="text-sm font-semibold text-violet-700">
              +₹{postBookingAddonsTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900">Grand Total Paid</span>
            <span className="text-base font-black text-gray-800">
              ₹{((booking.amountDue || 0) + postBookingAddonsTotal).toLocaleString('en-IN')}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default function BookingPricingCard({ booking, isPending, isPerKm }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Pricing Breakdown</h3>

      {isPerKm
        ? <PerKmPricing booking={booking} isPending={isPending} />
        : <StandardPricing booking={booking} isPending={isPending} />
      }

      {/* Add-ons list (confirmed — pre and post booking) */}
      {booking.addons?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Add-ons</p>
          {booking.addons.map((a, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {a.name}
                {a.qty > 1 && <span className="text-gray-400 ml-1">× {a.qty}</span>}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                ₹{(a.price * a.qty).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Payment status */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-400">Payment Status</span>
        <PaymentStatusBadge status={booking.paymentStatus} />
      </div>
    </div>
  );
}
