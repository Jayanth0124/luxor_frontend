'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/authSlice';
import { getVehicleBySlug } from '@/services/vehicles.service';
import { getCampsiteBySlug } from '@/services/campsites.service';
import { createBooking, verifyPayment } from '@/services/vehicles.service';
import api from '@/lib/api';
import { fmtDate, fmtDatetime } from '@/utils/date';
import PlaceAutocompleteInput from '@/components/PlaceAutocompleteInput';

const fetchAddons = async (refType, refId) => {
  const { data } = await api.get('/public/addons', { params: { refType, refId } });
  return data.data ?? [];
};

export default function CheckoutContent() {
  const sp     = useSearchParams();
  const router = useRouter();
  const user   = useSelector(selectUser);

  const type        = sp.get('type');
  const slug        = sp.get('slug');
  const id          = sp.get('id');
  const start       = sp.get('start');
  const end         = sp.get('end');
  const roomId          = sp.get('roomId');
  const guests          = parseInt(sp.get('guests') || '1', 10);
  const bookingUnit     = sp.get('bookingUnit') || 'day';
  const urlPickupLoc    = sp.get('pickupLocation') || '';
  const urlDropoffLoc   = sp.get('dropoffLocation') || '';
  const isHourly    = bookingUnit === 'hour';

  const [form, setForm] = useState({
    guestName:       user?.name   || '',
    guestEmail:      user?.email  || '',
    guestPhone:      user?.mobile || '',
    specialRequests: '',
    paymentType:     'full',
    pickupLocation:  urlPickupLoc,
    dropoffLocation: urlDropoffLoc,
  });
  const [errors,      setErrors]      = useState({});
  const [step,        setStep]        = useState('details');
  const [addonQty,    setAddonQty]    = useState({});
  const [couponInput, setCouponInput] = useState('');
  const [coupon,      setCoupon]      = useState(null);
  const [couponError, setCouponError] = useState('');

  const { data: resource } = useQuery({
    queryKey: ['checkout-resource', type, slug],
    queryFn: () => type === 'vehicle' ? getVehicleBySlug(slug) : getCampsiteBySlug(slug),
    enabled: Boolean(type && slug),
  });

  const refType = type === 'vehicle' ? 'vehicle' : 'campsite';
  const { data: availableAddons = [] } = useQuery({
    queryKey: ['checkout-addons', refType, id],
    queryFn: () => fetchAddons(refType, id),
    enabled: Boolean(id && type),
  });

  const dateOnly = (s) => s ? s.split('T')[0] : s;
  const totalUnits = start && end
    ? isHourly
      ? Math.max(0, Math.round((new Date(end)           - new Date(start))           / 3600000))
      : Math.max(0, Math.round((new Date(dateOnly(end)) - new Date(dateOnly(start))) / 86400000))
    : 0;

  const minimumHours = isHourly ? (resource?.pricing?.minimumHours ?? 1) : 0;
  const minimumDays  = (!isHourly && type === 'vehicle') ? (resource?.hasMinimumDays ? (resource?.minimumDays ?? 1) : 1) : 1;
  const belowMinimum = isHourly
    ? (totalUnits > 0 && totalUnits < minimumHours)
    : (type === 'vehicle' && totalUnits > 0 && totalUnits < minimumDays);

  let pricePerUnit = 0;
  let isPerKm = false;
  let kmAdvanceAmount = 0;
  if (resource) {
    if (type === 'vehicle') {
      if (isHourly) {
        pricePerUnit = resource.pricing?.pricePerHour ?? 0;
      } else if (resource.pricing?.type === 'per_km') {
        isPerKm = true;
        kmAdvanceAmount = resource.pricing.kmAdvanceAmount ?? 0;
        pricePerUnit = resource.pricing.pricePerKm ?? 0;
      } else {
        pricePerUnit = resource.pricing?.commonPrice ?? 0;
      }
    } else {
      const room = roomId
        ? resource.rooms?.find((r) => r._id === roomId)
        : resource.rooms?.[0];
      pricePerUnit = room?.price ?? 0;
    }
  }

  const subtotal           = isPerKm ? 0 : pricePerUnit * totalUnits;
  const addonsTotal        = availableAddons.reduce((sum, a) => sum + (a.price * (addonQty[a._id] || 0)), 0);
  const driverChargePerDay = type === 'vehicle' && !resource?.driverIncluded ? (resource?.driverChargePerDay ?? 0) : 0;
  const driverChargeTotal  = driverChargePerDay && totalUnits > 0 ? driverChargePerDay * totalUnits : 0;
  const couponBase  = isPerKm ? (kmAdvanceAmount + driverChargeTotal) : (subtotal + addonsTotal + driverChargeTotal);
  const grossTotal  = couponBase;
  const discountAmt = coupon?.discountAmount ?? 0;
  const grandTotal  = Math.max(0, grossTotal - discountAmt);
  const amountFull  = grandTotal;
  const amountDep   = Math.ceil(grandTotal * 0.25);
  const amountDue   = isPerKm ? grandTotal : (form.paymentType === 'deposit' ? amountDep : amountFull);

  const fmt = (d) => isHourly ? fmtDatetime(d) : fmtDate(d);

  const selectedAddons = availableAddons
    .filter((a) => (addonQty[a._id] || 0) > 0)
    .map((a) => ({ addonId: a._id, name: a.name, price: a.price, qty: addonQty[a._id] }));

  const [resumed, setResumed] = useState(false);

  const partnerId = resource?.partner?._id ?? resource?.partner ?? null;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError(''); setCoupon(null);
    try {
      const { data } = await api.post('/public/coupons/validate', {
        code:          couponInput.trim().toUpperCase(),
        bookingAmount: couponBase,
        bookingType:   type,
        guestEmail:    form.guestEmail || undefined,
        partnerId:     partnerId || undefined,
      });
      setCoupon(data.data);
    } catch (err) {
      setCouponError(err?.response?.data?.message || 'Invalid coupon code.');
    }
  };

  const removeCoupon = () => { setCoupon(null); setCouponInput(''); setCouponError(''); };

  const bookMutation = useMutation({
    mutationFn: () => createBooking({
      bookingType: type,
      ...(type === 'vehicle' ? { vehicleSlug: slug } : { campsiteSlug: slug }),
      roomId: roomId || undefined,
      startDate: start, endDate: end,
      bookingUnit,
      guestName: form.guestName, guestEmail: form.guestEmail, guestPhone: form.guestPhone,
      guests, paymentType: form.paymentType, specialRequests: form.specialRequests,
      ...(type === 'vehicle' && { pickupLocation: form.pickupLocation, dropoffLocation: form.dropoffLocation }),
      addons: selectedAddons,
      ...(coupon && { couponCode: coupon.code ?? couponInput.trim().toUpperCase() }),
    }),
    onSuccess: (data) => {
      if (data.resumed) setResumed(true);
      if (data.razorpayOrderId) {
        openRazorpay(data);
      } else {
        router.push(`/booking-confirmation/${data.booking._id}`);
      }
    },
  });

  const openRazorpay = (data) => {
    setStep('paying');
    const options = {
      key:         data.keyId,
      amount:      data.amountDue * 100,
      currency:    'INR',
      name:        'Luxor',
      description: `${type === 'vehicle' ? 'Vehicle' : 'Campsite'} Booking`,
      order_id:    data.razorpayOrderId,
      handler: async (response) => {
        try {
          await verifyPayment({
            bookingId: data.booking._id,
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          router.push(`/booking-confirmation/${data.booking._id}`);
        } catch {
          setStep('details');
          setErrors({ api: 'Payment verification failed. Please contact support.' });
        }
      },
      prefill: { name: form.guestName, email: form.guestEmail, contact: form.guestPhone },
      theme: { color: '#84cc16' },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
    rzp.on('payment.failed', () => { setStep('details'); setErrors({ api: 'Payment failed. Please try again.' }); });
  };

  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.head.appendChild(s);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.guestName.trim())  e.guestName  = 'Name is required';
    if (!form.guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) e.guestEmail = 'Valid email required';
    if (!form.guestPhone.trim() || !/^\d{10}$/.test(form.guestPhone.replace(/\s/g, ''))) e.guestPhone = '10-digit phone required';
    if (type === 'vehicle') {
      if (!form.pickupLocation.trim())  e.pickupLocation  = 'Pickup location is required';
      if (!form.dropoffLocation.trim()) e.dropoffLocation = 'Drop-off location is required';
    }
    if (belowMinimum) {
      e.api = isHourly
        ? `Minimum ${minimumHours} hour${minimumHours !== 1 ? 's' : ''} required for this vehicle.`
        : `Minimum ${minimumDays} day${minimumDays !== 1 ? 's' : ''} required for this vehicle.`;
    }
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    bookMutation.mutate();
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const inputCls = (k) => `w-full border ${errors[k] ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#84cc16] transition-colors`;

  const changeQty = (addonId, delta) => {
    setAddonQty((prev) => {
      const next = (prev[addonId] || 0) + delta;
      if (next <= 0) { const { [addonId]: _, ...rest } = prev; return rest; }
      return { ...prev, [addonId]: next };
    });
  };

  if (!resource) return (
    <div className="bg-white min-h-screen pt-16 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white min-h-screen pt-16">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 md:px-12 pt-8 pb-14">

        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <a href="/" className="hover:text-[#84cc16]">Home</a>
          <span>/</span>
          <a href={`/${type}s`} className="hover:text-[#84cc16] capitalize">{type}s</a>
          <span>/</span>
          <a href={`/${type}s/${slug}`} className="hover:text-[#84cc16]">{resource.name}</a>
          <span>/</span>
          <span className="text-gray-700 font-semibold">Checkout</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          <div className="space-y-6">
            <h1 className="text-2xl font-black text-gray-900">Complete your booking</h1>

            {resumed && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Incomplete payment found</p>
                  <p className="text-xs text-amber-700 mt-0.5">You already started a booking for these dates. We've resumed it — complete your payment to confirm.</p>
                </div>
              </div>
            )}

            {errors.api && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{errors.api}</div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-black text-gray-900">Guest Details</h2>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Full Name *</label>
                <input value={form.guestName} onChange={set('guestName')} placeholder="John Doe" className={inputCls('guestName')} />
                {errors.guestName && <p className="text-xs text-red-500 mt-1">{errors.guestName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Email *</label>
                  <input type="email" value={form.guestEmail} onChange={set('guestEmail')} placeholder="john@email.com" className={inputCls('guestEmail')} />
                  {errors.guestEmail && <p className="text-xs text-red-500 mt-1">{errors.guestEmail}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Phone *</label>
                  <input type="tel" value={form.guestPhone} onChange={set('guestPhone')} placeholder="9876543210" className={inputCls('guestPhone')} />
                  {errors.guestPhone && <p className="text-xs text-red-500 mt-1">{errors.guestPhone}</p>}
                </div>
              </div>
              {type === 'vehicle' && (
                <div className="grid grid-cols-2 gap-4">
                  <PlaceAutocompleteInput
                    label="Pickup Location" required
                    value={form.pickupLocation}
                    placeholder="e.g. Airport, hotel lobby…"
                    error={errors.pickupLocation}
                    onChange={(v) => setForm((f) => ({ ...f, pickupLocation: v }))}
                    onSelect={(v) => setForm((f) => ({ ...f, pickupLocation: v }))}
                  />
                  <PlaceAutocompleteInput
                    label="Drop-off Location" required
                    value={form.dropoffLocation}
                    placeholder="e.g. Same as pickup…"
                    error={errors.dropoffLocation}
                    onChange={(v) => setForm((f) => ({ ...f, dropoffLocation: v }))}
                    onSelect={(v) => setForm((f) => ({ ...f, dropoffLocation: v }))}
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Special Requests (optional)</label>
                <textarea value={form.specialRequests} onChange={set('specialRequests')} rows={3}
                  placeholder="Any special requirements..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#84cc16] resize-none" />
              </div>
            </div>

            {availableAddons.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-black text-gray-900 mb-1">Add-ons</h2>
                <p className="text-xs text-gray-400 mb-4">Enhance your experience with optional extras.</p>
                <div className="space-y-3">
                  {availableAddons.map((addon) => {
                    const qty = addonQty[addon._id] || 0;
                    return (
                      <div key={addon._id} className={`flex items-center justify-between p-4 border-2 rounded-xl transition-colors ${qty > 0 ? 'border-[#84cc16] bg-[#84cc16]/5' : 'border-gray-100'}`}>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{addon.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">₹{Number(addon.price).toLocaleString('en-IN')} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {qty > 0 ? (
                            <>
                              <button type="button" onClick={() => changeQty(addon._id, -1)}
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-base transition-colors">−</button>
                              <span className="text-sm font-black text-gray-900 w-4 text-center">{qty}</span>
                              <button type="button" onClick={() => changeQty(addon._id, 1)}
                                className="w-7 h-7 rounded-full bg-[#84cc16] hover:bg-lime-400 flex items-center justify-center text-gray-900 font-bold text-base transition-colors">+</button>
                            </>
                          ) : (
                            <button type="button" onClick={() => changeQty(addon._id, 1)}
                              className="text-xs font-bold text-[#84cc16] border border-[#84cc16] hover:bg-[#84cc16] hover:text-gray-900 px-3 py-1.5 rounded-lg transition-colors">
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {couponBase > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
                <h2 className="text-base font-black text-gray-900">Have a Coupon?</h2>
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-green-800">"{coupon.code ?? couponInput.toUpperCase()}" applied!</p>
                      <p className="text-xs text-green-700 mt-0.5">You save ₹{discountAmt.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-gray-400 hover:text-red-500 underline transition-colors">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#84cc16] uppercase tracking-widest transition-colors"
                    />
                    <button onClick={applyCoupon} disabled={!couponInput.trim()}
                      className="px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors">
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-500">{couponError}</p>}
              </div>
            )}

            {!isPerKm && grandTotal > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
                <h2 className="text-base font-black text-gray-900">Payment Option</h2>
                {[
                  { value: 'full',    label: 'Pay Full Amount',  desc: `₹${amountFull.toLocaleString('en-IN')} now` },
                  { value: 'deposit', label: 'Pay 25% Deposit',  desc: `₹${amountDep.toLocaleString('en-IN')} now, rest on arrival` },
                ].map((opt) => (
                  <label key={opt.value} className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${form.paymentType === opt.value ? 'border-[#84cc16] bg-[#84cc16]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="paymentType" value={opt.value} checked={form.paymentType === opt.value}
                      onChange={set('paymentType')} className="mt-0.5 accent-[#84cc16]" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <button onClick={handleSubmit} disabled={bookMutation.isPending || step === 'paying' || belowMinimum}
              className="w-full bg-[#84cc16] hover:bg-lime-400 text-gray-900 font-black text-sm uppercase tracking-wider py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              {bookMutation.isPending || step === 'paying' ? 'Processing...' : `Pay${isPerKm ? ' Advance' : ''} ₹${amountDue.toLocaleString('en-IN')}`}
            </button>
            <p className="text-xs text-gray-400 text-center">Secured by Razorpay · No payment data stored on our servers</p>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6 space-y-4">
              <h2 className="text-base font-black text-gray-900">Booking Summary</h2>

              {resource.images?.[0]?.url && (
                <div className="relative h-40 rounded-xl overflow-hidden bg-gray-50">
                  <img src={resource.images[0].url} alt={resource.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <p className="text-xs text-[#84cc16] font-bold uppercase tracking-wide mb-1">
                  {type === 'vehicle' ? (resource.category?.name ?? '') : (resource.stayType?.name ?? '')}
                </p>
                <p className="text-base font-black text-gray-900">{resource.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{[resource.city, resource.state].filter(Boolean).join(', ')}</p>
              </div>

              {belowMinimum && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-600 font-semibold">
                  {isHourly
                    ? `⚠ Minimum ${minimumHours} hr${minimumHours !== 1 ? 's' : ''} required`
                    : `⚠ Minimum ${minimumDays} day${minimumDays !== 1 ? 's' : ''} required`}
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{type === 'vehicle' ? 'Pickup' : 'Check-in'}</span>
                  <span className="font-semibold text-gray-800">{start ? fmt(start) : '—'}</span>
                </div>
                {type === 'vehicle' && form.pickupLocation && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pickup Location</span>
                    <span className="font-semibold text-gray-800 text-right max-w-[55%]">{form.pickupLocation}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">{type === 'vehicle' ? 'Drop-off' : 'Check-out'}</span>
                  <span className="font-semibold text-gray-800">{end ? fmt(end) : '—'}</span>
                </div>
                {type === 'vehicle' && form.dropoffLocation && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Drop-off Location</span>
                    <span className="font-semibold text-gray-800 text-right max-w-[55%]">{form.dropoffLocation}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className={`font-semibold ${belowMinimum ? 'text-red-500' : 'text-gray-800'}`}>
                    {isHourly
                      ? `${totalUnits} hr${totalUnits !== 1 ? 's' : ''}`
                      : `${totalUnits} ${type === 'vehicle' ? 'day' : 'night'}${totalUnits !== 1 ? 's' : ''}`}
                  </span>
                </div>
                {guests > 1 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Guests</span>
                    <span className="font-semibold text-gray-800">{guests}</span>
                  </div>
                )}
              </div>

              {isPerKm ? (
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pricing mode</span>
                    <span className="font-semibold text-gray-800">Per Km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rate</span>
                    <span className="font-semibold text-gray-800">₹{pricePerUnit.toLocaleString('en-IN')} / km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Advance</span>
                    <span className="font-semibold text-gray-800">₹{kmAdvanceAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {driverChargeTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Driver ({totalUnits} day{totalUnits !== 1 ? 's' : ''})</span>
                      <span className="font-semibold text-gray-800">₹{driverChargeTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Coupon discount</span>
                      <span>−₹{discountAmt.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-gray-900 text-base pt-1 border-t border-gray-100">
                    <span>Advance to Pay</span>
                    <span className="text-[#84cc16]">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Final amount = actual km × ₹{pricePerUnit}/km + add-ons{driverChargeTotal > 0 ? ' + driver charge' : ''}. Balance paid after ride.
                    {resource?.pricing?.minimumKm ? ` Min ${resource.pricing.minimumKm} km charged.` : ''}
                  </p>
                </div>
              ) : pricePerUnit > 0 && (
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      ₹{pricePerUnit.toLocaleString('en-IN')} × {totalUnits} {isHourly ? `hr${totalUnits !== 1 ? 's' : ''}` : `${type === 'vehicle' ? 'day' : 'night'}${totalUnits !== 1 ? 's' : ''}`}
                    </span>
                    <span className="text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {selectedAddons.map((a) => (
                    <div key={a.addonId} className="flex justify-between text-gray-500">
                      <span>{a.name} {a.qty > 1 ? `× ${a.qty}` : ''}</span>
                      <span>₹{(a.price * a.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}

                  {addonsTotal > 0 && (
                    <div className="flex justify-between text-gray-500 border-t border-dashed border-gray-100 pt-2">
                      <span>Add-ons total</span>
                      <span>₹{addonsTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {driverChargeTotal > 0 && (
                    <div className="flex justify-between text-gray-500 border-t border-dashed border-gray-100 pt-2">
                      <span>Driver ({totalUnits} day{totalUnits !== 1 ? 's' : ''})</span>
                      <span>₹{driverChargeTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {discountAmt > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold border-t border-dashed border-gray-100 pt-2">
                      <span>Coupon discount</span>
                      <span>−₹{discountAmt.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-black text-gray-900 text-base pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {form.paymentType === 'deposit' && (
                    <div className="flex justify-between text-[#84cc16] font-bold">
                      <span>Due now (25%)</span>
                      <span>₹{amountDep.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
