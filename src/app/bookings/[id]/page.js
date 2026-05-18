'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBookingById, cancelBooking, resumeBookingPayment, verifyPayment,
  createBalanceOrder, verifyBalancePayment,
} from '@/services/vehicles.service';
import BookingAddonCard from '@/components/booking-detail/BookingAddonCard';
import { loadRazorpay } from '@/utils/razorpay';

import BookingStatusHeader, { STATUS_CONFIG } from '@/components/booking-detail/BookingStatusHeader';
import BookingPaymentBanner                   from '@/components/booking-detail/BookingPaymentBanner';
import BookingBalanceBanner                   from '@/components/booking-detail/BookingBalanceBanner';
import BookingResourceCard                    from '@/components/booking-detail/BookingResourceCard';
import BookingDetailsCard                     from '@/components/booking-detail/BookingDetailsCard';
import BookingGuestCard                       from '@/components/booking-detail/BookingGuestCard';
import BookingPricingCard                     from '@/components/booking-detail/BookingPricingCard';
import BookingCancelledCard                   from '@/components/booking-detail/BookingCancelledCard';
import BookingActionsCard                     from '@/components/booking-detail/BookingActionsCard';
import BookingCancelModal                     from '@/components/booking-detail/BookingCancelModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8081';

export default function BookingDetailPage() {
  const { id } = useParams();
  const qc     = useQueryClient();

  const [payStep,      setPayStep]      = useState('idle'); // idle | loading | paying
  const [payError,     setPayError]     = useState('');
  const [showCancel,   setShowCancel]   = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError,  setCancelError]  = useState('');

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn:  () => getBookingById(id),
    enabled:  Boolean(id),
  });

  // ── Razorpay helpers ────────────────────────────────────────────────────────
  const openRazorpay = async (data, bookingIdOverride) => {
    setPayError('');
    try { await loadRazorpay(); } catch {
      setPayStep('idle');
      setPayError('Could not load payment gateway. Check your connection.');
      return;
    }
    const options = {
      key:         data.keyId,
      amount:      data.amountDue * 100,
      currency:    'INR',
      name:        'Luxor',
      description: `${booking.bookingType === 'vehicle' ? 'Vehicle' : 'Campsite'} Booking`,
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
          qc.invalidateQueries({ queryKey: ['booking', id] });
          setPayStep('idle');
        } catch {
          setPayStep('idle');
          setPayError('Payment verification failed. Please contact support.');
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => { setPayStep('idle'); setPayError('Payment failed. Try again.'); });
    rzp.open();
    setPayStep('paying');
  };

  const openBalanceRazorpay = async (data) => {
    setPayError('');
    try { await loadRazorpay(); } catch {
      setPayStep('idle'); setPayError('Could not load payment gateway.'); return;
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
          qc.invalidateQueries({ queryKey: ['booking', id] });
          setPayStep('idle');
        } catch {
          setPayStep('idle'); setPayError('Balance payment verification failed.');
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => { setPayStep('idle'); setPayError('Payment failed. Try again.'); });
    rzp.open();
    setPayStep('paying');
  };

  // ── Mutations ───────────────────────────────────────────────────────────────
  const resumeMut = useMutation({
    mutationFn: () => resumeBookingPayment(id, booking?.guestEmail),
    onSuccess:  (data) => openRazorpay(data, String(data.booking._id)),
    onError:    (err)  => { setPayStep('idle'); setPayError(err?.response?.data?.message || 'Could not resume payment.'); },
  });

  const balanceMut = useMutation({
    mutationFn: () => createBalanceOrder(booking._id),
    onSuccess:  (data) => openBalanceRazorpay(data),
    onError:    (err)  => { setPayStep('idle'); setPayError(err?.response?.data?.message || 'Could not create balance order.'); },
  });

  const cancelMut = useMutation({
    mutationFn: () => cancelBooking(id, cancelReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] });
      setShowCancel(false); setCancelReason(''); setCancelError('');
    },
    onError: (err) => setCancelError(err?.response?.data?.message || 'Failed to cancel booking.'),
  });

  // ── Loading / not found ─────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="bg-gray-50 min-h-screen pt-16 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="bg-gray-50 min-h-screen pt-16 flex flex-col items-center justify-center gap-4">
      <p className="text-gray-400 text-sm">Booking not found.</p>
      <Link href="/bookings" className="text-sm font-medium" style={{ color: '#84cc16' }}>
        ← My Bookings
      </Link>
    </div>
  );

  // ── Derived values ──────────────────────────────────────────────────────────
  const resource     = booking.vehicle || booking.campsite;
  const isVehicle    = booking.bookingType === 'vehicle';
  const isPerKm      = booking.vehiclePricingMode === 'per_km';
  const isPending    = booking.status === 'pending';
  const isBalanceDue = booking.status === 'pending_balance';
  const isCancelled  = booking.status === 'cancelled';
  const isBusy       = payStep !== 'idle' || resumeMut.isPending || balanceMut.isPending;
  const resourcePath = isVehicle ? 'vehicles' : 'campsites';

  const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const canCancel      = booking.status === 'confirmed' && new Date(booking.startDate) > twoDaysFromNow;

  const cfg    = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.confirmed;
  const imgSrc = resource?.images?.[0]?.url
    ? (resource.images[0].url.startsWith('http')
        ? resource.images[0].url
        : `${API_BASE}${resource.images[0].url}`)
    : null;

  const handleOpenSupport = () =>
    window.dispatchEvent(new CustomEvent('luxor:open-support', {
      detail: { bookingId: booking._id, bookingDisplayId: booking.bookingId, resourceName: resource?.name || 'Booking' },
    }));

  return (
    <div className="bg-gray-50 min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-24">

        {/* Back */}
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          My Bookings
        </Link>

        <BookingStatusHeader booking={booking} cfg={cfg} />

        {isPending && (
          <BookingPaymentBanner
            booking={booking}
            payStep={payStep}
            payError={payError}
            isBusy={isBusy}
            onPay={() => { setPayStep('loading'); resumeMut.mutate(); }}
          />
        )}

        {isBalanceDue && isPerKm && (
          <BookingBalanceBanner
            booking={booking}
            payStep={payStep}
            payError={payError}
            isBusy={isBusy}
            onPay={() => { setPayStep('loading'); balanceMut.mutate(); }}
          />
        )}

        {payError && !isPending && !isBalanceDue && (
          <p className="text-xs text-red-500 mb-3 px-1">{payError}</p>
        )}

        <div className="space-y-3">
          <BookingResourceCard
            resource={resource}
            isVehicle={isVehicle}
            resourcePath={resourcePath}
            imgSrc={imgSrc}
          />

          <BookingDetailsCard booking={booking} isVehicle={isVehicle} />

          <BookingGuestCard booking={booking} />

          <BookingPricingCard booking={booking} isPending={isPending} isPerKm={isPerKm} />

          <BookingAddonCard booking={booking} />

          {isCancelled && <BookingCancelledCard booking={booking} />}

          <BookingActionsCard
            booking={booking}
            resource={resource}
            resourcePath={resourcePath}
            canCancel={canCancel}
            isCancelled={isCancelled}
            onOpenSupport={handleOpenSupport}
            onCancelClick={() => { setCancelError(''); setShowCancel(true); }}
          />
        </div>

      </div>

      {showCancel && (
        <BookingCancelModal
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          cancelError={cancelError}
          isPending={cancelMut.isPending}
          onConfirm={() => cancelMut.mutate()}
          onClose={() => setShowCancel(false)}
        />
      )}
    </div>
  );
}
