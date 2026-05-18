'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBalanceOrder, verifyBalancePayment,
  resumeBookingPayment, verifyPayment,
  cancelBooking,
} from '@/services/vehicles.service';
import { loadRazorpay } from '@/utils/razorpay';
import { fmtDate } from '@/utils/date';

const STATUS_CONFIG = {
  pending:         { dot: 'bg-amber-400',  label: 'Pending',     text: 'text-amber-600'  },
  confirmed:       { dot: 'bg-[#84cc16]',  label: 'Confirmed',   text: 'text-lime-700'   },
  active:          { dot: 'bg-blue-400',   label: 'Active',      text: 'text-blue-600'   },
  completed:       { dot: 'bg-gray-300',   label: 'Completed',   text: 'text-gray-500'   },
  cancelled:       { dot: 'bg-red-400',    label: 'Cancelled',   text: 'text-red-500'    },
  pending_balance: { dot: 'bg-orange-400', label: 'Balance Due', text: 'text-orange-600' },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8081';

export default function BookingCard({ booking }) {
  const qc           = useQueryClient();
  const resource     = booking.vehicle || booking.campsite;
  const isVehicle    = booking.bookingType === 'vehicle';
  const resourcePath = isVehicle ? 'vehicles' : 'campsites';
  const cfg          = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;

  const [payStep,     setPayStep]     = useState('idle'); // idle | loading | paying
  const [payError,    setPayError]    = useState('');
  const [cancelStep,  setCancelStep]  = useState('idle'); // idle | confirm
  const [cancelError, setCancelError] = useState('');

  // ── Razorpay opener (waits for script to load first) ────────────────────────
  const openRazorpay = async (data, bookingIdOverride) => {
    setPayError('');
    try {
      await loadRazorpay(); // ensures window.Razorpay is ready
    } catch {
      setPayStep('idle');
      setPayError('Could not load payment gateway. Please check your internet connection.');
      return;
    }

    const options = {
      key:         data.keyId,
      amount:      data.amountDue * 100,
      currency:    'INR',
      name:        'Luxor',
      description: `${isVehicle ? 'Vehicle' : 'Campsite'} Booking`,
      order_id:    data.razorpayOrderId,
      prefill:     { name: booking.guestName, email: booking.guestEmail, contact: booking.guestPhone },
      theme:       { color: '#84cc16' },
      modal:       { ondismiss: () => setPayStep('idle') },
      handler: async (response) => {
        try {
          await verifyPayment({
            bookingId:         bookingIdOverride || String(booking._id),
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          qc.invalidateQueries({ queryKey: ['user-bookings'] });
          setPayStep('idle');
        } catch (err) {
          setPayStep('idle');
          setPayError(err?.response?.data?.message || 'Payment verification failed. Contact support.');
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => {
      setPayStep('idle');
      setPayError('Payment failed. Please try again.');
    });
    rzp.open();
    setPayStep('paying');
  };

  // ── Balance payment (per-km rides) ──────────────────────────────────────────
  const openBalanceRazorpay = async (data) => {
    setPayError('');
    try {
      await loadRazorpay();
    } catch {
      setPayStep('idle');
      setPayError('Could not load payment gateway.');
      return;
    }

    const options = {
      key:         data.keyId,
      amount:      data.amountDue * 100,
      currency:    'INR',
      name:        'Luxor',
      description: 'Ride Balance Payment',
      order_id:    data.razorpayOrderId,
      prefill:     { name: booking.guestName, email: booking.guestEmail, contact: booking.guestPhone },
      theme:       { color: '#84cc16' },
      modal:       { ondismiss: () => setPayStep('idle') },
      handler: async (response) => {
        try {
          await verifyBalancePayment({
            bookingId:         String(booking._id),
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          qc.invalidateQueries({ queryKey: ['user-bookings'] });
          setPayStep('idle');
        } catch {
          setPayStep('idle');
          setPayError('Balance payment verification failed.');
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => {
      setPayStep('idle');
      setPayError('Payment failed. Try again.');
    });
    rzp.open();
    setPayStep('paying');
  };

  // ── Mutations ────────────────────────────────────────────────────────────────
  const balanceMutation = useMutation({
    mutationFn: () => createBalanceOrder(booking._id),
    onSuccess: (data) => openBalanceRazorpay(data),
    onError: (err) => {
      setPayStep('idle');
      setPayError(err?.response?.data?.message || 'Could not create balance order.');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => resumeBookingPayment(String(booking._id), booking.guestEmail),
    onSuccess: (data) => openRazorpay(data, String(data.booking._id)),
    onError: (err) => {
      setPayStep('idle');
      setPayError(err?.response?.data?.message || 'Could not resume payment.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(String(booking._id), 'Cancelled by user from profile'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-bookings'] });
      setCancelStep('idle');
    },
    onError: (err) => {
      setCancelError(err?.response?.data?.message || 'Could not cancel booking.');
      setCancelStep('confirm');
    },
  });

  // ── Eligibility ──────────────────────────────────────────────────────────────
  const twoDaysFromNow  = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const canCancel       = ['pending', 'confirmed'].includes(booking.status) &&
                          new Date(booking.startDate) > twoDaysFromNow;
  const isPending       = booking.status === 'pending';

  // ── Refund estimate (mirrors backend policy) ─────────────────────────────────
  const isPerKm      = booking.vehiclePricingMode === 'per_km';
  const wasPaid      = booking.paymentStatus === 'paid';
  const paidAmount   = isPerKm ? (booking.kmAdvancePaid ?? 0) : (booking.amountDue ?? 0);
  const msToStart    = new Date(booking.startDate) - Date.now();
  const daysToStart  = msToStart / (1000 * 60 * 60 * 24);
  const refundEst    = !wasPaid ? 0
                     : daysToStart > 7  ? paidAmount
                     : daysToStart > 3  ? Math.floor(paidAmount * 0.5)
                     : 0;
  const isBalanceDue    = booking.status === 'pending_balance' && isPerKm;
  const isBusy          = payStep !== 'idle' || resumeMutation.isPending || balanceMutation.isPending;

  const imgSrc = resource?.images?.[0]?.url
    ? (resource.images[0].url.startsWith('http') ? resource.images[0].url : `${API_BASE}${resource.images[0].url}`)
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 sm:p-5">

        {/* Pending payment banner */}
        {isPending && (
          <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-amber-800">Payment incomplete</p>
              <p className="text-xs text-amber-600 mt-0.5">Slot held for 30 min — complete payment to confirm.</p>
            </div>
            <button
              onClick={() => { setPayStep('loading'); resumeMutation.mutate(); }}
              disabled={isBusy}
              className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {payStep === 'loading' || resumeMutation.isPending ? 'Loading…' :
               payStep === 'paying' ? 'Opening…' :
               `Pay ₹${Number(booking.amountDue).toLocaleString('en-IN')}`}
            </button>
          </div>
        )}

        {/* Per-km balance due banner */}
        {isBalanceDue && (
          <div className="mb-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-orange-800">Balance payment required</p>
                <div className="mt-1.5 text-xs text-orange-700 space-y-1">
                  <div className="flex justify-between gap-6">
                    <span>Advance paid</span>
                    <span className="font-medium">₹{Number(booking.kmAdvancePaid).toLocaleString('en-IN')}</span>
                  </div>
                  {booking.actualKm != null && (
                    <div className="flex justify-between gap-6">
                      <span>{booking.actualKm} km × ₹{booking.pricePerKm}/km</span>
                      <span className="font-medium">₹{Number(booking.finalRideAmount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-6 pt-1 border-t border-orange-200">
                    <span className="font-semibold text-orange-900">Balance due</span>
                    <span className="font-black text-orange-900">₹{Number(booking.remainingBalance).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setPayStep('loading'); balanceMutation.mutate(); }}
                disabled={isBusy}
                className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer mt-0.5"
              >
                {payStep === 'loading' || balanceMutation.isPending ? 'Loading…' :
                 payStep === 'paying' ? 'Opening…' :
                 `Pay ₹${Number(booking.remainingBalance).toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        )}

        {payError && (
          <p className="text-xs text-red-500 mb-2 px-1">{payError}</p>
        )}

        <div className="flex gap-4">
          {/* Image */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            {imgSrc ? (
              <img src={imgSrc} alt={resource?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{booking.bookingId || `#${booking._id.slice(-8).toUpperCase()}`}</p>
                <h3 className="text-sm font-semibold text-gray-900 leading-tight truncate">{resource?.name ?? 'Unknown'}</h3>
                {!isVehicle && booking.roomSnapshot?.category && (
                  <p className="text-xs font-medium mt-0.5" style={{ color: '#84cc16' }}>
                    {booking.roomSnapshot.category}
                    {booking.roomSnapshot.capacity ? ` · up to ${booking.roomSnapshot.capacity} guests` : ''}
                  </p>
                )}
                {(resource?.city || resource?.state) && (
                  <p className="text-xs text-gray-400 mt-0.5">{[resource.city, resource.state].filter(Boolean).join(', ')}</p>
                )}
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              <span>
                <span className="text-gray-400">{isVehicle ? 'Pickup' : 'Check-in'}: </span>
                {fmtDate(booking.startDate)}
              </span>
              <span>
                <span className="text-gray-400">{isVehicle ? 'Drop-off' : 'Check-out'}: </span>
                {fmtDate(booking.endDate)}
              </span>
            </div>
            {isVehicle && (booking.pickupLocation || booking.dropoffLocation) && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
                <svg className="w-3 h-3 shrink-0 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {booking.pickupLocation && <span className="truncate max-w-[160px]">{booking.pickupLocation}</span>}
                {booking.pickupLocation && booking.dropoffLocation && <span>→</span>}
                {booking.dropoffLocation && <span className="truncate max-w-[160px]">{booking.dropoffLocation}</span>}
              </div>
            )}
            {booking.couponCode && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full tracking-wide">
                  {booking.couponCode}
                </span>
                <span className="text-xs text-green-600 font-medium">−₹{Number(booking.discountAmount).toLocaleString('en-IN')} saved</span>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="hidden sm:block text-right shrink-0">
            {isPerKm ? (
              isBalanceDue ? (
                <>
                  <p className="text-xs font-medium text-orange-500">Balance Due</p>
                  <p className="text-base font-semibold text-orange-700">₹{Number(booking.remainingBalance).toLocaleString('en-IN')}</p>
                </>
              ) : booking.status === 'completed' && booking.finalRideAmount != null ? (
                <>
                  <p className="text-xs text-gray-400">Ride Total</p>
                  <p className="text-base font-semibold text-gray-900">₹{Number(booking.finalRideAmount).toLocaleString('en-IN')}</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-400">Advance</p>
                  <p className={`text-base font-semibold ${isPending ? 'text-amber-600' : 'text-gray-900'}`}>₹{Number(booking.kmAdvancePaid ?? booking.amountDue).toLocaleString('en-IN')}</p>
                </>
              )
            ) : (
              <>
                <p className="text-xs text-gray-400">{isPending ? 'Due' : 'Paid'}</p>
                <p className={`text-base font-semibold ${isPending ? 'text-amber-600' : 'text-gray-900'}`}>₹{Number(booking.amountDue).toLocaleString('en-IN')}</p>
              </>
            )}
          </div>
        </div>

        {/* Amount mobile */}
        <div className="flex sm:hidden items-center justify-between mt-3 pt-3 border-t border-gray-100 text-sm">
          {isPerKm ? (
            isBalanceDue ? (
              <>
                <span className="text-orange-500 font-medium">Balance due</span>
                <span className="font-semibold text-orange-700">₹{Number(booking.remainingBalance).toLocaleString('en-IN')}</span>
              </>
            ) : booking.status === 'completed' && booking.finalRideAmount != null ? (
              <>
                <span className="text-gray-400">Ride total</span>
                <span className="font-semibold text-gray-900">₹{Number(booking.finalRideAmount).toLocaleString('en-IN')}</span>
              </>
            ) : (
              <>
                <span className="text-gray-400">Advance {isPending ? 'due' : 'paid'}</span>
                <span className={`font-semibold ${isPending ? 'text-amber-600' : 'text-gray-900'}`}>₹{Number(booking.kmAdvancePaid ?? booking.amountDue).toLocaleString('en-IN')}</span>
              </>
            )
          ) : (
            <>
              <span className="text-gray-400">{isPending ? 'Amount due' : 'Amount paid'}</span>
              <span className={`font-semibold ${isPending ? 'text-amber-600' : 'text-gray-900'}`}>₹{Number(booking.amountDue).toLocaleString('en-IN')}</span>
            </>
          )}
        </div>

        {/* Inline cancel confirm */}
        {cancelStep === 'confirm' && (
          <div className="mt-3 pt-3 border-t border-gray-100 bg-red-50 rounded-lg px-3 py-2.5 space-y-2">
            <p className="text-xs font-semibold text-red-700">Cancel this booking?</p>
            {wasPaid && (
              <div className="bg-white border border-red-100 rounded-lg px-3 py-2 text-xs space-y-1">
                <div className="flex justify-between text-gray-500">
                  <span>Amount paid</span>
                  <span className="font-medium text-gray-700">₹{paidAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Cancellation policy</span>
                  <span className="font-medium text-gray-700">
                    {daysToStart > 7 ? 'Full refund' : daysToStart > 3 ? '50% refund' : 'No refund'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-1">
                  <span className={`font-semibold ${refundEst > 0 ? 'text-green-700' : 'text-red-600'}`}>Estimated refund</span>
                  <span className={`font-bold ${refundEst > 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {refundEst > 0 ? `₹${refundEst.toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>
                {refundEst > 0 && (
                  <p className="text-[10px] text-gray-400">Refund will be processed to your original payment method within 5–7 business days.</p>
                )}
              </div>
            )}
            {!wasPaid && (
              <p className="text-xs text-gray-500">Your booking slot will be released immediately.</p>
            )}
            {cancelError && <p className="text-xs text-red-500">{cancelError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setCancelError(''); setCancelStep('idle'); }}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg border border-gray-200 bg-white transition-colors"
              >
                Keep it
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Cancel */}
            {canCancel && cancelStep === 'idle' && (
              <button
                onClick={() => setCancelStep('confirm')}
                className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link href={`/bookings/${booking._id}`}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              View details
            </Link>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('luxor:open-support', {
                detail: { bookingId: booking._id, bookingDisplayId: booking.bookingId, resourceName: resource?.name || 'Booking' }
              }))}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              Get help
            </button>
            {resource?.slug && (
              <Link href={`/${resourcePath}/${resource.slug}`}
                className="text-xs font-medium transition-colors"
                style={{ color: '#84cc16' }}>
                View listing →
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
