'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookingById, cancelBooking, resumeBookingPayment, verifyPayment } from '@/services/vehicles.service';
import { loadRazorpay } from '@/utils/razorpay';
import { fmtDate } from '@/utils/date';
import InvoiceModal from '@/components/booking-detail/InvoiceModal';

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const qc = useQueryClient();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason]       = useState('');
  const [cancelError, setCancelError]         = useState('');
  const [payError, setPayError]               = useState('');
  const [payStep, setPayStep]                 = useState('idle'); // idle | loading | paying
  const [showInvoice, setShowInvoice]         = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn:  () => getBookingById(id),
    enabled:  Boolean(id),
  });

  const cancelMut = useMutation({
    mutationFn: () => cancelBooking(id, cancelReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] });
      setShowCancelModal(false);
      setCancelReason('');
      setCancelError('');
    },
    onError: (err) => setCancelError(err.response?.data?.message || 'Failed to cancel booking.'),
  });

  const openRazorpay = async (data) => {
    setPayError('');
    try {
      await loadRazorpay();
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
      description: `${booking.bookingType === 'vehicle' ? 'Vehicle' : 'Campsite'} Booking`,
      order_id:    data.razorpayOrderId,
      prefill:     { name: booking?.guestName, email: booking?.guestEmail, contact: booking?.guestPhone },
      theme:       { color: '#84cc16' },
      modal:       { ondismiss: () => setPayStep('idle') },
      handler: async (response) => {
        try {
          await verifyPayment({
            bookingId:         String(data.booking._id),
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          qc.invalidateQueries({ queryKey: ['booking', id] });
          setPayStep('idle');
        } catch {
          setPayStep('idle');
          setPayError('Payment verification failed. Please contact support.');
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

  const resumeMut = useMutation({
    mutationFn: () => resumeBookingPayment(id, booking?.guestEmail),
    onSuccess: (data) => openRazorpay(data),
    onError: (err) => {
      setPayStep('idle');
      setPayError(err.response?.data?.message || 'Could not resume payment. Please try again.');
    },
  });

  const handleCompletePayment = () => {
    setPayError('');
    setPayStep('loading');
    resumeMut.mutate();
  };

  const fmt = fmtDate;

  if (isLoading) return (
    <div className="bg-white min-h-screen pt-16 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="bg-white min-h-screen pt-16 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Booking not found.</p>
    </div>
  );

  const resource = booking.vehicle || booking.campsite;

  const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const canUserCancel  = ['pending', 'confirmed'].includes(booking.status) &&
                         new Date(booking.startDate) > twoDaysFromNow;
  const isPending      = booking.status === 'pending';

  return (
    <div className="bg-white min-h-screen pt-16">
      <div className="max-w-xl mx-auto px-4 pt-12 pb-20">

        {/* Header icon + title */}
        <div className="text-center mb-8">
          {booking.status === 'cancelled' ? (
            <>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">Booking Cancelled</h1>
              <p className="text-gray-400 text-sm">This booking has been cancelled.</p>
            </>
          ) : isPending ? (
            <>
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Pending</h1>
              <p className="text-gray-400 text-sm">Your booking is reserved — complete payment to confirm.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-[#84cc16]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-400 text-sm">Your booking has been placed successfully.</p>
            </>
          )}
        </div>

        {/* Pending payment banner */}
        {isPending && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 flex items-start gap-3">
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
                onClick={handleCompletePayment}
                disabled={payStep !== 'idle'}
                className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {payStep === 'loading' ? 'Loading…' : payStep === 'paying' ? 'Opening payment…' : `Complete Payment · ₹${booking.amountDue?.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Booking ID</p>
            <p className="text-xs font-mono font-bold text-gray-700">{booking.bookingId || `#${booking._id.slice(-8).toUpperCase()}`}</p>
          </div>

          {resource && (
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs text-[#84cc16] font-bold uppercase tracking-wide mb-1">
                {booking.bookingType === 'vehicle' ? 'Vehicle' : 'Campsite'}
              </p>
              <p className="text-lg font-black text-gray-900">{resource.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{[resource.city, resource.state].filter(Boolean).join(', ')}</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-5 space-y-2.5 text-sm">
            {[
              { label: booking.bookingType === 'vehicle' ? 'Pickup'   : 'Check-in',  value: fmt(booking.startDate) },
              booking.bookingType === 'vehicle' && booking.pickupLocation  ? { label: 'Pickup Location',  value: booking.pickupLocation  } : null,
              { label: booking.bookingType === 'vehicle' ? 'Drop-off' : 'Check-out', value: fmt(booking.endDate)   },
              booking.bookingType === 'vehicle' && booking.dropoffLocation ? { label: 'Drop-off Location', value: booking.dropoffLocation } : null,
              { label: 'Duration', value: `${booking.totalUnits} ${booking.bookingType === 'vehicle' ? 'day' : 'night'}${booking.totalUnits !== 1 ? 's' : ''}` },
              { label: 'Guest',    value: booking.guestName  },
              { label: 'Phone',    value: booking.guestPhone },
              { label: 'Email',    value: booking.guestEmail },
            ].filter(Boolean).map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400">{label}</span>
                <span className="font-semibold text-gray-800 text-right max-w-[60%] break-words">{value}</span>
              </div>
            ))}
          </div>

          {booking.status === 'cancelled' && booking.cancellationReason && (
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs text-gray-400 mb-1">Cancellation Reason</p>
              <p className="text-sm text-gray-700">{booking.cancellationReason}</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-5 space-y-2 text-sm">
            {booking.vehiclePricingMode === 'per_km' ? (
              <>
                <div className="flex justify-between text-gray-500">
                  <span>Pricing Mode</span>
                  <span className="font-semibold text-gray-800">Per Km · ₹{booking.pricePerKm?.toLocaleString('en-IN')}/km</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Coupon ({booking.couponCode})</span>
                    <span>−₹{booking.discountAmount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-gray-900 text-base">
                  <span>{isPending ? 'Advance Due' : 'Advance Paid'}</span>
                  <span className="text-[#84cc16]">₹{booking.amountDue?.toLocaleString('en-IN')}</span>
                </div>
                {booking.actualKm != null ? (
                  <>
                    <div className="flex justify-between text-gray-500">
                      <span>Km Travelled</span>
                      <span className="font-semibold text-gray-800">{booking.actualKm} km</span>
                    </div>
                    <div className="flex justify-between font-black text-gray-900 text-base border-t border-gray-100 pt-2">
                      <span>Remaining Balance</span>
                      <span className="text-orange-500">₹{booking.remainingBalance?.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : !isPending && (
                  <p className="text-xs text-gray-400">Final amount calculated after your ride.</p>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{((booking.subtotal ?? 0) + (booking.addonsTotal ?? 0)).toLocaleString('en-IN')}</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Coupon ({booking.couponCode})</span>
                    <span>−₹{booking.discountAmount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>After Discount</span>
                    <span>₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-gray-900 text-base">
                  <span>{isPending ? 'Amount Due' : 'Amount Paid'}</span>
                  <span className={isPending ? 'text-amber-500' : 'text-[#84cc16]'}>
                    ₹{booking.amountDue?.toLocaleString('en-IN')}
                  </span>
                </div>
                {booking.paymentType === 'deposit' && !isPending && (
                  <p className="text-xs text-gray-400">Remaining ₹{(booking.totalAmount - booking.amountDue)?.toLocaleString('en-IN')} to be paid on arrival.</p>
                )}
              </>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-3">
            {/* Invoice button */}
            <button
              onClick={() => setShowInvoice(true)}
              className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-sm py-3 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              View / Print Invoice
            </button>
            <div className="flex gap-3">
              <a href="/" className="flex-1 text-center bg-[#84cc16] hover:bg-lime-400 text-gray-900 font-bold text-sm py-3 rounded-xl transition-colors">
                Back to Home
              </a>
              <a href={`/${booking.bookingType}s`} className="flex-1 text-center border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-sm py-3 rounded-xl transition-colors">
                Browse More
              </a>
            </div>
          </div>

          {canUserCancel && !isPending && (
            <button
              onClick={() => { setCancelError(''); setShowCancelModal(true); }}
              className="w-full text-center text-xs text-red-400 hover:text-red-600 font-semibold py-2 transition-colors cursor-pointer"
            >
              Cancel this booking
            </button>
          )}

          {!canUserCancel && booking.status !== 'cancelled' && !isPending && ['confirmed'].includes(booking.status) && (
            <p className="text-center text-xs text-gray-400 py-1">
              Cancellations are only allowed more than 2 days before the start date.
            </p>
          )}

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('luxor:open-support', {
              detail: { bookingId: booking._id, bookingDisplayId: booking.bookingId, resourceName: resource?.name || 'Booking' }
            }))}
            className="w-full text-center text-xs text-gray-400 hover:text-[#84cc16] font-semibold py-2 transition-colors cursor-pointer"
          >
            Need help with this booking?
          </button>
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal booking={booking} resource={resource} onClose={() => setShowInvoice(false)} />
      )}

      {showCancelModal && (
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
              <button onClick={() => setShowCancelModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Keep Booking
              </button>
              <button onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {cancelMut.isPending ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
