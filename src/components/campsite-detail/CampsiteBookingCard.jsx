'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/authSlice';
import { todayStr } from '@/utils/date';

/** True if date string [YYYY-MM-DD] falls inside a blocked range */
function isDateBlocked(dateStr, blocks) {
  if (!dateStr || !blocks?.length) return false;
  const d = new Date(dateStr).getTime();
  return blocks.some((b) => {
    const s = new Date(b.startDate).getTime();
    const e = new Date(b.endDate).getTime();
    return d >= s && d < e;
  });
}

/** Count how many rooms in the campsite share the same category as the given room */
function availableUnitsOfType(rooms, room) {
  if (!room || !rooms?.length) return 10;
  const catId = room.category?._id ?? room.category;
  const sameType = rooms.filter((r) => {
    const rCat = r.category?._id ?? r.category;
    return String(rCat) === String(catId);
  });
  return Math.max(1, sameType.length);
}

import CustomDatePicker from '@/components/CustomDatePicker';
import { AnimatePresence } from 'framer-motion';

export default function CampsiteBookingCard({ campsite, selectedRoomId, onRoomSelect }) {
  const router = useRouter();
  const isAuth = useSelector(selectIsAuthenticated);
  const c = campsite;
  const room = selectedRoomId ? c.rooms?.find((r) => r._id === selectedRoomId) : c.rooms?.[0];
  const stayTypeName = c.stayType?.name ?? c.stayType ?? '';

  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [numRooms, setNumRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [checked, setChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [avail, setAvail] = useState(null);

  const today = todayStr();

  // Capacity Limits
  const perRoomCap = room?.maxCapacity ?? room?.capacity ?? 10;
  const maxGuests = numRooms * perRoomCap;
  const maxRooms = availableUnitsOfType(c.rooms, room);

  const totalNights = (checkin && checkout)
    ? Math.max(0, Math.round((new Date(checkout.split(' ')[0]) - new Date(checkin.split(' ')[0])) / 86400000))
    : 0;

  const totalPrice = room?.price != null ? room.price * totalNights * numRooms : null;
  const roomBlocks = []; // Mock blocks for offline UX

  const handleCheck = () => {
    if (!checkin || !checkout) return;
    setChecking(true);
    setTimeout(() => {
      setAvail({ available: true });
      setChecking(false);
      setChecked(true);
    }, 600); // Luxury delay
  };

  const handleBook = () => {
    const params = new URLSearchParams({
      type: 'campsite',
      slug: c.slug,
      id: c._id,
      roomId: room?._id || '',
      start: checkin,
      end: checkout,
      guests: String(guests),
      rooms: String(numRooms),
    });
    const checkoutUrl = `/checkout?${params.toString()}`;
    if (!isAuth) {
      window.dispatchEvent(new CustomEvent('luxor:require-login', { detail: { redirect: checkoutUrl } }));
      return;
    }
    router.push(checkoutUrl);
  };

  const handleRoomSelect = (id) => {
    onRoomSelect?.(id);
    setChecked(false);
    setAvail(null);
    setNumRooms(1);
  };

  const changeRooms = (n) => {
    const clamped = Math.min(Math.max(1, n), maxRooms);
    setNumRooms(clamped);
    setGuests((g) => Math.min(g, clamped * perRoomCap));
    setChecked(false);
  };

  const clampedGuests = Math.min(guests, maxGuests);

  return (
    <div className="lg:sticky lg:top-[116px]">
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] p-6 md:p-8 relative overflow-visible">

        {/* Subtle background glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#84cc16]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Dynamic Pricing Header */}
        <div className="mb-8 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#84cc16] mb-1">RESERVATION</p>
          <div className="flex items-end gap-2">
            {room?.price != null ? (
              <span className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                ₹{Number(room.price).toLocaleString('en-IN')}
              </span>
            ) : (
              <span className="text-xl font-black text-gray-500">Pricing Unavailable</span>
            )}
            {room?.price != null && <span className="text-gray-400 font-semibold text-xs mb-1">/ night</span>}
          </div>
        </div>

        {/* Stay Type Selection */}
        {c.rooms?.length > 1 && (
          <div className="mb-6 relative z-10">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Select Option</p>
            <div className="flex flex-wrap gap-2">
              {c.rooms.map((r) => {
                const isSelected = selectedRoomId === r._id || (!selectedRoomId && c.rooms?.[0]?._id === r._id);
                return (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => handleRoomSelect(r._id)}
                    className={`relative px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${isSelected
                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                  >
                    {r.category?.name ?? r.category ?? r.roomNumber ?? 'Room'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Date Matrix */}
        <div className="grid grid-cols-2 gap-3 mb-4 relative z-20">
          <div className="relative">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 mb-1.5 ml-1">CHECK-IN</p>
            <button
              onClick={() => { setCheckinOpen(!checkinOpen); setCheckoutOpen(false); }}
              className="w-full bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-100 rounded-2xl p-3 md:p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className={`text-sm font-bold tracking-tight ${checkin ? 'text-gray-900' : 'text-gray-400'}`}>
                  {checkin || 'Add date & time'}
                </span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={checkinOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} /></svg>
            </button>
            <AnimatePresence>
              {checkinOpen && (
                <CustomDatePicker
                  isOpen={checkinOpen}
                  onClose={() => setCheckinOpen(false)}
                  selectedDate={checkin}
                  onSelect={(d) => { setCheckin(d); setChecked(false); }}
                  minDate={today}
                  showTime={true}
                />
              )}
            </AnimatePresence>
          </div>
          <div className="relative">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 mb-1.5 ml-1">CHECK-OUT</p>
            <button
              onClick={() => { setCheckoutOpen(!checkoutOpen); setCheckinOpen(false); }}
              className="w-full bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-100 rounded-2xl p-3 md:p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className={`text-sm font-bold tracking-tight ${checkout ? 'text-gray-900' : 'text-gray-400'}`}>
                  {checkout || 'Add date & time'}
                </span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={checkoutOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} /></svg>
            </button>
            <AnimatePresence>
              {checkoutOpen && (
                <CustomDatePicker
                  isOpen={checkoutOpen}
                  onClose={() => setCheckoutOpen(false)}
                  selectedDate={checkout}
                  onSelect={(d) => { setCheckout(d); setChecked(false); }}
                  minDate={checkin ? checkin.split(' ')[0] : today}
                  showTime={true}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Steppers */}
        <div className="space-y-3 mb-6 relative z-10">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Rooms</p>
              <p className="text-sm font-black text-gray-900">{numRooms}</p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-100">
              <button type="button" onClick={() => changeRooms(numRooms - 1)} disabled={numRooms <= 1}
                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-900 font-bold hover:bg-gray-100 transition-colors disabled:opacity-40">−</button>
              <button type="button" onClick={() => changeRooms(numRooms + 1)} disabled={numRooms >= maxRooms}
                className="w-8 h-8 rounded-full bg-[#84cc16] shadow-sm flex items-center justify-center text-gray-900 font-bold hover:bg-lime-400 transition-colors disabled:opacity-40">+</button>
            </div>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Guests</p>
              <p className="text-sm font-black text-gray-900">
                {clampedGuests} <span className="text-gray-400 font-bold text-[10px] ml-1 uppercase">(Max {maxGuests})</span>
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-100">
              <button type="button" onClick={() => setGuests(Math.max(1, clampedGuests - 1))}
                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-900 font-bold hover:bg-gray-100 transition-colors disabled:opacity-40">−</button>
              <button type="button" onClick={() => setGuests(Math.min(maxGuests, clampedGuests + 1))} disabled={clampedGuests >= maxGuests}
                className="w-8 h-8 rounded-full bg-[#84cc16] shadow-sm flex items-center justify-center text-gray-900 font-bold hover:bg-lime-400 transition-colors disabled:opacity-40">+</button>
            </div>
          </div>
        </div>

        {/* Premium Dark Mode Receipt */}
        {totalNights > 0 && room?.price != null && (
          <div className="bg-gray-900 rounded-2xl p-5 mb-6 relative overflow-hidden shadow-xl z-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#84cc16]/10 blur-2xl rounded-full" />

            <div className="flex justify-between items-end mb-3 relative z-10">
              <span className="text-gray-400 text-xs font-semibold">
                ₹{Number(room.price).toLocaleString('en-IN')} × {totalNights} night{totalNights !== 1 ? 's' : ''}
                {numRooms > 1 && ` × ${numRooms}`}
              </span>
              <span className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-px w-full bg-white/10 mb-3 relative z-10" />
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">Total Payable</span>
              <span className="text-sm font-black text-[#84cc16]">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Offline Mock Status Box */}
        {checked && avail && (
          <div className="bg-lime-50 border border-[#84cc16]/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#84cc16] flex items-center justify-center shrink-0 shadow-lg shadow-[#84cc16]/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Available to Book</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">Instant Confirmation</p>
            </div>
          </div>
        )}

        {/* Dynamic Action Buttons */}
        <div className="relative z-10">
          {(!checked || !avail) ? (
            <button
              onClick={handleCheck}
              disabled={!checkin || !checkout || checking}
              className="w-full relative overflow-hidden group bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.6)] hover:-translate-y-0.5"
            >
              <span className="relative z-10">{checking ? 'Authenticating...' : 'Check Availability'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          ) : avail.available ? (
            <button
              onClick={handleBook}
              className="w-full relative overflow-hidden bg-[#84cc16] text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(132,204,22,0.4)] hover:shadow-[0_15px_30px_-10px_rgba(132,204,22,0.5)] hover:-translate-y-0.5 hover:bg-lime-400"
            >
              Confirm & Book
            </button>
          ) : null}
        </div>

        <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest mt-5 relative z-10">
          No charges apply until confirmation
        </p>
      </div>
    </div>
  );
}
