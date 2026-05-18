'use client';

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/authSlice';
import api from '@/lib/api';
import * as supportService from '@/services/support.service';
import useSupportSocket from '@/hooks/useSupportSocket';
import PlaceAutocompleteInput from '@/components/PlaceAutocompleteInput';

// ─── Data hooks ───────────────────────────────────────────────────────────────

function useVehicleCategories() {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    api.get('/config/vehicle-categories').then((r) => setCats(r.data?.data || [])).catch(() => {});
  }, []);
  return cats;
}

function useUserBookings(enabled) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(false);
  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    api.get('/public/bookings', { params: { limit: 50 } })
      .then((r) => setBookings(r.data?.data?.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enabled]);
  return { bookings, loading };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  chat: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  close: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  back: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  chevron: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  send: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  newBooking: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  ),
  existingBooking: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  ),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  open:        { bg: 'bg-blue-50',   text: 'text-blue-600',  dot: 'bg-blue-400'  },
  in_progress: { bg: 'bg-amber-50',  text: 'text-amber-600', dot: 'bg-amber-400' },
  resolved:    { bg: 'bg-green-50',  text: 'text-green-600', dot: 'bg-green-400' },
  closed:      { bg: 'bg-gray-100',  text: 'text-gray-500',  dot: 'bg-gray-400'  },
};

function fmtTime(d) {
  return d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
}

function fmtAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── UI Primitives ────────────────────────────────────────────────────────────

