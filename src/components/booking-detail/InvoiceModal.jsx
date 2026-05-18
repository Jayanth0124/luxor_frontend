'use client';

import { useState } from 'react';
import { fmtDate } from '@/utils/date';

const INR = (n) => `₹${Number(n ?? 0).toLocaleString('en-IN')}`;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export default function InvoiceModal({ booking, resource, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError]             = useState('');

  const b         = booking;
  const isVehicle = b.bookingType === 'vehicle';
  const isPerKm   = b.vehiclePricingMode === 'per_km';
  const isPaid    = b.paymentStatus === 'paid';
  const unit      = b.bookingUnit === 'hour' ? 'hr' : isVehicle ? 'day' : 'night';

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/public/bookings/${b._id}/invoice`);
      if (!res.ok) throw new Error('Failed to generate invoice');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `Invoice-${b.bookingId || b._id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not generate invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <h2 className="text-sm font-bold text-gray-900">Booking Invoice</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Invoice preview */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* Booking ref */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Booking ID</p>
              <p className="text-base font-black text-gray-900 font-mono">{b.bookingId || `#${b._id.slice(-10).toUpperCase()}`}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Issued</p>
              <p className="text-xs font-semibold text-gray-700">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Resource + guest */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-100 rounded-xl px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#84cc16] mb-1.5">
                {isVehicle ? 'Vehicle' : 'Stay'}
              </p>
              <p className="text-sm font-bold text-gray-900 leading-tight">{resource?.name ?? '—'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{[resource?.city, resource?.state].filter(Boolean).join(', ')}</p>
            </div>
            <div className="border border-gray-100 rounded-xl px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#84cc16] mb-1.5">Guest</p>
              <p className="text-sm font-bold text-gray-900">{b.guestName}</p>
              <p className="text-xs text-gray-400">{b.guestPhone}</p>
              <p className="text-xs text-gray-400 truncate">{b.guestEmail}</p>
            </div>
          </div>

          {/* Trip details */}
          <div className="border border-gray-100 rounded-xl px-4 py-3 space-y-2 text-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Trip Details</p>
            <Row label={isVehicle ? 'Pickup' : 'Check-in'} value={fmtDate(b.startDate)} />
            {isVehicle && b.pickupLocation  && <Row label="Pickup Location"  value={b.pickupLocation}  small />}
            <Row label={isVehicle ? 'Drop-off' : 'Check-out'} value={fmtDate(b.endDate)} />
            {isVehicle && b.dropoffLocation && <Row label="Drop-off Location" value={b.dropoffLocation} small />}
            <Row label="Duration" value={`${b.totalUnits} ${unit}(s)`} />
            {b.guests > 1 && <Row label="Guests" value={b.guests} />}
            {b.roomSnapshot?.category && <Row label="Room" value={b.roomSnapshot.category} />}
          </div>

          {/* Pricing */}
          <div className="border border-gray-100 rounded-xl px-4 py-3 space-y-1.5 text-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Pricing</p>
            {isPerKm ? (
              <>
                <Row label="Rate" value={`${INR(b.pricePerKm)} / km`} />
                {b.driverChargeTotal > 0 && <Row label="Driver Charge" value={INR(b.driverChargeTotal)} />}
                {b.discountAmount > 0 && <Row label={`Coupon (${b.couponCode})`} value={`−${INR(b.discountAmount)}`} green />}
                <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-gray-100 text-base">
                  <span>Advance {isPaid ? 'Paid' : 'Due'}</span>
                  <span className="text-[#84cc16]">{INR(b.kmAdvancePaid ?? b.amountDue)}</span>
                </div>
                {b.actualKm != null && (
                  <>
                    <Row label="Km Travelled" value={`${b.actualKm} km`} />
                    {b.finalRideAmount != null && <Row label="Final Ride Amount" value={INR(b.finalRideAmount)} />}
                  </>
                )}
              </>
            ) : (
              <>
                <Row label={`${INR(b.pricePerUnit)} × ${b.totalUnits} ${unit}(s)`} value={INR(b.subtotal)} />
                {b.addonsTotal > 0 && <Row label="Add-ons" value={INR(b.addonsTotal)} />}
                {b.driverChargeTotal > 0 && <Row label="Driver Charge" value={INR(b.driverChargeTotal)} />}
                {b.discountAmount > 0 && <Row label={`Coupon (${b.couponCode})`} value={`−${INR(b.discountAmount)}`} green />}
                <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-gray-100 text-base">
                  <span>{isPaid ? 'Amount Paid' : 'Amount Due'}</span>
                  <span className="text-[#84cc16]">{INR(b.amountDue)}</span>
                </div>
                {b.paymentType === 'deposit' && (
                  <p className="text-xs text-gray-400">Remaining {INR((b.totalAmount ?? 0) - (b.amountDue ?? 0))} due on arrival.</p>
                )}
              </>
            )}
          </div>

        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-2">
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#84cc16] hover:brightness-105 disabled:opacity-60 text-gray-900 font-bold text-sm py-3 rounded-xl transition-all"
            >
              {downloading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-sm py-3 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function Row({ label, value, green, small }) {
  return (
    <div className="flex justify-between">
      <span className={`${green ? 'text-green-600' : 'text-gray-400'} ${small ? 'text-xs' : ''}`}>{label}</span>
      <span className={`font-semibold ${green ? 'text-green-600' : 'text-gray-800'} text-right max-w-[55%] ${small ? 'text-xs' : ''}`}>{value}</span>
    </div>
  );
}
