'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/authSlice';
import { StarIcon, CheckBadgeIcon } from '@/assets/icons';
import { checkVehicleAvailability, getVehicleBlockedPeriods } from '@/services/vehicles.service';
import { todayStr } from '@/utils/date';
import CustomDateTimePicker from '@/components/CustomDateTimePicker';

/** True if any blocked range has a partial overlap with the given date (not full-day) */
function hasPartialBlock(dateStr, blockedRanges) {
  if (!dateStr || !blockedRanges?.length) return false;
  const dayStart = new Date(dateStr).getTime();
  const dayEnd   = dayStart + 86400000;
  return blockedRanges.some(b => {
    const bs = new Date(b.startDate).getTime();
    const be = new Date(b.endDate).getTime();
    if (bs >= dayEnd || be <= dayStart) return false;
    // overlaps but is it partial (not covering full day)?
    return !(bs <= dayStart && be >= dayEnd);
  });
}

export default function VehicleBookingCard({ vehicle }) {
  const router  = useRouter();
  const isAuth  = useSelector(selectIsAuthenticated);
  const v = vehicle;
  const isPerKm         = v.pricing?.type === 'per_km';
  const kmAdvanceAmount = v.pricing?.kmAdvanceAmount ?? 0;
  const bookingMode     = v.bookingMode || 'daily';
  const isHourlyOnly    = bookingMode === 'hourly';
  const isBoth          = bookingMode === 'both';

  const [selectedUnit, setSelectedUnit] = useState(isHourlyOnly ? 'hour' : 'day');
  const isHourly = isHourlyOnly || (isBoth && selectedUnit === 'hour');

  const dailyPrice  = isPerKm ? null : (v.pricing?.commonPrice ?? v.pricing?.perDayPrices?.[0]?.price ?? null);
  const hourlyPrice = v.pricing?.pricePerHour ?? null;
  const price       = isHourly ? hourlyPrice : (isPerKm ? (v.pricing?.pricePerKm ?? null) : dailyPrice);

  const defaultPickupTime = v.pickupTime || '08:00';
  const defaultDropTime   = v.dropTime   || '20:00';

  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState(defaultPickupTime);
  const [dropDate,   setDropDate]   = useState('');
  const [dropTime,   setDropTime]   = useState(defaultDropTime);

  const [checked, setChecked] = useState(false);

  const today = todayStr();

  // Full datetime strings for API
  const pickupFull = pickupDate ? `${pickupDate}T${pickupTime}` : '';
  const dropFull   = dropDate   ? `${dropDate}T${dropTime}`     : '';
  const hasSelection = Boolean(pickupFull && dropFull);

  // Duration
  const totalDays = (!isHourly && pickupDate && dropDate)
    ? Math.max(0, Math.round((new Date(dropDate) - new Date(pickupDate)) / 86400000))
    : 0;
  const totalHours = (isHourly && pickupFull && dropFull)
    ? Math.max(0, Math.round((new Date(dropFull) - new Date(pickupFull)) / 3600000))
    : 0;
  const totalUnits = isHourly ? totalHours : totalDays;

  // Fetch blocked periods for calendar display
  const { data: blockedPeriods = [] } = useQuery({
    queryKey: ['vehicle-blocks', v._id],
    queryFn:  () => getVehicleBlockedPeriods(v._id),
    staleTime: 5 * 60 * 1000,
  });

  // Availability check
  const { data: avail, isLoading: checking, refetch } = useQuery({
    queryKey: ['vehicle-avail', v._id, pickupFull, dropFull],
    queryFn:  () => checkVehicleAvailability(v._id, pickupFull, dropFull),
    enabled:  false,
  });

  const handleCheck = () => {
    if (!hasSelection) return;
    setChecked(true);
    refetch();
  };

  const resetDates = () => {
    setChecked(false);
    setPickupDate(''); setPickupTime(defaultPickupTime);
    setDropDate('');   setDropTime(defaultDropTime);
  };

  const handleBook = () => {
    const params = new URLSearchParams({
      type: 'vehicle', slug: v.slug, id: v._id,
      start: pickupFull, end: dropFull,
      bookingUnit: isHourly ? 'hour' : 'day',
    });
    const checkoutUrl = `/checkout?${params.toString()}`;
    if (!isAuth) {
      window.dispatchEvent(new CustomEvent('luxor:require-login', { detail: { redirect: checkoutUrl } }));
      return;
    }
    router.push(checkoutUrl);
  };

  // Partial block warning: selected dates have time-slot restrictions
  const pickupHasPartial = hasPartialBlock(pickupDate, blockedPeriods);
  const dropHasPartial   = hasPartialBlock(dropDate,   blockedPeriods);
  const showPartialWarn  = (pickupHasPartial || dropHasPartial) && !checked;

  return (
    <div className="lg:sticky lg:top-[116px]">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6">

        {/* Price */}
        <div className="mb-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">
            {isPerKm ? 'Per Km Pricing' : 'Starting from'}
          </span>
          <div className="flex items-baseline gap-1 mt-1 flex-wrap">
            {price != null ? (
              <span className="text-3xl font-black text-gray-900">₹{Number(price).toLocaleString('en-IN')}</span>
            ) : (
              <span className="text-lg font-black text-gray-500">Contact for pricing</span>
            )}
            {price != null && (
              <span className="text-gray-400 text-sm">{isPerKm ? '/ km' : isHourly ? '/ hr' : '/ day'}</span>
            )}
            {isPerKm && kmAdvanceAmount > 0 && (
              <span className="text-gray-400 text-sm ml-1">· ₹{Number(kmAdvanceAmount).toLocaleString('en-IN')} advance</span>
            )}
            {isBoth && dailyPrice && hourlyPrice && (
              <span className="text-xs text-gray-400 ml-1">
                {isHourly
                  ? `· ₹${Number(dailyPrice).toLocaleString('en-IN')}/day also`
                  : `· ₹${Number(hourlyPrice).toLocaleString('en-IN')}/hr also`}
              </span>
            )}
          </div>
          {(v.rating != null || v.reviews != null) && (
            <div className="flex items-center gap-1.5 mt-1">
              <StarIcon className="w-3.5 h-3.5 text-[#84cc16]" />
              {v.rating != null && <span className="text-xs font-bold text-gray-700">{v.rating}</span>}
              {v.reviews != null && <span className="text-xs text-gray-400">({v.reviews} reviews)</span>}
            </div>
          )}
        </div>

        {/* Daily / Hourly toggle */}
        {isBoth && (
          <div className="flex gap-1 mb-4">
            {[['day', 'Book by Day'], ['hour', 'Book by Hour']].map(([unit, label]) => (
              <button key={unit}
                onClick={() => { setSelectedUnit(unit); resetDates(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  selectedUnit === unit ? 'bg-[#84cc16] text-gray-900' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── Date + Time Pickers ── */}
        <div className="space-y-2 mb-4">
          <CustomDateTimePicker
            label="Pickup"
            date={pickupDate}
            time={pickupTime}
            minDate={today}
            blockedRanges={blockedPeriods}
            onDateChange={(val) => {
              setPickupDate(val);
              if (dropDate && val >= dropDate) setDropDate('');
              setChecked(false);
            }}
            onTimeChange={(val) => { setPickupTime(val || defaultPickupTime); setChecked(false); }}
          />
          <CustomDateTimePicker
            label="Drop-off"
            date={dropDate}
            time={dropTime}
            minDate={pickupDate || today}
            blockedRanges={blockedPeriods}
            alignRight
            onDateChange={(val) => { setDropDate(val); setChecked(false); }}
            onTimeChange={(val) => { setDropTime(val || defaultDropTime); setChecked(false); }}
          />
        </div>

        {/* Partial block warning */}
        {showPartialWarn && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 mb-3 flex items-start gap-2">
            <span className="text-orange-400 mt-0.5 shrink-0">⚠</span>
            <p className="text-xs text-orange-700">
              Some time slots are blocked on your selected date(s). Check availability to confirm your specific times.
            </p>
          </div>
        )}

        {/* Duration / pricing summary */}
        {isPerKm ? (
          hasSelection && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Advance to pay</span>
                <span className="font-bold text-gray-800">₹{Number(kmAdvanceAmount).toLocaleString('en-IN')}</span>
              </div>
              {!v.driverIncluded && v.driverChargePerDay && totalDays > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Driver ({totalDays} day{totalDays !== 1 ? 's' : ''})</span>
                  <span className="font-bold text-gray-800">₹{(v.driverChargePerDay * totalDays).toLocaleString('en-IN')}</span>
                </div>
              )}
              {v.pricing?.minimumKm && (
                <p className="text-xs text-orange-600 font-medium">Min {v.pricing.minimumKm} km charged per trip</p>
              )}
              <p className="text-xs text-gray-400">Final ride amount calculated after km is recorded</p>
            </div>
          )
        ) : (
          totalUnits > 0 && price != null && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  ₹{Number(price).toLocaleString('en-IN')} × {totalUnits} {isHourly ? `hr${totalUnits !== 1 ? 's' : ''}` : `day${totalUnits !== 1 ? 's' : ''}`}
                </span>
                <span className="font-bold text-gray-800">₹{(price * totalUnits).toLocaleString('en-IN')}</span>
              </div>
              {!isHourly && !v.driverIncluded && v.driverChargePerDay && totalUnits > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Driver ({totalUnits} day{totalUnits !== 1 ? 's' : ''})</span>
                  <span className="font-bold text-gray-800">₹{(v.driverChargePerDay * totalUnits).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          )
        )}

        {/* Minimum warnings */}
        {!isHourly && v.hasMinimumDays && v.minimumDays && (
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
            <CheckBadgeIcon className="w-3.5 h-3.5 text-[#84cc16]" />
            Minimum {v.minimumDays}-day booking required
          </p>
        )}
        {isHourly && v.pricing?.minimumHours > 1 && (
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
            <CheckBadgeIcon className="w-3.5 h-3.5 text-[#84cc16]" />
            Minimum {v.pricing.minimumHours}-hour booking required
          </p>
        )}

        {/* Availability result */}
        {checked && avail && (
          <div className={`rounded-xl px-4 py-3 mb-4 text-sm font-semibold ${
            avail.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {avail.available
              ? '✓ Available for selected dates'
              : `✗ Not available${avail.reason ? ` — ${avail.reason}` : ''}`}
          </div>
        )}

        {/* CTA */}
        {(!checked || !avail) ? (
          <button onClick={handleCheck} disabled={!hasSelection || checking}
            className="w-full cursor-pointer bg-[#84cc16] hover:bg-lime-400 text-gray-900 font-black text-sm uppercase tracking-wider py-4 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
            {checking ? 'Checking...' : 'Check Availability'}
          </button>
        ) : avail.available ? (
          <button onClick={handleBook}
            className="w-full cursor-pointer bg-[#84cc16] hover:bg-lime-400 text-gray-900 font-black text-sm uppercase tracking-wider py-4 rounded-xl transition-all duration-200">
            Book Now
          </button>
        ) : (
          <button onClick={resetDates}
            className="w-full cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm uppercase tracking-wider py-4 rounded-xl transition-all duration-200">
            Choose Different Dates
          </button>
        )}

        <p className="text-[10px] text-gray-400 text-center mt-3">No payment charged until confirmed</p>

        <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5">
          {[
            { label: 'Location', value: [v.city, v.state].filter(Boolean).join(', ') || '—' },
            { label: 'Seats',    value: v.seatingCapacity ? `${v.seatingCapacity} passengers` : '—' },
            v.driverIncluded
              ? { label: 'Driver', value: 'Included' }
              : v.driverChargePerDay
                ? { label: 'Driver', value: `₹${Number(v.driverChargePerDay).toLocaleString('en-IN')} / day extra` }
                : null,
          ].filter(Boolean).map(({ label, value }) => (
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