function StepNav({ label, onBack, step, total }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
      <button onClick={onBack} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0">
        {Icon.back}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{label}</p>
      </div>
      {total > 1 && (
        <div className="flex gap-1 shrink-0">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i < step ? 'w-4 bg-[#84cc16]' : 'w-1.5 bg-gray-200'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryBtn({ icon, label, description, color = 'lime', onClick }) {
  const colors = {
    lime:   'group-hover:bg-lime-100 group-hover:text-lime-700 bg-lime-50 text-lime-600',
    blue:   'group-hover:bg-blue-100 group-hover:text-blue-700 bg-blue-50 text-blue-600',
    purple: 'group-hover:bg-purple-100 group-hover:text-purple-700 bg-purple-50 text-purple-600',
    orange: 'group-hover:bg-orange-100 group-hover:text-orange-700 bg-orange-50 text-orange-600',
  };
  return (
    <button type="button" onClick={onClick}
      className="w-full text-left flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${colors[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5 leading-tight">{description}</p>}
      </div>
      <span className="text-gray-300 group-hover:text-gray-400 shrink-0">{Icon.chevron}</span>
    </button>
  );
}

const inputCls  = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 bg-white transition-shadow';
const selectCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 bg-white cursor-pointer transition-shadow';
const areaCls   = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 bg-white resize-none transition-shadow';

function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function SubmitBtn({ loading, label = 'Submit Request', disabled }) {
  return (
    <button type="submit" disabled={loading || disabled}
      className="w-full bg-[#84cc16] hover:bg-[#a3e635] active:scale-[0.98] text-black text-sm font-bold py-3 rounded-xl disabled:opacity-40 transition-all mt-1">
      {loading ? 'Submitting…' : label}
    </button>
  );
}

// ─── Forms ────────────────────────────────────────────────────────────────────

function TripFields({ values, onChange, categories }) {
  const set  = (k) => (v) => onChange({ ...values, [k]: v });
  const setE = (k) => (e) => onChange({ ...values, [k]: e.target.value });
  return (
    <div className="space-y-3">
      <PlaceAutocompleteInput
        label="From" required
        value={values.from || ''}
        onChange={set('from')}
        onSelect={set('from')}
        placeholder="City / Location"
      />
      <PlaceAutocompleteInput
        label="To" required
        value={values.to || ''}
        onChange={set('to')}
        onSelect={set('to')}
        placeholder="City / Location"
      />
      <div>
        <Label required>Pickup Date & Time</Label>
        <input type="datetime-local" value={values.pickupDateTime || ''} onChange={setE('pickupDateTime')} className={inputCls} required />
      </div>
      <div>
        <Label required>Drop Date & Time</Label>
        <input type="datetime-local" value={values.dropDateTime || ''} onChange={setE('dropDateTime')} className={inputCls} required />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label required>Passengers</Label>
          <input type="number" min={1} value={values.noOfPeople || ''} onChange={setE('noOfPeople')} placeholder="4" className={inputCls} required />
        </div>
        <div>
          <Label required>Vehicle Type</Label>
          {categories?.length > 0 ? (
            <select value={values.vehicleCategory || ''} onChange={setE('vehicleCategory')} className={selectCls} required>
              <option value="">Select type…</option>
              {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          ) : (
            <input value={values.vehicleCategory || ''} onChange={setE('vehicleCategory')} placeholder="e.g. SUV" className={inputCls} required />
          )}
        </div>
      </div>
    </div>
  );
}

const ISSUE_MAKING_OPTIONS = [
  { value: 'issue_vehicle_details',      label: 'Vehicle details not displaying',   extra: 'Vehicle details (optional)' },
  { value: 'issue_payment',              label: 'Payment failed',                   extra: 'Payment failure ID (optional)' },
  { value: 'issue_booking_confirmation', label: 'Confirmation not received',        extra: 'Payment confirmation ID (optional)' },
  { value: 'other',                      label: 'Something else',                   extra: null },
];

const ACTIVE_ISSUES = [
  { value: 'driver_staff',      label: 'Driver or staff issue' },
  { value: 'vehicle_condition', label: 'Vehicle condition issue' },
  { value: 'vehicle_addons',    label: 'Addon or extra issue' },
  { value: 'other',             label: 'Something else' },
];

const FUTURE_ISSUES = [
  { value: 'cancel_booking', label: 'Cancel my booking' },
  { value: 'reschedule',     label: 'Re-schedule my booking' },
  { value: 'change_vehicle', label: 'Change vehicle' },
  { value: 'modify_trip',    label: 'Modify trip details' },
  { value: 'other',          label: 'Something else' },
];

const COMPLETED_ISSUES = [
  { value: 'refunds',    label: 'Refund issue' },
  { value: 'feedback',   label: 'Leave feedback' },
  { value: 'lost_found', label: 'Lost & Found' },
];

function NewBookingForm({ subCategory, onCreated, onBack, categories }) {
  const [trip, setTrip] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await supportService.createTicket({ type: 'user_to_partner', category: 'new_booking', subCategory, metadata: { ...trip, message } });
      onCreated(r.data?.data);
    } catch { /**/ }
    setLoading(false);
  };

  const title = subCategory === 'request_quotation' ? 'Request Quotation' : 'New Booking Support';
  return (
    <div className="flex flex-col h-full">
      <StepNav label={title} onBack={onBack} step={2} total={2} />
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        <TripFields values={trip} onChange={setTrip} categories={categories} />
        <div>
          <Label>Message</Label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your query in detail…" rows={3} className={areaCls} />
        </div>
        <SubmitBtn loading={loading} label="Submit Request" />
      </form>
    </div>
  );
}

function IssueMakingForm({ onCreated, onBack, categories }) {
  const [trip, setTrip] = useState({});
  const [issueType, setIssueType] = useState('');
  const [extraVal, setExtraVal]   = useState('');
  const [message, setMessage]     = useState('');
  const [loading, setLoading]     = useState(false);
  const opt = ISSUE_MAKING_OPTIONS.find((o) => o.value === issueType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await supportService.createTicket({ type: 'user_to_partner', category: 'new_booking', subCategory: 'issue_making', issueType, metadata: { ...trip, extraInfo: extraVal, message } });
      onCreated(r.data?.data);
    } catch { /**/ }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <StepNav label="Issue Making Booking" onBack={onBack} step={2} total={2} />
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        <TripFields values={trip} onChange={setTrip} categories={categories} />
        <div>
          <Label required>What's the issue?</Label>
          <select value={issueType} onChange={(e) => { setIssueType(e.target.value); setExtraVal(''); }} className={selectCls} required>
            <option value="">Select an issue…</option>
            {ISSUE_MAKING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {issueType && opt?.extra && (
          <div>
            <Label>{opt.extra}</Label>
            <input value={extraVal} onChange={(e) => setExtraVal(e.target.value)} placeholder="Optional" className={inputCls} />
          </div>
        )}
        <div>
          <Label>Message</Label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what happened…" rows={2} className={areaCls} />
        </div>
        <SubmitBtn loading={loading} disabled={!issueType} label="Submit Issue" />
      </form>
    </div>
  );
}

function ActiveBookingForm({ bookingCtx, onCreated, onBack }) {
  const [issueType, setIssueType] = useState('');
  const [message, setMessage]     = useState('');
  const [files, setFiles]         = useState([]);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('type', 'user_to_partner');
      fd.append('category', 'existing_booking');
      fd.append('subCategory', 'active');
      fd.append('issueType', issueType);
      fd.append('metadata', JSON.stringify({ message }));
      if (bookingCtx?._id) fd.append('bookingId', bookingCtx._id);
      files.forEach((f) => fd.append('files', f));
      const r = await supportService.createTicket(fd);
      onCreated(r.data?.data);
    } catch { /**/ }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <StepNav label="Active Booking Issue" onBack={onBack} step={2} total={2} />
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {bookingCtx && (
          <div className="flex items-center gap-2.5 p-3 bg-lime-50 rounded-xl border border-lime-100">
            <div className="w-8 h-8 bg-lime-200 rounded-lg flex items-center justify-center shrink-0">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-lime-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-lime-800 truncate">{bookingCtx.resourceName}</p>
              <p className="text-[11px] text-lime-600">{bookingCtx.displayId}</p>
            </div>
          </div>
        )}
        <div>
          <Label required>What's the issue?</Label>
          <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className={selectCls} required>
            <option value="">Select…</option>
            {ACTIVE_ISSUES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <Label required>Describe the issue</Label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us exactly what happened…" rows={3} className={areaCls} required />
        </div>
        <div>
          <Label>Attach photos</Label>
          <label className="flex items-center gap-2 px-3.5 py-2.5 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#84cc16] hover:bg-lime-50 transition-colors">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-sm text-gray-400">{files.length > 0 ? `${files.length} photo(s) selected` : 'Add photos'}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files))} />
          </label>
        </div>
        <SubmitBtn loading={loading} disabled={!issueType || !message.trim()} label="Submit Issue" />
      </form>
    </div>
  );
}

