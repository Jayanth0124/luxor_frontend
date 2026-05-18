'use client';

import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';

const DAYS   = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const CalIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#84cc16" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5"/>
  </svg>
);

function buildGrid(year, month) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, type: 'prev' });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, type: 'cur' });
  while (cells.length < 42)
    cells.push({ day: cells.length - firstDay - daysInMonth + 1, type: 'next' });
  return cells;
}

/** Returns 'full' | 'partial' | 'none' for a given calendar day */
function getBlockStatus(year, month, day, blockedRanges) {
  if (!blockedRanges.length) return 'none';
  const dayStart = new Date(year, month, day).getTime();
  const dayEnd   = new Date(year, month, day + 1).getTime();
  let partial = false;
  for (const b of blockedRanges) {
    const bs = new Date(b.startDate).getTime();
    const be = new Date(b.endDate).getTime();
    if (bs < dayEnd && be > dayStart) {
      if (bs <= dayStart && be >= dayEnd) return 'full';
      partial = true;
    }
  }
  return partial ? 'partial' : 'none';
}

export default function CustomDatePicker({
  label,
  value,
  onChange,
  alignRight = false,
  blockedRanges = [],
  minDate = '',
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => value ? new Date(value + 'T12:00:00') : new Date());
  const wrapRef         = useRef(null);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const prevMonth = () => setView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  const nextMonth = () => setView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1));

  const dateStr = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const todayDateStr = () => {
    const t = new Date();
    return dateStr(t.getFullYear(), t.getMonth(), t.getDate());
  };

  const isPast = (day) => {
    if (!minDate) return false;
    return dateStr(view.getFullYear(), view.getMonth(), day) < minDate;
  };

  const pickDay = (day) => {
    onChange(dateStr(view.getFullYear(), view.getMonth(), day));
    setOpen(false);
  };

  const isSelected = (day) => {
    if (!value) return false;
    const s = new Date(value + 'T12:00:00');
    return s.getFullYear() === view.getFullYear() && s.getMonth() === view.getMonth() && s.getDate() === day;
  };

  const isToday = (day) => {
    const t = new Date();
    return t.getFullYear() === view.getFullYear() && t.getMonth() === view.getMonth() && t.getDate() === day;
  };

  const display = value ? dayjs(value + 'T12:00:00').format('D MMM YY') : null;
  const hasBlocks = blockedRanges.length > 0;

  return (
    <div ref={wrapRef} className="relative">

      {/* ── Trigger ── */}
      <div
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3.5 hover:bg-gray-100 transition-colors cursor-pointer select-none"
      >
        <CalIcon />
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
          <p className={`text-sm font-semibold truncate ${display ? 'text-gray-800' : 'text-gray-400'}`}>
            {display || 'Add date'}
          </p>
        </div>
        <svg
          className="w-3.5 h-3.5 text-gray-300 shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
        </svg>
      </div>

      {/* ── Calendar dropdown ── */}
      {open && (
        <div
          className={`absolute top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 ${alignRight ? 'right-0' : 'left-0'}`}
          style={{ zIndex: 9999 }}
        >
          {/* Month header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-black text-gray-800">
              {MONTHS[view.getMonth()]} {view.getFullYear()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/>
                </svg>
              </button>
              <button
                onClick={nextMonth}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-black text-gray-400 py-1.5">{d}</div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {buildGrid(view.getFullYear(), view.getMonth()).map((cell, i) => {
              const inactive    = cell.type !== 'cur';
              const past        = !inactive && isPast(cell.day);
              const sel         = !inactive && isSelected(cell.day);
              const today_      = !inactive && isToday(cell.day);
              const blockStatus = (!inactive && !past)
                ? getBlockStatus(view.getFullYear(), view.getMonth(), cell.day, blockedRanges)
                : 'none';
              const fullBlocked = blockStatus === 'full';
              const partial     = blockStatus === 'partial';
              const disabled    = inactive || past || fullBlocked;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && pickDay(cell.day)}
                  title={fullBlocked ? 'Not available' : partial ? 'Some time slots unavailable' : undefined}
                  className={[
                    'relative flex flex-col items-center justify-center rounded-full text-xs font-semibold transition-colors py-1',
                    inactive   ? 'text-gray-300 cursor-default'                                         : '',
                    past       ? 'text-gray-300 cursor-not-allowed'                                     : '',
                    fullBlocked && !sel ? 'text-gray-300 cursor-not-allowed line-through bg-gray-50'    : '',
                    !disabled && !sel && !today_ ? 'text-gray-700 hover:bg-[#84cc16]/15 cursor-pointer' : '',
                    today_ && !sel ? 'border border-[#84cc16] text-[#0a2535] font-black'                : '',
                    sel ? 'font-black text-[#0a2535]'                                                   : '',
                  ].join(' ')}
                  style={sel ? { backgroundColor: '#84cc16' } : {}}
                >
                  {cell.day}
                  {partial && !sel && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          {hasBlocks && (
            <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-200 inline-block shrink-0" />
                <span className="text-[9px] text-gray-400">Unavailable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block shrink-0" />
                <span className="text-[9px] text-gray-400">Partial slots blocked</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => { onChange(todayDateStr()); setOpen(false); }}
              className="text-xs font-black transition-colors"
              style={{ color: '#84cc16' }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
