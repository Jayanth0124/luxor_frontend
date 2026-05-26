'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import LocationAutocomplete from './LocationAutocomplete';
import CustomDatePicker from './CustomDatePicker';
import GuestsPopover from './GuestsPopover';

// ─── Minimalist SVG Icons ────────────────────────────────────────────────
const SearchIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const MapPinIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const TargetIcon = ({ className }) => <svg className={className || "w-4 h-4 text-[#84cc16]"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v4M12 18v4M2 12h4M18 12h4" /></svg>;
const CalendarIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;

// ─── Premium Location Popover ───────────────────────────────────────────
function LocationPopover({ isOpen, onClose, location, setLocation, handleGeoLocation }) {
  // Auto-focus the input when the popover opens so users can type immediately
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const input = document.querySelector('.location-popover-input input');
        if (input) input.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute bottom-full left-0 mb-4 bg-white/95 backdrop-blur-3xl border border-gray-100 rounded-[2rem] p-4 shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.15)] w-[360px] lg:w-[420px] z-50 origin-bottom flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Search Input Container ── */}
      <div className="location-popover-input bg-gray-50 rounded-[1.25rem] border border-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#84cc16]/20 transition-all p-1">
        <LocationAutocomplete
          value={location}
          onChange={(val) => setLocation(val)}
          onSelect={({ display }) => { setLocation(display); onClose(); }}
          placeholder="Search destinations..."
          wrapperClassName="flex items-center gap-3 px-4 py-3 bg-transparent"
          inputClassName="w-full bg-transparent outline-none text-gray-900 font-semibold placeholder:text-gray-400 placeholder:font-normal"
          hideIcon={false}
          hideLabel={true}
          dropdownClassName="absolute bottom-full left-0 mb-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.12)] overflow-hidden"
        />
      </div>

      <div className="h-px bg-gray-100 my-3 mx-2" />

      {/* ── Current Location Interactive Row ── */}
      <button
        type="button"
        onClick={() => { handleGeoLocation(); onClose(); }}
        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-[1.25rem] transition-colors text-left group"
      >
        <div className="w-12 h-12 rounded-full bg-lime-50 flex items-center justify-center shrink-0 group-hover:bg-[#84cc16] transition-colors shadow-sm border border-lime-100 group-hover:border-[#84cc16]">
          <TargetIcon className="w-5 h-5 text-[#84cc16] group-hover:text-white transition-colors" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 group-hover:text-[#84cc16] transition-colors">Use Current Location</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Detect your live location automatically</p>
        </div>
      </button>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function SearchBar({ tab: externalTab, onTabChange }) {
  const router = useRouter();
  const [internalTab, setInternalTab] = useState('vehicle');
  const tab = externalTab !== undefined ? externalTab : internalTab;
  const setTab = (v) => { setInternalTab(v); onTabChange?.(v); };

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null);
  const containerRef = useRef(null);

  // Form State
  const [location, setLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [guests, setGuests] = useState(2);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        setLocation('Current Location');
      });
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('search', location);
    if (pickupDate) params.set(tab === 'vehicle' ? 'pickupDate' : 'checkin', pickupDate);
    if (dropoffDate) params.set(tab === 'vehicle' ? 'dropDate' : 'checkout', dropoffDate);
    if (tab === 'campsite' && guests > 1) params.set('guests', guests);
    router.push(`/${tab}s?${params.toString()}`);
  };

  // Dynamic Formatting based on tab
  const dateFormatString = tab === 'vehicle' ? 'MMM D, h:mm A' : 'MMM D, YYYY';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center z-20 relative" ref={containerRef}>

      {/* ── Premium Animated Segmented Control ── */}
      {externalTab === undefined && (
        <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1.5 mb-8 border border-white/10 shadow-2xl">
          {['vehicle', 'campsite'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-8 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-colors z-10"
            >
              {tab === t && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-full shadow-lg z-[-1]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={tab === t ? "text-gray-900" : "text-white/80 hover:text-white"}>
                {t === 'vehicle' ? 'Vehicles' : 'Campsites'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── The Floating Luxury Booking Surface (Airbnb Style) ── */}
      <div className="bg-white rounded-[2rem] shadow-[0_16px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col lg:flex-row items-center w-full relative">

        {/* Location Trigger */}
        <div
          onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
          className="flex-1 w-full lg:w-auto px-8 py-4 lg:py-5 hover:bg-gray-50 rounded-[2rem] cursor-pointer transition-colors relative flex items-center group"
        >
          <div className="mr-4"><MapPinIcon /></div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-800 mb-1">
              {tab === 'vehicle' ? 'Pick-up Location' : 'Destination'}
            </p>
            <p className={`text-sm font-medium truncate ${location ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
              {location || 'Where are you going?'}
            </p>
          </div>
          <AnimatePresence>
            <LocationPopover
              isOpen={activeDropdown === 'location'}
              onClose={() => setActiveDropdown('start')} // Automatically advances to 'Pick-up Date'
              location={location}
              setLocation={setLocation}
              handleGeoLocation={handleGeoLocation}
            />
          </AnimatePresence>
        </div>

        <div className="hidden lg:block w-px h-12 bg-gray-200" />

        {/* Date: Start */}
        <div
          onClick={() => setActiveDropdown(activeDropdown === 'start' ? null : 'start')}
          className="flex-1 w-full lg:w-auto px-8 py-4 lg:py-5 hover:bg-gray-50 rounded-[2rem] cursor-pointer transition-colors relative flex items-center"
        >
          <div className="mr-4"><CalendarIcon /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-800 mb-1">
              {tab === 'vehicle' ? 'Pick-up Date' : 'Check in'}
            </p>
            <p className={`text-sm font-medium ${pickupDate ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
              {pickupDate ? dayjs(pickupDate).format(dateFormatString) : 'Add dates'}
            </p>
          </div>
          <AnimatePresence>
            <CustomDatePicker
              isOpen={activeDropdown === 'start'}
              onClose={() => setActiveDropdown('end')}
              selectedDate={pickupDate}
              onSelect={setPickupDate}
              showTime={true}
            />
          </AnimatePresence>
        </div>

        <div className="hidden lg:block w-px h-12 bg-gray-200" />

        {/* Date: End */}
        <div
          onClick={() => setActiveDropdown(activeDropdown === 'end' ? null : 'end')}
          className="flex-1 w-full lg:w-auto px-8 py-4 lg:py-5 hover:bg-gray-50 rounded-[2rem] cursor-pointer transition-colors relative flex items-center"
        >
          <div className="mr-4"><CalendarIcon /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-800 mb-1">
              {tab === 'vehicle' ? 'Drop-off Date' : 'Check out'}
            </p>
            <p className={`text-sm font-medium ${dropoffDate ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
              {dropoffDate ? dayjs(dropoffDate).format(dateFormatString) : 'Add dates'}
            </p>
          </div>
          <AnimatePresence>
            <CustomDatePicker
              isOpen={activeDropdown === 'end'}
              onClose={() => setActiveDropdown(tab === 'campsite' ? 'guests' : null)}
              selectedDate={dropoffDate}
              onSelect={setDropoffDate}
              minDate={pickupDate}
              showTime={true}
            />
          </AnimatePresence>
        </div>

        {tab === 'campsite' && (
          <>
            <div className="hidden lg:block w-px h-12 bg-gray-200" />

            {/* Guests Selector */}
            <div
              onClick={() => setActiveDropdown(activeDropdown === 'guests' ? null : 'guests')}
              className="flex-1 w-full lg:w-auto px-8 py-4 lg:py-5 hover:bg-gray-50 rounded-[2rem] cursor-pointer transition-colors relative flex items-center"
            >
              <div className="mr-4"><UsersIcon /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-800 mb-1">Guests</p>
                <p className="text-sm font-medium text-gray-900">{guests} Guest{guests > 1 ? 's' : ''}</p>
              </div>
              <AnimatePresence>
                <GuestsPopover
                  isOpen={activeDropdown === 'guests'}
                  guests={guests}
                  onChange={setGuests}
                />
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Floating Premium Search CTA */}
        <div className="p-3 w-full lg:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 lg:py-5 lg:px-10 bg-[#84cc16] text-gray-900 rounded-[1.5rem] font-bold text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(132,204,22,0.35)] hover:shadow-[0_8px_30px_rgba(132,204,22,0.5)] transition-shadow duration-300 relative overflow-hidden group"
          >
            {/* Subtle Shine Effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            <SearchIcon />
            <span>Search</span>
          </motion.button>
        </div>

      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}