function SimpleExistingForm({ subCategory, issueOptions, onCreated, onBack, bookingCtx }) {
  const [issueType, setIssueType] = useState('');
  const [message, setMessage]     = useState('');
  const [loading, setLoading]     = useState(false);

  const titles = { future: 'Future Booking Request', completed: 'Completed Booking' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await supportService.createTicket({
        type: 'user_to_partner', category: 'existing_booking', subCategory, issueType,
        metadata: { message },
        ...(bookingCtx?._id ? { bookingId: bookingCtx._id } : {}),
      });
      onCreated(r.data?.data);
    } catch { /**/ }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <StepNav label={titles[subCategory] || 'Existing Booking'} onBack={onBack} step={2} total={2} />
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        <div>
          <Label required>What do you need?</Label>
          <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className={selectCls} required>
            <option value="">Select…</option>
            {issueOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <Label required>Details</Label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide any additional context…" rows={4} className={areaCls} required />
        </div>
        <SubmitBtn loading={loading} disabled={!issueType || !message.trim()} />
      </form>
    </div>
  );
}

// ─── Multi-step New Ticket Flow ───────────────────────────────────────────────

function NewTicketFlow({ onCreated, onCancel, booking }) {
  const isAuth            = useSelector(selectIsAuthenticated);
  const vehicleCategories = useVehicleCategories();
  const { bookings, loading: bookingsLoading } = useUserBookings(isAuth);

  const [step,            setStep]            = useState(booking ? 'exist_cat' : 'choice');
  const [newSub,          setNewSub]          = useState('');
  const [existCat,        setExistCat]        = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  // resolved booking context: external prop (opened via event) OR user-picked from list
  const bookingCtx = booking || selectedBooking;

  if (step === 'choice') return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-3">
          {Icon.back} <span className="text-xs">Back</span>
        </button>
        <p className="text-base font-black text-gray-900">How can we help?</p>
        <p className="text-sm text-gray-400 mt-0.5">Select what your request is about</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <CategoryBtn icon={Icon.newBooking} label="New Booking" description="Help or issues with making a new booking" color="lime" onClick={() => setStep('new_type')} />
        <CategoryBtn icon={Icon.existingBooking} label="Existing Booking" description="Support for a current, upcoming, or past booking" color="blue" onClick={() => setStep('exist_booking')} />
      </div>
    </div>
  );

  if (step === 'new_type') return (
    <div className="flex flex-col h-full">
      <StepNav label="New Booking" onBack={() => setStep('choice')} step={1} total={2} />
      <div className="flex-1 overflow-y-auto">
        <CategoryBtn icon={
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>} label="Need Support" description="General help or information for a new booking" color="lime"
          onClick={() => { setNewSub('need_support'); setStep('new_form'); }} />
        <CategoryBtn icon={
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>} label="Issue Making Booking" description="Problem with vehicle details, payment, or confirmation" color="orange"
          onClick={() => { setNewSub('issue_making'); setStep('new_form'); }} />
        <CategoryBtn icon={
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>} label="Request Quotation" description="Get a price estimate for a specific vehicle" color="purple"
          onClick={() => { setNewSub('request_quotation'); setStep('new_form'); }} />
        <CategoryBtn icon={
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>} label="Other" color="blue"
          onClick={() => { setNewSub('other'); setStep('new_form'); }} />
      </div>
    </div>
  );

  if (step === 'new_form') {
    const back = () => setStep('new_type');
    if (newSub === 'issue_making') return <IssueMakingForm onCreated={onCreated} onBack={back} categories={vehicleCategories} />;
    return <NewBookingForm subCategory={newSub} onCreated={onCreated} onBack={back} categories={vehicleCategories} />;
  }

  if (step === 'exist_booking') return (
    <div className="flex flex-col h-full">
      <StepNav label="Select Your Booking" onBack={() => setStep('choice')} step={1} total={3} />
      <div className="flex-1 overflow-y-auto">
        {bookingsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!bookingsLoading && bookings.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-gray-400">No bookings found in your account.</div>
        )}
        {bookings.map((b) => (
          <button key={b._id} type="button"
            onClick={() => {
              setSelectedBooking({
                _id: b._id,
                displayId: b.bookingId || `#${b._id?.slice(-8).toUpperCase()}`,
                resourceName: b.vehicleName || b.campsiteName || 'Booking',
                status: b.status,
              });
              setStep('exist_cat');
            }}
            className="w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-lime-50 rounded-xl flex items-center justify-center shrink-0">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-lime-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{b.vehicleName || b.campsiteName || 'Booking'}</p>
                <p className="text-xs text-gray-400">{b.bookingId || `#${b._id?.slice(-8).toUpperCase()}`} · <span className="capitalize">{b.status}</span></p>
              </div>
              <span className="text-gray-300 group-hover:text-gray-400 shrink-0">{Icon.chevron}</span>
            </div>
          </button>
        ))}
        <button type="button"
          onClick={() => { setSelectedBooking(null); setStep('exist_cat'); }}
          className="w-full px-4 py-3.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100 text-left">
          My booking isn't listed →
        </button>
      </div>
    </div>
  );

  if (step === 'exist_cat') {
    const backFromExistCat = booking ? onCancel : () => setStep('exist_booking');
    return (
      <div className="flex flex-col h-full">
        {bookingCtx ? (
          <div className="px-4 pt-4 pb-3">
            <button onClick={backFromExistCat} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-3">
              {Icon.back} <span className="text-xs">Back</span>
            </button>
            <div className="flex items-center gap-2.5 p-3 bg-lime-50 rounded-xl border border-lime-100 mb-3">
              <div className="w-8 h-8 bg-lime-200 rounded-lg flex items-center justify-center shrink-0">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-lime-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-lime-800 truncate">{bookingCtx.resourceName}</p>
                <p className="text-[11px] text-lime-600">{bookingCtx.displayId || `#${bookingCtx._id?.slice(-8).toUpperCase()}`}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-700">What is the status of your booking?</p>
          </div>
        ) : (
          <StepNav label="Existing Booking" onBack={backFromExistCat} step={2} total={3} />
        )}
        <div className="flex-1 overflow-y-auto">
          <CategoryBtn icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>} label="Active Booking" description="Your trip is currently in progress" color="lime"
            onClick={() => { setExistCat('active'); setStep('exist_form'); }} />
          <CategoryBtn icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>} label="Future Booking" description="Confirmed booking that hasn't started yet" color="blue"
            onClick={() => { setExistCat('future'); setStep('exist_form'); }} />
          <CategoryBtn icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>} label="Completed Booking" description="Past trip — refunds, feedback, lost items" color="purple"
            onClick={() => { setExistCat('completed'); setStep('exist_form'); }} />
        </div>
      </div>
    );
  }

  if (step === 'exist_form') {
    const back = () => { setStep('exist_cat'); };
    if (existCat === 'active')    return <ActiveBookingForm bookingCtx={bookingCtx} onCreated={onCreated} onBack={back} />;
    if (existCat === 'future')    return <SimpleExistingForm subCategory="future"    issueOptions={FUTURE_ISSUES}    bookingCtx={bookingCtx} onCreated={onCreated} onBack={back} />;
    if (existCat === 'completed') return <SimpleExistingForm subCategory="completed" issueOptions={COMPLETED_ISSUES} bookingCtx={bookingCtx} onCreated={onCreated} onBack={back} />;
  }

  return null;
}

