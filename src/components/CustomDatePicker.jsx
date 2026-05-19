import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const TIME_SLOTS = [];
for (let i = 8; i <= 22; i++) { // 8 AM to 10 PM
  const hour = i > 12 ? i - 12 : i;
  const ampm = i < 12 ? 'AM' : 'PM';
  TIME_SLOTS.push(`${hour}:00 ${ampm}`);
  TIME_SLOTS.push(`${hour}:30 ${ampm}`);
}

export default function CustomDatePicker({ isOpen, onClose, selectedDate, onSelect, minDate, showTime = true }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const timeScrollRef = useRef(null);

  useEffect(() => {
    if (selectedDate && selectedDate.includes(' ')) {
      const timePart = selectedDate.split(' ').slice(1).join(' ');
      if (timePart) setSelectedTime(timePart);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (isOpen && timeScrollRef.current && showTime) {
      const selectedIndex = TIME_SLOTS.indexOf(selectedTime);
      if (selectedIndex !== -1) {
        const itemWidth = 84;
        timeScrollRef.current.scrollLeft = (selectedIndex * itemWidth) - 100;
      }
    }
  }, [isOpen, selectedTime, showTime]);

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf('month').day();
  const blanks = Array.from({ length: firstDayOfMonth });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (!isOpen) return null;

  const handleDateSelect = (dateStr) => {
    if (showTime) {
      onSelect(`${dateStr} ${selectedTime}`);
    } else {
      onSelect(dateStr);
    }
    if (onClose) onClose();
  };

  const handleTimeSelect = (timeStr, e) => {
    e.stopPropagation();
    setSelectedTime(timeStr);
    if (selectedDate) {
      const datePart = selectedDate.split(' ')[0] || selectedDate;
      onSelect(`${datePart} ${timeStr}`);
    } else {
      const todayStr = dayjs().format('YYYY-MM-DD');
      onSelect(`${todayStr} ${timeStr}`);
    }
  };

  const selectedDatePart = selectedDate ? selectedDate.split(' ')[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute bottom-full left-0 mb-4 bg-white/80 backdrop-blur-3xl border border-white/40 rounded-[1.5rem] p-4 shadow-[0_-30px_60px_-10px_rgba(0,0,0,0.15)] w-[280px] z-50 origin-bottom overflow-hidden flex flex-col font-sans ring-1 ring-black/5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Unique Header Design ── */}
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="font-black text-gray-900 text-lg tracking-tight">{currentMonth.format('MMMM YYYY')}</span>
        <div className="flex items-center gap-1 bg-gray-100/50 rounded-full p-0.5 border border-gray-200/50">
          <button
            type="button"
            onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
            className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center transition-all shadow-sm text-gray-500 hover:text-gray-900"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
            className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center transition-all shadow-sm text-gray-500 hover:text-gray-900"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* ── Days of Week ── */}
      <div className="grid grid-cols-7 gap-y-2 text-center mb-1.5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <div key={i} className="text-[9px] font-black uppercase tracking-widest text-[#84cc16] opacity-80">{d}</div>
        ))}
      </div>

      {/* ── Premium Calendar Grid ── */}
      <div className="grid grid-cols-7 gap-1 text-center mb-3">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(day => {
          const date = currentMonth.date(day);
          const dateStr = date.format('YYYY-MM-DD');
          const isSelected = selectedDatePart && dateStr === selectedDatePart;
          const isPast = date.isBefore(dayjs().startOf('day'));
          const isBeforeMinDate = minDate && date.isBefore(dayjs(minDate).startOf('day'));
          const disabled = isPast || isBeforeMinDate;
          const isToday = date.isSame(dayjs(), 'day');

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => handleDateSelect(dateStr)}
              className={`h-8 w-full rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-300 relative ${isSelected
                  ? 'bg-gradient-to-br from-[#84cc16] to-[#65a30d] text-white shadow-[0_4px_10px_rgba(132,204,22,0.3)] scale-105 z-10 border border-[#84cc16]'
                  : disabled
                    ? 'text-gray-300 cursor-not-allowed bg-transparent'
                    : isToday
                      ? 'text-[#84cc16] bg-lime-50/50 hover:bg-lime-100 border border-lime-200'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:scale-105 border border-transparent'
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* ── Horizontal Time Slider (Only shows if showTime is true) ── */}
      {showTime && (
        <div className="border-t border-gray-100 pt-3 pb-2 mb-1">
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <svg className="w-3.5 h-3.5 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-800">Pick a Time</span>
          </div>

          <div
            ref={timeScrollRef}
            className="flex gap-2 overflow-x-auto py-1.5 px-1 scrollbar-none scroll-smooth snap-x select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TIME_SLOTS.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={(e) => handleTimeSelect(time, e)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 snap-center border ${isSelected
                      ? 'bg-gray-900 text-white border-transparent shadow-md scale-105'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-900 hover:text-gray-900'
                    }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Footer Actions ── */}
      <div className="pt-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(''); onClose(); }}
          className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const todayStr = dayjs().format('YYYY-MM-DD');
            handleDateSelect(todayStr);
          }}
          className="text-xs font-black transition-colors uppercase tracking-widest text-[#84cc16] hover:text-[#65a30d]"
        >
          Today
        </button>
      </div>
    </motion.div>
  );
}