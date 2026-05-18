'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/authSlice';
import { StarIcon } from '@/assets/icons';
import { checkCampsiteAvailability, getCampsiteBlockedPeriods } from '@/services/campsites.service';
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

/** True if [start, end) range overlaps any blocked period */
function rangeOverlapsBlock(start, end, blocks) {
  if (!start || !end || !blocks?.length) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return blocks.find((b) => {
    const bs = new Date(b.startDate).getTime();
    const be = new Date(b.endDate).getTime();
    return s < be && e > bs;
  }) ?? null;
}

/** First blocked date on/after today, formatted YYYY-MM-DD */
function firstBlockedDateStr(blocks) {
  if (!blocks?.length) return null;
  const now = Date.now();
  const upcoming = blocks
    .filter((b) => new Date(b.endDate).getTime() > now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  if (!upcoming.length) return null;
  const d = new Date(upcoming[0].startDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

export default function CampsiteBookingCard({ campsite, selectedRoomId, onRoomSelect }) {
  const router = useRouter();
  const isAuth = useSelector(selectIsAuthenticated);
  const c    = campsite;
  const room = selectedRoomId ? c.rooms?.find((r) => r._id === selectedRoomId) : c.rooms?.[0];
  const stayTypeName = c.stayType?.name ?? c.stayType ?? '';

  const [checkin,   setCheckin]   = useState('');
  const [checkout,  setCheckout]  = useState('');
  const [numRooms,  setNumRooms]  = useState(1);
  const [guests,    setGuests]    = useState(2);
  const [checked,   setChecked]   = useState(false);

  const today = todayStr();

  // Max capacity across all selected rooms
  const perRoomCap = room?.maxCapacity ?? room?.capacity ?? 10;
  const maxGuests  = numRooms * perRoomCap;
  // Max units of this room type the campsite has
  const maxRooms   = availableUnitsOfType(c.rooms, room);

  const totalNights = (checkin && checkout)
    ? Math.max(0, Math.round((new Date(checkout) - new Date(checkin)) / 86400000))
    : 0;

  const totalPrice = room?.price != null ? room.price * totalNights * numRooms : null;

  // ── Blocked periods ───────────────────────────────────────────────
  const { data: allBlocks = [] } = useQuery({
    queryKey: ['campsite-blocks', c._id],
    queryFn:  () => getCampsiteBlockedPeriods(c._id),
    staleTime: 5 * 60 * 1000,
  });

  const roomBlocks = allBlocks.filter(
    (b) => !b.roomId || b.roomId === room?._id || b.roomId?.toString() === room?._id?.toString()
  );

  const getRoomBlocks = (r) =>
    allBlocks.filter((b) => !b.roomId || b.roomId === r._id || b.roomId?.toString() === r._id?.toString());

  const overlapBlock = rangeOverlapsBlock(checkin, checkout, roomBlocks);

  // ── Availability check ────────────────────────────────────────────
  const { data: avail, isLoading: checking, refetch } = useQuery({
    queryKey: ['campsite-avail', c._id, checkin, checkout, room?._id, numRooms],
    queryFn:  () => checkCampsiteAvailability(c._id, checkin, checkout, room?._id, numRooms),
    enabled:  false,
  });

  const handleCheck = () => {
    if (!checkin || !checkout) return;
    setChecked(true);
    refetch();
  };

  const handleBook = () => {
    const params = new URLSearchParams({
      type:   'campsite',
      slug:   c.slug,
      id:     c._id,
      roomId: room?._id || '',
      start:  checkin,
      end:    checkout,
      guests: String(guests),
      rooms:  String(numRooms),
    });
    const checkoutUrl = `/checkout?${params.toString()}`;
    if (!isAuth) {
      window.dispatchEvent(new CustomEvent('luxor:require-login', { detail: { redirect: checkoutUrl } }));
      return;
    }
    router.push(checkoutUrl);
  };

  // When room changes reset checked state; also clamp guests to new max
  const handleRoomSelect = (id) => {
    onRoomSelect?.(id);
    setChecked(false);
    setNumRooms(1);
    // guest count will be clamped via the setter below on next render — handled by clamping on render
  };

  // Keep guests within new max when numRooms changes
  const changeRooms = (n) => {
    const clamped = Math.min(Math.max(1, n), maxRooms);
    setNumRooms(clamped);
    setGuests((g) => Math.min(g, clamped * perRoomCap));
    setChecked(false);
  };

  const clampedGuests = Math.min(guests, maxGuests);

  return (
    <div className="lg:sticky lg:top-[116px]">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6">

        {/* Room type selector */}
        {c.rooms?.length > 1 && (
          <div className="mb-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Select Stay Type</p>
            <div className="flex flex-wrap gap-2">
              {c.rooms.map((r) => {
                const isSelected = selectedRoomId === r._id || (!selectedRoomId && c.rooms?.[0]?._id === r._id);
                const rBlocks    = getRoomBlocks(r);
                const hasBlocks  = rBlocks.length > 0;
                return (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => handleRoomSelect(r._id)}
                    className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#84cc16] text-gray-900'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {r.category?.name ?? r.category ?? r.roomNumber ?? 'Room'}
                    {r.price != null && (
                      <span className="ml-1 font-normal opacity-70">₹{Number(r.price).toLocaleString('en-IN')}</span>
                    )}
                    {hasBlocks && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400 border border-white" title="Some dates blocked" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="mb-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">From</span>
          <div className="flex items-baseline gap-1 mt-1">
            {room?.price != null ? (
              <span className="text-3xl font-black text-gray-900">₹{Number(room.price).toLocaleString('en-IN')}</span>
            ) : (
              <span className="text-lg font-black text-gray-500">Contact for pricing</span>
            )}
            {room?.price != null && <span className="text-gray-400 text-sm">/ room / night</span>}
          </div>
        </div>

        {/* Date pickers */}
        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-xl px-4 py-3 ${isDateBlocked(checkin, roomBlocks) ? 'bg-rose-50 border border-rose-200' : 'bg-gray-50'}`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Check-in</p>
              <input
                type="date"
                value={checkin}
                min={today}
                onChange={(e) => { setCheckin(e.target.value); setChecked(false); }}
                className="w-full text-xs font-semibold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            <div className={`rounded-xl px-4 py-3 ${isDateBlocked(checkout, roomBlocks) ? 'bg-rose-50 border border-rose-200' : 'bg-gray-50'}`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Check-out</p>
              <input
                type="date"
                value={checkout}
                min={checkin || today}
                onChange={(e) => { setCheckout(e.target.value); setChecked(false); }}
                className="w-full text-xs font-semibold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Blocked range warning */}
          {overlapBlock && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-rose-500 text-base leading-none mt-0.5">⚠</span>
              <div>
                <p className="text-xs font-bold text-rose-700">Selected dates include a blocked period</p>
                <p className="text-[11px] text-rose-500 mt-0.5">
                  {overlapBlock.reason ? `Reason: ${overlapBlock.reason}. ` : ''}
                  Please choose different dates.
                </p>
              </div>
            </div>
          )}

          {/* Upcoming blocks notice */}
          {!overlapBlock && roomBlocks.length > 0 && (() => {
            const nextBlock = firstBlockedDateStr(roomBlocks);
            return nextBlock ? (
              <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                ⚠ Some dates are blocked for this stay. Check availability before booking.
              </p>
            ) : null;
          })()}

          {/* Rooms counter */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Rooms</p>
              <p className="text-sm font-bold text-gray-800">{numRooms} Room{numRooms > 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => changeRooms(numRooms - 1)} disabled={numRooms <= 1}
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 font-bold transition-colors cursor-pointer disabled:opacity-40">−</button>
              <span className="text-sm font-black text-gray-800 w-5 text-center tabular-nums">{numRooms}</span>
              <button type="button" onClick={() => changeRooms(numRooms + 1)} disabled={numRooms >= maxRooms}
                className="w-7 h-7 rounded-full bg-[#84cc16] hover:bg-lime-400 text-gray-900 flex items-center justify-center font-bold transition-colors cursor-pointer disabled:opacity-40">+</button>
            </div>
          </div>

          {/* Guests counter — max = numRooms × perRoomCap */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Guests</p>
              <p className="text-sm font-bold text-gray-800">
                {clampedGuests} Guest{clampedGuests > 1 ? 's' : ''}
                <span className="text-gray-400 font-normal text-xs ml-1">(max {maxGuests})</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setGuests(Math.max(1, clampedGuests - 1))}
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 font-bold transition-colors cursor-pointer">−</button>
              <span className="text-sm font-black text-gray-800 w-5 text-center tabular-nums">{clampedGuests}</span>
              <button type="button" onClick={() => setGuests(Math.min(maxGuests, clampedGuests + 1))}
                disabled={clampedGuests >= maxGuests}
                className="w-7 h-7 rounded-full bg-[#84cc16] hover:bg-lime-400 text-gray-900 flex items-center justify-center font-bold transition-colors cursor-pointer disabled:opacity-40">+</button>
            </div>
          </div>
        </div>

        {/* Price summary */}
        {totalNights > 0 && room?.price != null && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                ₹{Number(room.price).toLocaleString('en-IN')} × {totalNights} night{totalNights !== 1 ? 's' : ''}
                {numRooms > 1 && ` × ${numRooms} rooms`}
              </span>
              <span className="font-bold text-gray-800">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
            {numRooms > 1 && (
              <p className="text-[11px] text-gray-400">
                ₹{Number(room.price).toLocaleString('en-IN')}/room × {numRooms} rooms × {totalNights} night{totalNights !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Availability result */}
        {checked && avail && (
          <div className={`rounded-xl px-4 py-3 mb-4 text-sm font-semibold ${
            avail.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {avail.available
              ? `✓ Available — ${numRooms} room${numRooms > 1 ? 's' : ''} for selected dates`
              : `✗ Not available${avail.reason ? ` — ${avail.reason}` : ''}`}
          </div>
        )}

        {/* CTA */}
        {(!checked || !avail) ? (
          <button
            onClick={handleCheck}
            disabled={!checkin || !checkout || checking || Boolean(overlapBlock)}
            className="w-full cursor-pointer bg-[#84cc16] hover:bg-lime-400 text-gray-900 font-black text-sm uppercase tracking-wider py-4 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {checking ? 'Checking...' : 'Check Availability'}
          </button>
        ) : avail.available ? (
          <button
            onClick={handleBook}
            className="w-full cursor-pointer bg-[#84cc16] hover:bg-lime-400 text-gray-900 font-black text-sm uppercase tracking-wider py-4 rounded-xl transition-all duration-200"
          >
            Book {numRooms > 1 ? `${numRooms} Rooms` : 'Now'}
          </button>
        ) : (
          <button
            onClick={() => { setChecked(false); setCheckin(''); setCheckout(''); }}
            className="w-full cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm uppercase tracking-wider py-4 rounded-xl transition-all duration-200"
          >
            Choose Different Dates
          </button>
        )}

        <p className="text-[10px] text-gray-400 text-center mt-3">No payment charged until confirmed</p>

        <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5">
          {[
            { label: 'Location',     value: [c.city, c.state].filter(Boolean).join(', ') || '—' },
            { label: 'Stay Type',    value: stayTypeName || '—' },
            { label: 'Check-in',     value: room?.checkInTime  || '—' },
            { label: 'Check-out',    value: room?.checkOutTime || '—' },
            { label: 'Capacity',     value: perRoomCap ? `${perRoomCap} guest${perRoomCap !== 1 ? 's' : ''}/room` : '—' },
            { label: 'Stay Options', value: c.rooms?.length ? `${c.rooms.length} type${c.rooms.length !== 1 ? 's' : ''}` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-400">{label}</span>
              <span className="font-semibold text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