// ─── Ticket List ──────────────────────────────────────────────────────────────

function TicketList({ tickets, onSelect, onNew, loading }) {
  const s = STATUS_COLORS;
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">My Tickets</span>
        <button onClick={onNew} className="text-xs font-bold bg-[#84cc16] hover:bg-[#a3e635] text-black px-3 py-1.5 rounded-lg transition-colors">
          + New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">No tickets yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Start a conversation with our team</p>
            </div>
            <button onClick={onNew} className="text-sm font-bold bg-[#84cc16] hover:bg-[#a3e635] text-black px-4 py-2 rounded-xl transition-colors">
              Get Help
            </button>
          </div>
        )}
        {tickets.map((t) => {
          const sc = s[t.status] || s.open;
          return (
            <button key={t._id} onClick={() => onSelect(t)}
              className="w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors group">
              <div className="flex items-start gap-2.5">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sc.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800 truncate leading-tight">{t.subject}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${sc.bg} ${sc.text}`}>
                      {t.status?.replace('_', ' ')}
                    </span>
                  </div>
                  {t.lastMessage && <p className="text-xs text-gray-400 truncate">{t.lastMessage}</p>}
                  <p className="text-[11px] text-gray-300 mt-1">{fmtAgo(t.lastMessageAt || t.updatedAt)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chat View ────────────────────────────────────────────────────────────────

const ISSUE_LABELS_W = {
  driver_staff: 'Driver / Staff', vehicle_condition: 'Vehicle Condition', vehicle_addons: 'Vehicle Addons',
  cancel_booking: 'Cancel Booking', reschedule: 'Re-schedule', change_vehicle: 'Change Vehicle',
  modify_trip: 'Modify Trip', refunds: 'Refund Issue', feedback: 'Feedback', lost_found: 'Lost & Found',
  issue_vehicle_details: 'Vehicle Details Issue', issue_payment: 'Payment Issue',
  issue_booking_confirmation: 'Booking Confirmation', other: 'Other',
};
const SUB_LABELS_W = {
  need_support: 'Need Support', issue_making: 'Issue Making Booking', request_quotation: 'Quotation Request',
  active: 'Active Booking', future: 'Future Booking', completed: 'Completed Booking', other: 'Other',
};
const META_LABELS_W = {
  from: 'From', to: 'To', pickupDateTime: 'Pickup', dropDateTime: 'Drop',
  noOfPeople: 'Passengers', vehicleCategory: 'Vehicle Type', extraInfo: 'Extra Info', message: 'Details',
};
const API_BASE_W = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')) || 'http://localhost:8081';

function ChatView({ ticket, onBack }) {
  const [messages, setMessages] = useState([]);
  const [body, setBody]         = useState('');
  const [sending, setSending]   = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const bottomRef   = useRef(null);
  const ticketIdRef = useRef(null);
  const sc = STATUS_COLORS[ticket?.status] || STATUS_COLORS.open;

  useEffect(() => {
    setShowInfo(true);
  }, [ticket?._id]);

  useEffect(() => {
    if (!ticket) { setMessages([]); return; }
    ticketIdRef.current = ticket._id;
    setMessages([]);
    supportService.getMessages(ticket._id)
      .then((r) => { if (ticketIdRef.current === ticket._id) setMessages(r.data?.data || []); })
      .catch(() => {});
  }, [ticket?._id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useSupportSocket({
    onMessage: useCallback(({ ticketId, message }) => {
      if (ticketId !== ticketIdRef.current) return;
      setMessages((prev) => prev.some((m) => m._id === message._id) ? prev : [...prev, message]);
    }, []),
  });

  const handleSend = async () => {
    if (!body.trim() || !ticket) return;
    setSending(true);
    try {
      const r = await supportService.sendMessage(ticket._id, body.trim());
      const msg = r.data?.data;
      setMessages((prev) => prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]);
      setBody('');
    } catch { /**/ }
    setSending(false);
  };

  const md          = ticket.metadata || {};
  const metaEntries = Object.entries(md).filter(([k, v]) => k !== 'message' && v && String(v).trim());
  const hasDetails  = metaEntries.length > 0 || ticket.subCategory || ticket.issueType || ticket.attachments?.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0">
          {Icon.back}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{ticket.subject}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            <span className={`text-[10px] font-semibold ${sc.text}`}>{ticket.status?.replace('_', ' ')}</span>
            {hasDetails && (
              <button onClick={() => setShowInfo((v) => !v)}
                className="ml-1 text-[10px] font-semibold text-gray-400 hover:text-lime-600 underline underline-offset-2 transition-colors">
                {showInfo ? 'hide details' : 'view details'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ticket details panel */}
      {showInfo && hasDetails && (
        <div className="px-4 py-3 bg-lime-50 border-b border-lime-100 space-y-1.5 shrink-0">
          {ticket.subCategory && (
            <div className="flex gap-2 text-xs">
              <span className="text-gray-400 font-semibold w-20 shrink-0">Type</span>
              <span className="text-gray-700">{SUB_LABELS_W[ticket.subCategory] || ticket.subCategory}</span>
            </div>
          )}
          {ticket.issueType && (
            <div className="flex gap-2 text-xs">
              <span className="text-gray-400 font-semibold w-20 shrink-0">Issue</span>
              <span className="text-gray-700">{ISSUE_LABELS_W[ticket.issueType] || ticket.issueType}</span>
            </div>
          )}
          {metaEntries.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs">
              <span className="text-gray-400 font-semibold w-20 shrink-0">{META_LABELS_W[k] || k}</span>
              <span className="text-gray-700 break-all">{String(v)}</span>
            </div>
          ))}
          {ticket.attachments?.length > 0 && (
            <div className="flex gap-2 text-xs">
              <span className="text-gray-400 font-semibold w-20 shrink-0">Files</span>
              <div className="flex flex-wrap gap-1">
                {ticket.attachments.map((a, i) => (
                  <a key={i} href={a.url?.startsWith('http') ? a.url : `${API_BASE_W}${a.url}`}
                    target="_blank" rel="noreferrer"
                    className="text-lime-700 underline underline-offset-1 truncate max-w-[120px]">
                    {a.filename || `File ${i + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <p className="text-sm text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-300 mt-0.5">Start the conversation below</p>
          </div>
        )}
        {messages.map((m) => {
          const isMe = m.senderModel === 'User';
          return (
            <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${isMe ? 'bg-[#84cc16] text-black' : 'bg-white border border-gray-100 text-gray-800 shadow-sm'}`}>
                {!isMe && <p className="text-[10px] font-semibold text-gray-400 mb-0.5">{m.senderName || 'Support'}</p>}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.body}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-black/40' : 'text-gray-400'}`}>{fmtTime(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {ticket.status !== 'closed' ? (
        <div className="px-3 py-3 border-t border-gray-100 flex gap-2 bg-white shrink-0">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(); }}
            placeholder="Type a message…"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#84cc16] focus:bg-white transition-colors"
          />
          <button onClick={handleSend} disabled={sending || !body.trim()}
            className="w-9 h-9 flex items-center justify-center bg-[#84cc16] hover:bg-[#a3e635] disabled:opacity-40 text-black rounded-full transition-all active:scale-95 shrink-0">
            {Icon.send}
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-100 text-center bg-gray-50">
          <p className="text-xs text-gray-400">Ticket closed · <button onClick={onBack} className="underline">View all tickets</button></p>
        </div>
      )}
    </div>
  );
}

// ─── Login Prompt ─────────────────────────────────────────────────────────────

function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 gap-5">
      <div className="w-16 h-16 bg-lime-50 rounded-2xl flex items-center justify-center text-[#84cc16]">
        {Icon.chat}
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-gray-900 mb-1">Need help?</p>
        <p className="text-sm text-gray-400 leading-snug">Sign in to chat with our support team and track your tickets.</p>
      </div>
      <button onClick={() => window.dispatchEvent(new CustomEvent('luxor:require-login'))}
        className="bg-[#84cc16] hover:bg-[#a3e635] text-black text-sm font-bold px-6 py-3 rounded-xl w-full transition-colors active:scale-[0.98]">
        Sign in to get help
      </button>
    </div>
  );
}

// ─── Widget ───────────────────────────────────────────────────────────────────

export default function SupportWidget() {
  const isAuth = useSelector(selectIsAuthenticated);
  const [open,     setOpen]     = useState(false);
  const [view,     setView]     = useState('list');
  const [tickets,  setTickets]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [unread,   setUnread]   = useState(0);
  const [mounted,  setMounted]  = useState(false);
  const [bookingCtx, setBookingCtx] = useState(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handler = (e) => {
      const { bookingId, bookingDisplayId, resourceName } = e.detail || {};
      if (bookingId) setBookingCtx({ _id: bookingId, displayId: bookingDisplayId, resourceName: resourceName || 'Booking' });
      setOpen(true); setView('new'); setUnread(0);
    };
    window.addEventListener('luxor:open-support', handler);
    return () => window.removeEventListener('luxor:open-support', handler);
  }, []);

  const fetchTickets = useCallback(async () => {
    if (!isAuth) return;
    setLoading(true);
    try {
      const r = await supportService.listTickets({ limit: 20 });
      setTickets(r.data?.data?.tickets || []);
    } catch { /**/ }
    setLoading(false);
  }, [isAuth]);

  useEffect(() => { if (open && isAuth) fetchTickets(); }, [open, isAuth, fetchTickets]);

  useSupportSocket({
    onMessage: useCallback(({ ticketId, message }) => {
      setTickets((prev) => prev.map((t) =>
        t._id === ticketId ? { ...t, lastMessage: message.body.slice(0, 80), lastMessageAt: message.createdAt } : t
      ));
      if (!open || view !== 'chat' || selected?._id !== ticketId) setUnread((n) => n + 1);
    }, [open, view, selected]),
  });

  const handleSelect = async (t) => {
    try { const r = await supportService.getTicket(t._id); setSelected(r.data?.data || t); }
    catch { setSelected(t); }
    setView('chat');
  };

  const handleCreated = (ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    setSelected(ticket);
    setBookingCtx(null);
    setView('chat');
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { open ? setOpen(false) : (setOpen(true), setUnread(0)); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#84cc16] hover:bg-[#a3e635] text-black shadow-2xl flex items-center justify-center transition-all duration-200 active:scale-95"
        aria-label="Support chat"
      >
        <span className={`transition-all duration-200 ${open ? 'scale-100' : 'scale-100'}`}>
          {open ? Icon.close : Icon.chat}
        </span>
        {!open && unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden"
          style={{ width: 400, height: 580, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
        >
          {/* Brand header */}
          <div className="px-4 py-3.5 bg-[#84cc16] flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-black/10 rounded-xl flex items-center justify-center">
              {Icon.chat}
            </div>
            <div>
              <p className="text-sm font-black text-black leading-tight">Luxor Support</p>
              <p className="text-xs text-black/50 mt-0.5">Usually replies in minutes</p>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden">
            {!isAuth ? (
              <LoginPrompt />
            ) : view === 'list' ? (
              <TicketList tickets={tickets} onSelect={handleSelect} onNew={() => setView('new')} loading={loading} />
            ) : view === 'new' ? (
              <NewTicketFlow onCreated={handleCreated} onCancel={() => { setView('list'); setBookingCtx(null); }} booking={bookingCtx} />
            ) : (
              <ChatView ticket={selected} onBack={() => { setView('list'); setSelected(null); }} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
