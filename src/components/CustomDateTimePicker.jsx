'use client';

import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';

const DAYS   = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const TIMES = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    const hh    = String(h).padStart(2, '0');
    const mm    = String(m).padStart(2, '0');
    const label = `${h % 12 || 12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
    TIMES.push({ value: `${hh}:${mm}`, label });
  }
}

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

function isTimeBlocked(timeValue, selectedDate, blockedRanges) {
  if (!selectedDate || !blockedRanges.length) return false;
  const slotStart = new Date(`${selectedDate}T${timeValue}:00`);
  const slotEnd   = new Date(slotStart.getTime() + 30 * 60 * 1000);
  return blockedRanges.some(b => {
    const bs = new Date(b.startDate);
    const be = new Date(b.endDate);
    return bs < slotEnd && be > slotStart;
  });
}

export default function CustomDateTimePicker({
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate = '',
  blockedRanges = [],
  alignRight = false,
}) {
  const [open, setOpen]  = useState(false);
  const [view, setView]  = useState(() => date ? new Date(date + 'T12:00:00') : new Date());
  const wrapRef          = useRef(null);
  const timeGridRef      = useRef(null);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (open && timeGridRef.current && time) {
      const idx = TIMES.findIndex(t => t.value === time);
      if (idx > -1) timeGridRef.current.children[idx]?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, time]);

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
    onDateChange(dateStr(view.getFullYear(), view.getMonth(), day));
    // keep open so user can also pick time
  };

  const isSelected = (day) => {
    if (!date) return false;
    const s = new Date(date + 'T12:00:00');
    return s.getFullYear() === view.getFullYear() && s.getMonth() === view.getMonth() && s.getDate() === day;
  };

  const isToday = (day) => {
    const t = new Date();
    return t.getFullYear() === view.getFullYear() && t.getMonth() === view.getMonth() && t.getDate() === day;
  };

  const displayDate = date ? dayjs(date + 'T12:00:00').format('D MMM YY') : null;
  const displayTime = time ? TIMES.find(t => t.value === time)?.label : null;
  const hasBlocks   = blockedRanges.length > 0;

  return (
    <div ref={wrapRef} className="relative">

      {/* ── Trigger ── */}
      <div
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3.5 hover:bg-gray-100 transition-colors cursor-pointer select-none"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#84cc16" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5"/>
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
          {displayDate || displayTime ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-sm font-semibold ${displayDate ? 'text-gray-800' : 'text-gray-400'}`}>
                {displayDate || 'Add date'}
              </span>
              {displayTime && (
                <>
                  <span className="text-gray-300 text-xs leading-none">·</span>
                  <span className="text-sm font-semibold text-[#84cc16]">{displayTime}</span>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm font-semibold text-gray-400">Add date &amp; time</p>
          )}
        </div>
        <svg
          className="w-3.5 h-3.5 text-gray-300 shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
        </svg>
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div
          className={`absolute top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-[420px] ${alignRight ? 'right-0' : 'left-0'}`}
          style={{ zIndex: 9999 }}
        >
          <div className="flex">

            {/* ── Calendar panel ── */}
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black text-gray-800">
                  {MONTHS[view.getMonth()]} {view.getFullYear()}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={prevMonth}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/>
                    </svg>
                  </button>
                  <button onClick={nextMonth}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-black text-gray-400 py-1.5">{d}</div>
                ))}
              </div>

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
                        inactive    ? 'text-gray-300 cursor-default' : '',
                        past        ? 'text-gray-300 cursor-not-allowed' : '',
                        fullBlocked && !sel ? 'text-gray-300 cursor-not-allowed line-through bg-gray-50' : '',
                        !disabled && !sel && !today_ ? 'text-gray-700 hover:bg-[#84cc16]/15 cursor-pointer' : '',
                        today_ && !sel ? 'border border-[#84cc16] text-[#0a2535] font-black' : '',
                        sel ? 'font-black text-[#0a2535]' : '',
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
            </div>

            {/* ── Time panel ── */}
            <div className="w-[148px] border-l border-gray-100 flex flex-col">
              <div className="px-3 pt-3 pb-2 flex items-center justify-between shrink-0 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#84cc16" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  </svg>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Time</span>
                </div>
                {time && (
                  <button type="button" onClick={() => onTimeChange('')}
                    className="text-[9px] font-bold text-gray-400 hover:text-gray-600 transition-colors">
                    Clear
                  </button>
                )}
              </div>
              <div
                ref={timeGridRef}
                className="overflow-y-auto flex-1"
                style={{ maxHeight: 260, scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
              >
                <div className="py-1">
                  {TIMES.map((t) => {
                    const selected = t.value === time;
                    const blocked  = isTimeBlocked(t.value, date, blockedRanges);
                    return (
                      <button
                        key={t.value}
                        type="button"
                        disabled={blocked}
                        onClick={() => { if (!blocked) { onTimeChange(t.value); setOpen(false); } }}
                        className={[
                          'w-full text-left px-3 py-2 text-xs font-semibold transition-colors flex items-center justify-between gap-1',
                          blocked  ? 'opacity-40 cursor-not-allowed line-through text-gray-400' : 'cursor-pointer',
                        ].join(' ')}
                        style={{
                          backgroundColor: selected ? '#84cc16' : 'transparent',
                          color:           blocked ? '#9ca3af' : selected ? '#0a2535' : '#374151',
                          fontWeight:      selected ? 900 : 600,
                          textDecoration:  blocked ? 'line-through' : 'none',
                        }}
                        onMouseEnter={(e) => { if (!selected && !blocked) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                        onMouseLeave={(e) => { if (!selected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <span>{t.label}</span>
                        {blocked && <span className="text-[8px] font-black uppercase text-red-400 shrink-0">×</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button type="button"
              onClick={() => { onDateChange(''); onTimeChange(''); setOpen(false); }}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
              Clear all
            </button>
            <button type="button"
              onClick={() => { onDateChange(todayDateStr()); }}
              className="text-xs font-black transition-colors"
              style={{ color: '#84cc16' }}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
