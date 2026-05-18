'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import {
  listAddonRequests,
  createAddonRequest,
  getAddonPaymentOrder,
  verifyAddonPayment,
} from '@/services/vehicles.service';
import { loadRazorpay } from '@/utils/razorpay';
import api from '@/lib/api';
import { store } from '@/store/store';
import { selectAccessToken } from '@/store/authSlice';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8081';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS = {
  pending_approval: { cls: 'bg-amber-100 text-amber-700',   label: 'Awaiting Approval' },
  approved:         { cls: 'bg-blue-100 text-blue-700',     label: 'Approved' },
  pending_payment:  { cls: 'bg-orange-100 text-orange-700', label: 'Payment Required' },
  paid:             { cls: 'bg-lime-100 text-lime-700',     label: 'Paid' },
  rejected:         { cls: 'bg-red-100 text-red-600',       label: 'Rejected' },
};

function StatusBadge({ status }) {
  const s = STATUS[status] ?? { cls: 'bg-gray-100 text-gray-500', label: status };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
  );
}

// ─── Available addons fetcher ─────────────────────────────────────────────────

function useAvailableAddons(booking, enabled) {
  const [addons, setAddons] = useState([]);
  const [fetched, setFetched] = useState(false);

  const fetch = async () => {
    if (fetched) return;
    try {
      const resource = booking.vehicle || booking.campsite;
      const refType  = booking.bookingType === 'vehicle' ? 'vehicle' : 'campsite';
      const refId    = resource?._id;
      const params   = refId ? { refType, refId } : {};
      const { data } = await api.get('/public/addons', { params });
      setAddons(data?.data ?? []);
    } catch { /* no-op */ }
    setFetched(true);
  };

  return { addons, fetch };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BookingAddonCard({ booking }) {
  const qc = useQueryClient();
  const bookingId = booking._id;

  // Only show for confirmed bookings — user cannot request after ride starts
  const canRequest = booking.status === 'confirmed';
  // Show the section if confirmed OR active (to display pending/paid requests)
  const showSection = ['confirmed', 'active'].includes(booking.status);

  const [showModal,       setShowModal]       = useState(false);
  const [selections,      setSelections]      = useState({});  // { addonId: qty }
  const [note,            setNote]            = useState('');
  const [createError,     setCreateError]     = useState('');
  const [payError,        setPayError]        = useState('');
  const [toast,           setToast]           = useState('');
  const socketRef = useRef(null);

  // ── Socket: listen for partner approval / rejection in real-time ─────────────
  useEffect(() => {
    if (!showSection) return;
    const token = selectAccessToken(store.getState());
    if (!token || socketRef.current) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('addon_request:approved', ({ bookingId: bid }) => {
      if (String(bid) !== String(bookingId)) return;
      qc.invalidateQueries({ queryKey: ['addon-requests', bookingId] });
      setToast('Your add-on request was approved! Tap "Pay Now" to confirm.');
    });

    socket.on('addon_request:rejected', ({ bookingId: bid, rejectionReason }) => {
      if (String(bid) !== String(bookingId)) return;
      qc.invalidateQueries({ queryKey: ['addon-requests', bookingId] });
      setToast(rejectionReason ? `Request declined: ${rejectionReason}` : 'Your add-on request was declined.');
    });

    // Partner/admin added addons directly → payment required
    socket.on('addon_request:payment_required', ({ bookingId: bid }) => {
      if (String(bid) !== String(bookingId)) return;
      qc.invalidateQueries({ queryKey: ['addon-requests', bookingId] });
      setToast('Your partner added add-ons to your booking. Payment required.');
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSection, bookingId]);

  const { addons, fetch: fetchAddons } = useAvailableAddons(booking, showModal);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['addon-requests', bookingId],
    queryFn:  () => listAddonRequests(bookingId),
    enabled:  showSection,
    staleTime: 30_000,
  });

  // ── Create request mutation ────────────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: () => {
      const addonItems = Object.entries(selections)
        .filter(([, qty]) => qty > 0)
        .map(([addonId, qty]) => ({ addonId, qty }));
      return createAddonRequest(bookingId, addonItems, note);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addon-requests', bookingId] });
      setShowModal(false);
      setSelections({});
      setNote('');
      setCreateError('');
    },
    onError: (err) => setCreateError(err?.response?.data?.message || 'Failed to submit request.'),
  });

  // ── Pay for an approved/pending_payment request ───────────────────────────
  const openAddonPayment = async (req) => {
    setPayError('');
    try {
      await loadRazorpay();
    } catch {
      setPayError('Could not load payment gateway. Check your connection.');
      return;
    }

    let orderData;
    try {
      orderData = await getAddonPaymentOrder(req._id);
    } catch (err) {
      setPayError(err?.response?.data?.message || 'Could not load payment details.');
      return;
    }

    const options = {
      key:         orderData.keyId,
      amount:      Math.round(orderData.totalAmount * 100),
      currency:    'INR',
      name:        'Luxor',
      description: 'Addon Payment',
      order_id:    orderData.razorpayOrderId,
      prefill:     { name: booking.guestName, email: booking.guestEmail, contact: booking.guestPhone },
      theme:       { color: '#84cc16' },
      handler: async (response) => {
        try {
          await verifyAddonPayment({
            reqId:             req._id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          qc.invalidateQueries({ queryKey: ['addon-requests', bookingId] });
          qc.invalidateQueries({ queryKey: ['booking', bookingId] });
        } catch {
          setPayError('Payment verification failed. Please contact support.');
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => setPayError('Payment failed. Try again.'));
    rzp.open();
  };

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!showSection) return null;

  // ── Summary helper ─────────────────────────────────────────────────────────
  const selectionTotal = Object.entries(selections)
    .filter(([, q]) => q > 0)
    .reduce((sum, [aid, q]) => {
      const a = addons.find((x) => x._id === aid);
      return sum + (a?.price || 0) * q;
    }, 0);

  const pendingPaymentReqs = requests.filter((r) => r.status === 'pending_payment');

  return (
    <>
    {/* Real-time toast — slides up from bottom */}
    {toast && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 max-w-sm w-[90%]">
        <span className="w-2 h-2 rounded-full bg-[#84cc16] shrink-0" />
        <span className="flex-1">{toast}</span>
        <button onClick={() => setToast('')} className="ml-2 text-white/60 hover:text-white text-lg leading-none">×</button>
      </div>
    )}

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-gray-50">
        <div>
          <h3 className="text-sm font-black text-gray-900">Add-on Requests</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {canRequest
              ? 'Request extras from your partner before the trip starts.'
              : 'Your add-on requests for this booking.'}
          </p>
        </div>
        {canRequest && (
          <button
            onClick={() => { fetchAddons(); setShowModal(true); }}
            className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:brightness-105 shrink-0"
            style={{ backgroundColor: '#84cc16', color: '#1a2e05' }}
          >
            + Request Add-ons
          </button>
        )}
      </div>

      {/* Pending payment banner */}
      {pendingPaymentReqs.length > 0 && (
        <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-orange-800">Payment Required</p>
            <p className="text-xs text-orange-600 mt-0.5">
              {pendingPaymentReqs.length} add-on request{pendingPaymentReqs.length > 1 ? 's' : ''} approved and awaiting payment.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            {pendingPaymentReqs.map((req) => (
              <button
                key={req._id}
                onClick={() => openAddonPayment(req)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors whitespace-nowrap"
              >
                Pay ₹{Number(req.totalAmount).toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>
      )}

      {payError && (
        <p className="px-5 py-2 text-xs text-red-500 bg-red-50 border-b border-red-100">{payError}</p>
      )}

      {/* Request list */}
      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            {canRequest ? 'No add-on requests yet. Click "Request Add-ons" to get started.' : 'No add-on requests for this booking.'}
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req._id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <StatusBadge status={req.status} />
                  <span className="text-sm font-black text-gray-900">
                    ₹{Number(req.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  {req.addons?.map((a, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">
                        {a.name} {a.qty > 1 && <span className="text-gray-400">× {a.qty}</span>}
                      </span>
                      <span className="text-gray-700 font-medium">₹{Number(a.subtotal).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {req.note && (
                  <p className="text-xs text-gray-400 italic mb-2">"{req.note}"</p>
                )}

                {req.rejectionReason && (
                  <p className="text-xs text-red-500 mt-1">Rejected: {req.rejectionReason}</p>
                )}

                {req.status === 'pending_approval' && (
                  <p className="text-xs text-amber-600 font-medium mt-1">Waiting for partner to review your request.</p>
                )}

                {req.status === 'pending_payment' && (
                  <button
                    onClick={() => openAddonPayment(req)}
                    className="mt-2 w-full text-xs font-bold py-2 rounded-lg transition-all hover:brightness-105"
                    style={{ backgroundColor: '#84cc16', color: '#1a2e05' }}
                  >
                    Pay ₹{Number(req.totalAmount).toLocaleString('en-IN')} Now
                  </button>
                )}

                {req.status === 'paid' && (
                  <p className="text-xs text-lime-600 font-medium mt-1">
                    Paid — add-ons confirmed on your booking.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Request modal ────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-black text-gray-900">Request Add-ons</h2>
                <p className="text-xs text-gray-400 mt-0.5">Partner will review and approve your request.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
              >✕</button>
            </div>

            {/* Addon list */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {addons.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No add-ons are available for this booking.
                </p>
              ) : (
                <div className="space-y-3">
                  {addons.map((addon) => (
                    <div key={addon._id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{addon.name}</p>
                        <p className="text-xs text-gray-400">₹{Number(addon.price).toLocaleString('en-IN')} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelections((p) => ({ ...p, [addon._id]: Math.max(0, (p[addon._id] || 0) - 1) }))}
                          className="w-7 h-7 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold transition-colors"
                        >−</button>
                        <span className="w-4 text-center text-sm font-black text-gray-900">
                          {selections[addon._id] || 0}
                        </span>
                        <button
                          onClick={() => setSelections((p) => ({ ...p, [addon._id]: (p[addon._id] || 0) + 1 }))}
                          className="w-7 h-7 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold transition-colors"
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any note for the partner? (optional)"
                className="mt-4 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-[#84cc16]"
              />
            </div>

            {/* Modal footer */}
            <div className="px-6 pb-6 pt-3 border-t border-gray-100 shrink-0">
              {selectionTotal > 0 && (
                <div className="flex justify-between items-center mb-3 text-sm">
                  <span className="text-gray-500">Estimated total</span>
                  <span className="font-black text-gray-900">₹{selectionTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              {createError && <p className="text-xs text-red-500 mb-2">{createError}</p>}

              <button
                onClick={() => {
                  const hasSelection = Object.values(selections).some((q) => q > 0);
                  if (!hasSelection) { setCreateError('Please select at least one add-on.'); return; }
                  createMut.mutate();
                }}
                disabled={createMut.isPending || addons.length === 0}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-105 disabled:opacity-50"
                style={{ backgroundColor: '#84cc16', color: '#1a2e05' }}
              >
                {createMut.isPending ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
