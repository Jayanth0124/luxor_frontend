'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomDateTimePicker from './CustomDateTimePicker';
import CustomDatePicker from './CustomDatePicker';
import LocationAutocomplete from './LocationAutocomplete';
import { UsersIcon, CarIcon, TentIcon, SearchIcon } from '@/assets/icons';

/* ─── Guests stepper ─────────────────────────────────────────────────── */
function GuestsField({ value, onChange }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3.5">
      <UsersIcon className="w-4 h-4 shrink-0" stroke="#84cc16" />
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Guests</p>
        <p className="text-sm font-semibold text-gray-800">{value} Guest{value > 1 ? 's' : ''}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" onClick={() => onChange(Math.max(1, value - 1))}
          className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 font-bold transition-colors text-base leading-none cursor-pointer">
          −
        </button>
        <span className="text-sm font-black text-gray-800 w-5 text-center tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(20, value + 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-900 font-bold transition-colors text-base leading-none bg-[#84cc16] hover:bg-lime-400 cursor-pointer">
          +
        </button>
      </div>
    </div>
  );
}

/* ─── Search button ───────────────────────────────────────────────────── */
function SearchBtn({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full lg:w-auto h-full flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
      style={{ backgroundColor: '#84cc16', color: '#111827', minHeight: 56 }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a3e635'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#84cc16'; }}
    >
      <SearchIcon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */
export default function SearchBar({ tab: externalTab, onTabChange }) {
  const router = useRouter();
  const [internalTab, setInternalTab] = useState('vehicle');
  const tab    = externalTab !== undefined ? externalTab : internalTab;
  const setTab = (v) => { setInternalTab(v); onTabChange?.(v); };

  // Vehicle form state
  const [v, setV] = useState({
    pickupDisplay: '', pickupCity: '', pickupState: '',
    dropoffDisplay: '', dropoffCity: '', dropoffState: '',
    pickupDate: '', pickupTime: '', dropDate: '', dropTime: '',
  });

  // Campsite form state
  const [c, setC] = useState({
    locationDisplay: '', locationCity: '', locationState: '',
    checkin: '', checkout: '', guests: 2,
  });

  const handleVehicleSearch = () => {
    const params = new URLSearchParams();
    if (v.pickupCity)   params.set('city',  v.pickupCity);
    if (v.pickupState)  params.set('state', v.pickupState);
    if (!v.pickupCity && !v.pickupState && v.pickupDisplay) params.set('search', v.pickupDisplay);
    if (v.pickupDate)   params.set('pickupDate',  v.pickupDate);
    if (v.dropDate)     params.set('dropDate',    v.dropDate);
    router.push(`/vehicles?${params.toString()}`);
  };

  const handleCampsiteSearch = () => {
    const params = new URLSearchParams();
    if (c.locationCity)  params.set('city',  c.locationCity);
    if (c.locationState) params.set('state', c.locationState);
    if (!c.locationCity && !c.locationState && c.locationDisplay) params.set('search', c.locationDisplay);
    if (c.checkin)  params.set('checkin',  c.checkin);
    if (c.checkout) params.set('checkout', c.checkout);
    if (c.guests > 1) params.set('guests', c.guests);
    router.push(`/campsites?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-visible">

      {/* ── Tabs ── */}
      <div className="grid grid-cols-2 border-b border-gray-100 rounded-t-2xl overflow-hidden">
        {[
          { key: 'vehicle',  label: 'Book a Vehicle',  Icon: CarIcon  },
          { key: 'campsite', label: 'Book a Campsite', Icon: TentIcon },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="flex items-center justify-center gap-2 py-4 text-sm font-black uppercase tracking-wide transition-all cursor-pointer"
            style={{
              color:        tab === key ? '#111827' : '#9ca3af',
              borderBottom: tab === key ? '3px solid #84cc16' : '3px solid transparent',
            }}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Fields ── */}
      <div className="p-3 lg:p-4">
        {tab === 'vehicle' ? (
          <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2">
            <LocationAutocomplete
              label="Pickup Location"
              value={v.pickupDisplay}
              onChange={(val) => setV((f) => ({ ...f, pickupDisplay: val }))}
              onSelect={({ city, state, display }) => setV((f) => ({ ...f, pickupDisplay: display, pickupCity: city, pickupState: state }))}
              placeholder="City or airport"
            />
            <LocationAutocomplete
              label="Drop-off Location"
              value={v.dropoffDisplay}
              onChange={(val) => setV((f) => ({ ...f, dropoffDisplay: val }))}
              onSelect={({ city, state, display }) => setV((f) => ({ ...f, dropoffDisplay: display, dropoffCity: city, dropoffState: state }))}
              placeholder="City or airport"
            />
            <CustomDateTimePicker
              label="Pickup"
              date={v.pickupDate}
              time={v.pickupTime}
              onDateChange={(val) => setV((f) => ({ ...f, pickupDate: val }))}
              onTimeChange={(val) => setV((f) => ({ ...f, pickupTime: val }))}
            />
            <CustomDateTimePicker
              label="Drop-off"
              date={v.dropDate}
              time={v.dropTime}
              minDate={v.pickupDate}
              alignRight
              onDateChange={(val) => setV((f) => ({ ...f, dropDate: val }))}
              onTimeChange={(val) => setV((f) => ({ ...f, dropTime: val }))}
            />
            <div className="col-span-2 lg:col-span-1">
              <SearchBtn label="Find Vehicle" onClick={handleVehicleSearch} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-2">
            <div className="col-span-2 lg:col-span-1">
              <LocationAutocomplete
                label="Destination"
                value={c.locationDisplay}
                onChange={(val) => setC((f) => ({ ...f, locationDisplay: val }))}
                onSelect={({ city, state, display }) => setC((f) => ({ ...f, locationDisplay: display, locationCity: city, locationState: state }))}
                placeholder="State, city or campsite"
              />
            </div>
            <CustomDatePicker label="Check-in"  value={c.checkin}  onChange={(val) => setC((f) => ({ ...f, checkin: val }))} />
            <CustomDatePicker label="Check-out" value={c.checkout} onChange={(val) => setC((f) => ({ ...f, checkout: val }))} alignRight />
            <GuestsField value={c.guests} onChange={(val) => setC((f) => ({ ...f, guests: val }))} />
            <div className="col-span-2 lg:col-span-1">
              <SearchBtn label="Find Campsite" onClick={handleCampsiteSearch} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
