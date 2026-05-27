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

export default function CustomDatePicker({ isOpen, onClose, onAdvance, selectedDate, onSelect, minDate, showTime = true }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [placement, setPlacement] = useState('up');
  const timeScrollRef = useRef(null);
  const containerRef = useRef(null);

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
        const itemWidth = 60; // Adjusted for smaller time pill width
        timeScrollRef.current.scrollLeft = (selectedIndex * itemWidth) - 80;
      }
    }
  }, [isOpen, selectedTime, showTime]);

  useEffect(() => {
    const handlePositioning = () => {
      if (isOpen && containerRef.current) {
        const parent = containerRef.current.parentNode;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const spaceBelowViewport = viewportHeight - parentRect.bottom;
          const spaceAboveViewport = parentRect.top;
          
          // Total document space below the parent bottom
          const docScrollY = window.scrollY || document.documentElement.scrollTop;
          const totalDocHeight = document.documentElement.scrollHeight;
          const spaceBelowDocument = totalDocHeight - (docScrollY + parentRect.bottom);
          
          const requiredSpace = showTime ? 320 : 250;
          
          // If we are at the top of the page (scrollY is small), prefer downward opening if document space below exists
          if (docScrollY < 100 && spaceBelowDocument >= requiredSpace) {
            setPlacement('down');
          } else if (spaceBelowViewport >= requiredSpace) {
            setPlacement('down');
          } else if (spaceAboveViewport >= requiredSpace) {
            setPlacement('up');
          } else {
            // Fallback: choose the side with more space
            if (spaceBelowViewport + spaceBelowDocument > spaceAboveViewport) {
              setPlacement('down');
            } else {
              setPlacement('up');
            }
          }
        }
      }
    };

    handlePositioning();
    window.addEventListener('resize', handlePositioning);
    window.addEventListener('scroll', handlePositioning, { passive: true });

    return () => {
      window.removeEventListener('resize', handlePositioning);
      window.removeEventListener('scroll', handlePositioning);
    };
  }, [isOpen, showTime]);



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
      if (onAdvance) {
        onAdvance();
      } else if (onClose) {
        onClose();
      }
    }
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
    if (onAdvance) {
      onAdvance();
    } else if (onClose) {
      onClose();
    }
  };

  const selectedDatePart = selectedDate ? selectedDate.split(' ')[0] : null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: placement === 'up' ? 10 : -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: placement === 'up' ? 10 : -10, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`absolute left-0 bg-white border border-gray-100 rounded-2xl p-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] w-[240px] z-50 overflow-hidden flex flex-col font-sans ring-1 ring-black/5 ${
        placement === 'up' 
          ? 'bottom-full mb-3 origin-bottom shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.15)]' 
          : 'top-full mt-3 origin-top shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)]'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="font-black text-gray-900 text-sm tracking-tight">{currentMonth.format('MMM YYYY')}</span>
        <div className="flex items-center gap-1 bg-gray-100/50 rounded-full p-0.5 border border-gray-200/50">
          <button
            type="button"
            onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
            className="w-6 h-6 rounded-full hover:bg-white flex items-center justify-center transition-all shadow-sm text-gray-500 hover:text-gray-900"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
            className="w-6 h-6 rounded-full hover:bg-white flex items-center justify-center transition-all shadow-sm text-gray-500 hover:text-gray-900"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* ── Days of Week ── */}
      <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-[8px] font-black uppercase tracking-widest text-[#84cc16] opacity-80">{d}</div>
        ))}
      </div>

      {/* ── Calendar Grid ── */}
      <div className="grid grid-cols-7 gap-0.5 text-center mb-2">
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
              // Reduced button height (h-6) and text size (text-[11px])
              className={`h-6 w-full rounded-md flex items-center justify-center text-[11px] font-semibold transition-all duration-300 relative ${isSelected
                  ? 'bg-gradient-to-br from-[#84cc16] to-[#65a30d] text-white shadow-[0_2px_8px_rgba(132,204,22,0.4)] scale-105 z-10 border border-[#84cc16]'
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

      {/* ── Time Slider ── */}
      {showTime && (
        <div className="border-t border-gray-100 pt-2 pb-1 mb-1">
          <div className="flex items-center gap-1 px-1 mb-1.5">
            <svg className="w-3 h-3 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-800">Time</span>
          </div>

          <div
            ref={timeScrollRef}
            className="flex gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none scroll-smooth snap-x select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TIME_SLOTS.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={(e) => handleTimeSelect(time, e)}
                  // Shrunk padding (px-2 py-1) and text (text-[10px])
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all shrink-0 snap-center border ${isSelected
                      ? 'bg-gray-900 text-white border-transparent shadow-sm scale-105'
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

      {/* ── Footer ── */}
      <div className="pt-1 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(''); onClose(); }}
          className="text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider"
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
          className="text-[10px] font-black transition-colors uppercase tracking-widest text-[#84cc16] hover:text-[#65a30d]"
        >
          Today
        </button>
      </div>
    </motion.div>
  );
}