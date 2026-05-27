'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/authSlice';
import { AnimatePresence } from 'framer-motion';
import CustomDatePicker from '@/components/CustomDatePicker';

export default function VehicleBookingCard({ vehicle }) {
  const router = useRouter();
  const isAuth = useSelector(selectIsAuthenticated);
  const v = vehicle;

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupOpen, setPickupOpen] = useState(false);
  const [dropoffOpen, setDropoffOpen] = useState(false);

  const price = v.pricing?.commonPrice ?? v.pricing?.perDayPrices?.[0]?.price ?? 0;

  const handleBooking = () => {
    if (!pickup || !dropoff) return;
    const checkoutUrl = `/checkout?vehicle=${v._id}&start=${pickup}&end=${dropoff}`;
    if (!isAuth) {
      window.dispatchEvent(new CustomEvent('luxor:require-login', { detail: { redirect: checkoutUrl } }));
      return;
    }
    router.push(checkoutUrl);
  };

  return (
    <div className="lg:sticky lg:top-[116px]">
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] p-6 md:p-8 relative overflow-visible">
        
        {/* Subtle background glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#84cc16]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Dynamic Pricing Header */}
        <div className="mb-8 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#84cc16] mb-1">RESERVATION</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-gray-900 tracking-tight leading-none">
              ₹{Number(price).toLocaleString('en-IN')}
            </span>
            <span className="text-gray-400 font-semibold text-xs mb-1">/ day</span>
          </div>
        </div>

        {/* Date Matrix */}
        <div className="grid grid-cols-1 gap-4 mb-6 relative z-20">
          <div className="relative">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 mb-1.5 ml-1">PICK-UP</p>
            <button
              onClick={() => { setPickupOpen(!pickupOpen); setDropoffOpen(false); }}
              className="w-full bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-100 rounded-2xl p-3 md:p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className={`text-sm font-bold tracking-tight ${pickup ? 'text-gray-900' : 'text-gray-400'}`}>
                  {pickup || 'Add date & time'}
                </span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={pickupOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} /></svg>
            </button>
            <AnimatePresence>
              {pickupOpen && (
                <CustomDatePicker
                  isOpen={pickupOpen}
                  onClose={() => setPickupOpen(false)}
                  selectedDate={pickup}
                  onSelect={setPickup}
                  showTime={true}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 mb-1.5 ml-1">DROP-OFF</p>
            <button
              onClick={() => { setDropoffOpen(!dropoffOpen); setPickupOpen(false); }}
              className="w-full bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-100 rounded-2xl p-3 md:p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className={`text-sm font-bold tracking-tight ${dropoff ? 'text-gray-900' : 'text-gray-400'}`}>
                  {dropoff || 'Add date & time'}
                </span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={dropoffOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} /></svg>
            </button>
            <AnimatePresence>
              {dropoffOpen && (
                <CustomDatePicker
                  isOpen={dropoffOpen}
                  onClose={() => setDropoffOpen(false)}
                  selectedDate={dropoff}
                  onSelect={setDropoff}
                  minDate={pickup ? pickup.split(' ')[0] : undefined}
                  showTime={true}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mb-6 space-y-3 relative z-10">
          <div className="bg-lime-50 border border-[#84cc16]/30 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#84cc16] flex items-center justify-center shrink-0 shadow-lg shadow-[#84cc16]/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Available</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">Instant Confirmation</p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Interstate Travel</span>
            <span className="text-sm font-bold text-gray-900">{v.allowsOutsideState ? 'Allowed' : 'Restricted'}</span>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="relative z-10">
          <button
            onClick={handleBooking}
            disabled={!pickup || !dropoff}
            className="w-full relative overflow-hidden group bg-[#84cc16] hover:bg-[#74b814] disabled:bg-gray-200 text-gray-900 disabled:text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_-10px_rgba(132,204,22,0.4)] hover:shadow-[0_15px_30px_-10px_rgba(132,204,22,0.5)] hover:-translate-y-0.5"
          >
            <span className="relative z-10">Reserve Vehicle</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
          </button>
        </div>

        <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest mt-5 relative z-10">
          No charges apply until confirmation
        </p>
      </div>
    </div>
  );
}