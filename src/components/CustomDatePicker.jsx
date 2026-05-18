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

  // Initialize selected time from selectedDate if it contains one
  useEffect(() => {
    if (selectedDate && selectedDate.includes(' ')) {
      const timePart = selectedDate.split(' ').slice(1).join(' ');
      if (timePart) setSelectedTime(timePart);
    }
  }, [selectedDate]);

  // Center/scroll to selected time on open
  useEffect(() => {
    if (isOpen && timeScrollRef.current) {
      const selectedIndex = TIME_SLOTS.indexOf(selectedTime);
      if (selectedIndex !== -1) {
        const itemWidth = 84; // width of time pill + margin
        timeScrollRef.current.scrollLeft = (selectedIndex * itemWidth) - 100;
      }
    }
  }, [isOpen, selectedTime]);

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
  };

  const handleTimeSelect = (timeStr, e) => {
    e.stopPropagation();
    setSelectedTime(timeStr);
    if (selectedDate) {
      const datePart = selectedDate.split(' ')[0] || selectedDate;
      onSelect(`${datePart} ${timeStr}`);
    } else {
      // If no date is selected yet, select today's date with this time
      const todayStr = dayjs().format('YYYY-MM-DD');
      onSelect(`${todayStr} ${timeStr}`);
    }
  };

  const selectedDatePart = selectedDate ? selectedDate.split(' ')[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full left-0 mt-3 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] w-[320px] z-50 origin-top overflow-hidden flex flex-col font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Header: Month & Year switcher ── */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-gray-800 text-base tracking-tight">{currentMonth.format('MMMM YYYY')}</span>
        <div className="flex items-center gap-0.5">
          <button 
            type="button"
            onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))} 
            className="w-8 h-8 rounded-full hover:bg-gray-100/80 flex items-center justify-center transition-colors active:scale-95"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            type="button"
            onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))} 
            className="w-8 h-8 rounded-full hover:bg-gray-100/80 flex items-center justify-center transition-colors active:scale-95"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* ── Days of Week ── */}
      <div className="grid grid-cols-7 gap-y-2 text-center mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
          <div key={i} className="text-[11px] font-medium text-gray-400 tracking-wider">{d}</div>
        ))}
      </div>

      {/* ── Calendar Grid ── */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-0.5 text-center mb-4">
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
              className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 relative ${
                isSelected
                  ? 'bg-[#84cc16] text-white shadow-sm shadow-lime-500/20'
                  : disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : isToday 
                      ? 'text-[#84cc16] hover:bg-lime-50 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isToday && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#84cc16]" />
              )}
              {day}
            </button>
          );
        })}
      </div>

      {/* ── Unique, Premium Horizontal Time Slider ── */}
      {showTime && (
        <div className="border-t border-gray-50 pt-3 pb-2 mb-2">
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Select Time</span>
          </div>

          <div 
            ref={timeScrollRef} 
            className="flex gap-2 overflow-x-auto py-1 px-0.5 scrollbar-none scroll-smooth snap-x select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TIME_SLOTS.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={(e) => handleTimeSelect(time, e)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 snap-center border ${
                    isSelected 
                      ? 'bg-[#84cc16] text-white border-transparent shadow-sm shadow-lime-500/10' 
                      : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(''); onClose(); }}
          className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={(e) => { 
            e.stopPropagation(); 
            const todayStr = dayjs().format('YYYY-MM-DD');
            handleDateSelect(todayStr);
          }}
          className="text-xs font-bold text-[#84cc16] hover:text-[#65a30d] transition-colors"
        >
          Today
        </button>
      </div>
    </motion.div>
  );
}
