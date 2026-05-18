'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  open:        { cls: 'bg-blue-100 text-blue-600',   label: 'Open' },
  in_progress: { cls: 'bg-amber-100 text-amber-600', label: 'In Progress' },
  resolved:    { cls: 'bg-green-100 text-green-700', label: 'Resolved' },
  closed:      { cls: 'bg-gray-100 text-gray-500',   label: 'Closed' },
};

const CATEGORY_LABELS = {
  new_booking:      'New Booking',
  existing_booking: 'Existing Booking',
  partner_asset:    'Asset',
  partner_payment:  'Payment',
  partner_booking:  'Booking Mgmt',
  general:          'General',
};

const SUB_LABELS = {
  need_support:      'Need Support',
  issue_making:      'Issue Making Booking',
  request_quotation: 'Quotation Request',
  active:            'Active Booking',
  future:            'Future Booking',
  completed:         'Completed Booking',
  other:             'Other',
};

const ISSUE_LABELS = {
  driver_staff:               'Driver / Staff Issue',
  vehicle_condition:          'Vehicle Condition',
  vehicle_addons:             'Vehicle Addons',
  cancel_booking:             'Cancel Booking',
  reschedule:                 'Re-schedule',
  change_vehicle:             'Change Vehicle',
  modify_trip:                'Modify Trip',
  refunds:                    'Refund Issue',
  feedback:                   'Feedback',
  lost_found:                 'Lost & Found',
  issue_vehicle_details:      'Vehicle Details Issue',
  issue_payment:              'Payment Issue',
  issue_booking_confirmation: 'Booking Confirmation',
  unable_add:                 'Unable to Add Asset',
  unable_modify:              'Unable to Modify Asset',
  new_location:               'New Location Support',
  settled_dispute:            'Settled Payment Dispute',
  new_settlement:             'Payment Settlement Request',
  modify_booking:             'Modify Booking',
};

const METADATA_LABELS = {
  from:            'From',
  to:              'To',
  pickupDateTime:  'Pickup',
  dropDateTime:    'Drop',
  noOfPeople:      'Passengers',
  vehicleCategory: 'Vehicle Category',
  extraInfo:       'Additional Info',
  message:         'Message / Details',
};

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Shared form styles ───────────────────────────────────────────────────────

const inputCls   = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#84cc16] bg-white';
const textaCls   = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#84cc16] bg-white resize-none';
const selectCls  = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#84cc16] bg-white cursor-pointer';

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function OptionBtn({ label, description, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-2xl border border-gray-100 hover:border-[#84cc16] hover:bg-lime-50 transition-all group">
      <p className="text-sm font-bold text-gray-800 group-hover:text-lime-700">{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </button>
  );
}

// ─── Trip fields (shared across new booking forms) ────────────────────────────

function TripFields({ values, onChange, categories }) {
  const set = (k) => (v) => onChange({ ...values, [k]: v });
  const setE = (k) => (e) => onChange({ ...values, [k]: e.target.value });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Pickup Date & Time" required>
          <input type="datetime-local" value={values.pickupDateTime || ''} onChange={setE('pickupDateTime')} className={inputCls} required />
        </Field>
        <Field label="Drop Date & Time" required>
          <input type="datetime-local" value={values.dropDateTime || ''} onChange={setE('dropDateTime')} className={inputCls} required />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="No. of People" required>
          <input type="number" min={1} value={values.noOfPeople || ''} onChange={setE('noOfPeople')} placeholder="e.g. 4" className={inputCls} required />
        </Field>
        <Field label="Vehicle Category" required>
          {categories?.length > 0 ? (
            <select value={values.vehicleCategory || ''} onChange={setE('vehicleCategory')} className={selectCls} required>
              <option value="">Select type…</option>
              {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          ) : (
            <input value={values.vehicleCategory || ''} onChange={setE('vehicleCategory')} placeholder="e.g. SUV" className={inputCls} required />
          )}
        </Field>
      </div>
    </div>
  );
}

// ─── FORMS ────────────────────────────────────────────────────────────────────

function FormCard({ title, onBack, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <button type="button" onClick={onBack}
          className="text-gray-400 hover:text-gray-700 transition-colors">
          <BackIcon />
        </button>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      <div className="px-6 py-6 space-y-5">{children}</div>
    </div>
  );
}

const ISSUE_MAKING_OPTIONS = [
  { value: 'issue_vehicle_details',      label: 'Issue in displaying Vehicle details',   extraLabel: 'Vehicle details (optional)' },
  { value: 'issue_payment',              label: 'Issue with making Payment',             extraLabel: 'Payment failure ID (optional)' },
  { value: 'issue_booking_confirmation', label: 'Issue with booking confirmation',       extraLabel: 'Payment confirmation ID (optional)' },
  { value: 'other',                      label: 'Other',                                 extraLabel: null },
];

const ACTIVE_ISSUES   = [
  { value: 'driver_staff',      label: 'Issue with Driver / Staff' },
  { value: 'vehicle_condition', label: 'Issue with Vehicle Condition' },
  { value: 'vehicle_addons',    label: 'Issue with Vehicle Addons' },
  { value: 'other',             label: 'Other' },
];

const FUTURE_ISSUES   = [
  { value: 'cancel_booking', label: 'Cancel Booking' },
  { value: 'reschedule',     label: 'Re-schedule Booking' },
  { value: 'change_vehicle', label: 'Change Vehicle' },
  { value: 'modify_trip',    label: 'Modify Trip Details' },
  { value: 'other',          label: 'Other' },
];

const COMPLETED_ISSUES = [
  { value: 'refunds',    label: 'Issue with Refunds' },
  { value: 'feedback',   label: 'Feedback' },
  { value: 'lost_found', label: 'Lost & Found Report' },
];

// ─── New Ticket Flow (multi-step) ─────────────────────────────────────────────
// steps: 'choice' → 'new_type' → [new_form variant]
//        'choice' → 'exist_cat' → 'exist_form'

function NewTicketFlow({ onCreated, onBack }) {
  const isAuth            = useSelector(selectIsAuthenticated);
  const vehicleCategories = useVehicleCategories();
  const { bookings, loading: bookingsLoading } = useUserBookings(isAuth);

  const [step,            setStep]            = useState('choice');
  const [newSub,          setNewSub]          = useState('');
  const [existCat,        setExistCat]        = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [trip,            setTrip]            = useState({});
  const [issueType,       setIssueType]       = useState('');
  const [extraVal,        setExtraVal]        = useState('');
  const [message,         setMessage]         = useState('');
  const [files,           setFiles]           = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');

  const submit = async (payload, isFormData = false) => {
    setError('');
    setLoading(true);
    try {
      const r = await supportService.createTicket(isFormData ? payload : payload);
      onCreated(r.data?.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  // ── step: choice ────────────────────────────────────────────────────────────
  if (step === 'choice') return (
    <div className="space-y-3">
      <div className="mb-2">
        <h2 className="text-lg font-black text-gray-900">How can we help?</h2>
        <p className="text-sm text-gray-400 mt-0.5">Tell us what your request is about</p>
      </div>
      <OptionBtn label="New Booking" description="Need help or have an issue making a new booking" onClick={() => setStep('new_type')} />
      <OptionBtn label="Existing Booking" description="Support for an active, upcoming, or completed booking" onClick={() => setStep('exist_booking')} />
    </div>
  );

  // ── step: new_type ──────────────────────────────────────────────────────────
  if (step === 'new_type') return (
    <div className="space-y-3">
      <button type="button" onClick={() => setStep('choice')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-2">
        <BackIcon /> Back
      </button>
      <div className="mb-2">
        <h2 className="text-lg font-black text-gray-900">New Booking</h2>
        <p className="text-sm text-gray-400">What do you need?</p>
      </div>
      <OptionBtn label="Need Support on New Booking" description="General help or information" onClick={() => { setNewSub('need_support'); setStep('new_form'); }} />
      <OptionBtn label="Issue in Making a New Booking" description="Problem with vehicle details, payment, or confirmation" onClick={() => { setNewSub('issue_making'); setStep('new_form'); }} />
      <OptionBtn label="Request for Quotation" description="Get a price estimate for a specific vehicle" onClick={() => { setNewSub('request_quotation'); setStep('new_form'); }} />
      <OptionBtn label="Other" onClick={() => { setNewSub('other'); setStep('new_form'); }} />
    </div>
  );

  // ── step: new_form ──────────────────────────────────────────────────────────
  if (step === 'new_form' && newSub !== 'issue_making') {
    const title = newSub === 'request_quotation' ? 'Request Quotation' : 'New Booking Support';
    return (
      <FormCard title={title} onBack={() => setStep('new_type')}>
        <TripFields values={trip} onChange={setTrip} categories={vehicleCategories} />
        <Field label="Message">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your query…" rows={3} className={textaCls} />
        </Field>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="button" disabled={loading}
          onClick={() => submit({ type: 'user_to_partner', category: 'new_booking', subCategory: newSub, metadata: { ...trip, message } })}
          className="w-full bg-[#84cc16] hover:bg-[#a3e635] text-black font-bold py-3 rounded-xl disabled:opacity-50 transition-colors">
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </FormCard>
    );
  }

  if (step === 'new_form' && newSub === 'issue_making') {
    const selectedOpt = ISSUE_MAKING_OPTIONS.find((o) => o.value === issueType);
    return (
      <FormCard title="Issue Making Booking" onBack={() => setStep('new_type')}>
        <TripFields values={trip} onChange={setTrip} categories={vehicleCategories} />
        <Field label="What's the issue?" required>
          <select value={issueType} onChange={(e) => { setIssueType(e.target.value); setExtraVal(''); }} className={selectCls} required>
            <option value="">Select issue…</option>
            {ISSUE_MAKING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        {issueType && selectedOpt?.extraLabel && (
          <Field label={selectedOpt.extraLabel}>
            <input value={extraVal} onChange={(e) => setExtraVal(e.target.value)} placeholder="Optional" className={inputCls} />
          </Field>
        )}
        <Field label="Message">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue in detail…" rows={3} className={textaCls} />
        </Field>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="button" disabled={loading || !issueType}
          onClick={() => submit({ type: 'user_to_partner', category: 'new_booking', subCategory: 'issue_making', issueType, metadata: { ...trip, extraInfo: extraVal, message } })}
          className="w-full bg-[#84cc16] hover:bg-[#a3e635] text-black font-bold py-3 rounded-xl disabled:opacity-50 transition-colors">
          {loading ? 'Submitting…' : 'Submit Issue'}
        </button>
      </FormCard>
    );
  }

  // ── step: exist_booking ──────────────────────────────────────────────────────
  if (step === 'exist_booking') return (
    <div className="space-y-3">
      <button type="button" onClick={() => setStep('choice')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-2">
        <BackIcon /> Back
      </button>
      <div className="mb-4">
        <h2 className="text-lg font-black text-gray-900">Select Your Booking</h2>
        <p className="text-sm text-gray-400">Choose the booking you need help with</p>
      </div>
      {bookingsLoading && (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!bookingsLoading && bookings.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No bookings found in your account.</p>
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
          className="w-full text-left px-5 py-4 rounded-2xl border border-gray-100 hover:border-[#84cc16] hover:bg-lime-50 transition-all group">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 group-hover:text-lime-700 truncate">{b.vehicleName || b.campsiteName || 'Booking'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{b.bookingId || `#${b._id?.slice(-8).toUpperCase()}`} · <span className="capitalize">{b.status}</span></p>
            </div>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-300 group-hover:text-lime-500 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>
      ))}
      <button type="button"
        onClick={() => { setSelectedBooking(null); setStep('exist_cat'); }}
        className="w-full text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 px-5 py-3 rounded-2xl border border-dashed border-gray-200 transition-colors text-left">
        My booking isn't listed →
      </button>
    </div>
  );

  // ── step: exist_cat ─────────────────────────────────────────────────────────
  if (step === 'exist_cat') return (
    <div className="space-y-3">
      <button type="button" onClick={() => setStep('exist_booking')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-2">
        <BackIcon /> Back
      </button>
      {selectedBooking && (
        <div className="flex items-center gap-3 px-4 py-3 bg-lime-50 rounded-2xl border border-lime-100 mb-2">
          <div className="w-9 h-9 bg-lime-200 rounded-xl flex items-center justify-center shrink-0">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-lime-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-lime-800 truncate">{selectedBooking.resourceName}</p>
            <p className="text-xs text-lime-600">{selectedBooking.displayId}</p>
          </div>
        </div>
      )}
      <div className="mb-2">
        <h2 className="text-lg font-black text-gray-900">Existing Booking</h2>
        <p className="text-sm text-gray-400">What is the status of your booking?</p>
      </div>
      <OptionBtn label="Active Booking" description="Your booking is currently in progress" onClick={() => { setExistCat('active'); setStep('exist_form'); }} />
      <OptionBtn label="Future Booking" description="Confirmed booking that hasn't started yet" onClick={() => { setExistCat('future'); setStep('exist_form'); }} />
      <OptionBtn label="Completed Booking" description="Trip is done — refunds, feedback, lost items" onClick={() => { setExistCat('completed'); setStep('exist_form'); }} />
    </div>
  );

  // ── step: exist_form ─────────────────────────────────────────────────────────
  if (step === 'exist_form') {
    const back = () => { setIssueType(''); setMessage(''); setFiles([]); setStep('exist_cat'); };

    if (existCat === 'active') return (
      <FormCard title="Active Booking Issue" onBack={back}>
        <Field label="What's the issue?" required>
          <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className={selectCls} required>
            <option value="">Select…</option>
            {ACTIVE_ISSUES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Describe the issue" required>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Required — describe what happened…" rows={4} className={textaCls} required />
        </Field>
        <Field label="Attach photos (optional)">
          <input type="file" accept="image/*" multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-lime-100 file:text-lime-700 file:font-semibold hover:file:bg-lime-200 cursor-pointer" />
          {files.length > 0 && <p className="text-xs text-gray-400 mt-1">{files.length} file(s) selected</p>}
        </Field>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="button" disabled={loading || !issueType || !message.trim()}
          onClick={async () => {
            const fd = new FormData();
            fd.append('type', 'user_to_partner');
            fd.append('category', 'existing_booking');
            fd.append('subCategory', 'active');
            fd.append('issueType', issueType);
            fd.append('metadata', JSON.stringify({ message }));
            if (selectedBooking?._id) fd.append('bookingId', selectedBooking._id);
            files.forEach((f) => fd.append('files', f));
            await submit(fd, true);
          }}
          className="w-full bg-[#84cc16] hover:bg-[#a3e635] text-black font-bold py-3 rounded-xl disabled:opacity-50 transition-colors">
          {loading ? 'Submitting…' : 'Submit Issue'}
        </button>
      </FormCard>
    );

    if (existCat === 'future') return (
      <FormCard title="Future Booking Request" onBack={back}>
        <Field label="What do you need?" required>
          <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className={selectCls} required>
            <option value="">Select…</option>
            {FUTURE_ISSUES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Additional details">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Any additional information…" rows={3} className={textaCls} />
        </Field>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="button" disabled={loading || !issueType}
          onClick={() => submit({ type: 'user_to_partner', category: 'existing_booking', subCategory: 'future', issueType, metadata: { message }, ...(selectedBooking?._id ? { bookingId: selectedBooking._id } : {}) })}
          className="w-full bg-[#84cc16] hover:bg-[#a3e635] text-black font-bold py-3 rounded-xl disabled:opacity-50 transition-colors">
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </FormCard>
    );

    if (existCat === 'completed') return (
      <FormCard title="Completed Booking" onBack={back}>
        <Field label="What is this about?" required>
          <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className={selectCls} required>
            <option value="">Select…</option>
            {COMPLETED_ISSUES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Details" required>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your concern…" rows={4} className={textaCls} required />
        </Field>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="button" disabled={loading || !issueType || !message.trim()}
          onClick={() => submit({ type: 'user_to_partner', category: 'existing_booking', subCategory: 'completed', issueType, metadata: { message }, ...(selectedBooking?._id ? { bookingId: selectedBooking._id } : {}) })}
          className="w-full bg-[#84cc16] hover:bg-[#a3e635] text-black font-bold py-3 rounded-xl disabled:opacity-50 transition-colors">
          {loading ? 'Submitting…' : 'Submit'}
        </button>
      </FormCard>
    );
  }

  return null;
}

// ─── Ticket Detail + Chat ─────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8081';

function TicketDetail({ ticket, onBack }) {
  const [messages, setMessages] = useState([]);
  const [body, setBody]         = useState('');
  const [sending, setSending]   = useState(false);
  const bottomRef   = useRef(null);
  const ticketIdRef = useRef(null);

  useEffect(() => {
    if (!ticket) { setMessages([]); return; }
    ticketIdRef.current = ticket._id;
    setMessages([]);
    supportService.getMessages(ticket._id)
      .then((r) => {
        if (ticketIdRef.current === ticket._id) setMessages(r.data?.data || []);
      })
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
    } catch { /* handled */ }
    setSending(false);
  };

  const s  = STATUS_STYLE[ticket.status] || STATUS_STYLE.open;
  const md = ticket.metadata || {};

  // Metadata keys worth showing
  const metaEntries = Object.entries(md).filter(([, v]) => v && String(v).trim());

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: '70vh' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-3 transition-colors">
          <BackIcon /> All Tickets
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-gray-300 mb-0.5">{ticket.ticketId}</p>
            <h2 className="text-base font-bold text-gray-900 leading-tight">{ticket.subject}</h2>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
        </div>
        {/* Classification badges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {ticket.category && ticket.category !== 'general' && (
            <span className="text-[10px] font-semibold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
              {CATEGORY_LABELS[ticket.category] || ticket.category}
            </span>
          )}
          {ticket.subCategory && (
            <span className="text-[10px] font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              {SUB_LABELS[ticket.subCategory] || ticket.subCategory}
            </span>
          )}
          {ticket.issueType && (
            <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
              {ISSUE_LABELS[ticket.issueType] || ticket.issueType}
            </span>
          )}
        </div>
      </div>

      {/* Metadata panel */}
      {(metaEntries.length > 0 || (ticket.attachments?.length > 0)) && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 space-y-2">
          {metaEntries.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs">
              <span className="text-gray-400 font-semibold shrink-0 w-28">{METADATA_LABELS[k] || k}:</span>
              <span className="text-gray-700">{String(v)}</span>
            </div>
          ))}
          {ticket.attachments?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {ticket.attachments.map((a, i) => (
                  <a key={i} href={a.url.startsWith('http') ? a.url : `${API_BASE}${a.url}`}
                    target="_blank" rel="noreferrer"
                    className="text-[10px] font-semibold text-lime-700 bg-lime-100 hover:bg-lime-200 px-2 py-1 rounded-lg transition-colors">
                    {a.filename || `Attachment ${i + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center pt-8">No messages yet. Start the conversation below.</p>
        )}
        {messages.map((m) => {
          const isMe = m.senderModel === 'User';
          return (
            <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[72%] rounded-2xl px-4 py-3 ${
                isMe ? 'bg-[#84cc16] text-black' : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
              }`}>
                {!isMe && <p className="text-[10px] font-semibold text-gray-400 mb-1">{m.senderName || m.senderModel}</p>}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.body}</p>
                <p className={`text-[10px] mt-1.5 ${isMe ? 'text-black/50' : 'text-gray-400'}`}>{fmtDate(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {ticket.status !== 'closed' ? (
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 items-end bg-white shrink-0">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type your message… (Enter to send)"
            rows={2}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-[#84cc16]"
          />
          <button onClick={handleSend} disabled={sending || !body.trim()}
            className="bg-[#84cc16] hover:bg-[#a3e635] disabled:opacity-50 text-black p-2.5 rounded-xl transition-colors shrink-0">
            <SendIcon />
          </button>
        </div>
      ) : (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-center">
          <p className="text-sm text-gray-400">This ticket is closed.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const isAuth = useSelector(selectIsAuthenticated);
  const [mounted,  setMounted]  = useState(false);
  const [tickets,  setTickets]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [view,     setView]     = useState('list'); // 'list' | 'new' | 'detail'

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const r = await supportService.listTickets({ limit: 50 });
      setTickets(r.data?.data?.tickets || []);
    } catch { /* handled */ }
    setLoading(false);
  }, []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isAuth) fetchTickets();
  }, [isAuth, fetchTickets]);

  useSupportSocket({
    onMessage: useCallback(({ ticketId, message }) => {
      setTickets((prev) => prev.map((t) =>
        t._id === ticketId
          ? { ...t, lastMessage: message.body.slice(0, 80), lastMessageAt: message.createdAt }
          : t
      ));
    }, []),
    onNewTicket: useCallback(({ ticket }) => {
      setTickets((prev) => prev.some((t) => t._id === ticket._id) ? prev : [ticket, ...prev]);
    }, []),
  });

  const handleCreated = (ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    setSelected(ticket);
    setView('detail');
  };

  const handleSelect = async (t) => {
    try {
      const r = await supportService.getTicket(t._id);
      setSelected(r.data?.data || t);
    } catch { setSelected(t); }
    setView('detail');
  };

  // ── Pre-mount: render neutral shell to match server HTML ────────────────────
  if (!mounted) return <div className="bg-gray-50 min-h-screen pt-16" />;

  // ── Not authenticated ────────────────────────────────────────────────────────
  if (!isAuth) return (
    <div className="bg-gray-50 min-h-screen pt-16 flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-2">
        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </div>
      <p className="text-gray-900 font-bold text-lg">Sign in to view support</p>
      <p className="text-gray-400 text-sm text-center max-w-xs">
        Track your support tickets and chat with our team.
      </p>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('luxor:require-login', { detail: { redirect: '/support' } }))}
        className="mt-2 text-gray-900 font-bold text-sm px-6 py-3 rounded-xl transition-all hover:brightness-105"
        style={{ backgroundColor: '#84cc16' }}
      >
        Sign In
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-16">
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-24">

        {/* Page header */}
        {view === 'list' && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Support</h1>
              <p className="text-sm text-gray-400 mt-0.5">Your support tickets and conversations</p>
            </div>
            <button
              onClick={() => setView('new')}
              className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:brightness-105"
              style={{ backgroundColor: '#84cc16', color: '#1a2e05' }}
            >
              + New Request
            </button>
          </div>
        )}

        {/* Ticket list */}
        {view === 'list' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">No support tickets yet</p>
                <p className="text-sm text-gray-400 mb-6">Start a conversation with our support team.</p>
                <button
                  onClick={() => setView('new')}
                  className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:brightness-105"
                  style={{ backgroundColor: '#84cc16', color: '#1a2e05' }}
                >
                  Create your first request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => {
                  const s = STATUS_STYLE[t.status] || STATUS_STYLE.open;
                  return (
                    <button
                      key={t._id}
                      onClick={() => handleSelect(t)}
                      className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 hover:border-[#84cc16]/40 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          {t.ticketId && <p className="text-[10px] font-mono text-gray-300 mb-0.5">{t.ticketId}</p>}
                          <p className="text-sm font-bold text-gray-900 truncate">{t.subject}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {t.category && t.category !== 'general' && (
                          <span className="text-[10px] font-semibold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                            {CATEGORY_LABELS[t.category] || t.category}
                          </span>
                        )}
                        {t.issueType && (
                          <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                            {ISSUE_LABELS[t.issueType] || t.issueType}
                          </span>
                        )}
                      </div>
                      {t.lastMessage && <p className="text-xs text-gray-400 truncate">{t.lastMessage}</p>}
                      <p className="text-[11px] text-gray-300 mt-1.5">{fmtDate(t.lastMessageAt || t.updatedAt)}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* New ticket flow */}
        {view === 'new' && (
          <div>
            <button onClick={() => setView('list')}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
              <BackIcon /> My Tickets
            </button>
            <NewTicketFlow onCreated={handleCreated} onBack={() => setView('list')} />
          </div>
        )}

        {/* Ticket detail + chat */}
        {view === 'detail' && selected && (
          <TicketDetail ticket={selected} onBack={() => { setView('list'); setSelected(null); }} />
        )}

      </div>
    </div>
  );
}
