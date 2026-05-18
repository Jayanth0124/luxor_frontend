'use client';

import { useState, useRef, useEffect } from 'react';

const TIMES = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const label = `${h % 12 || 12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
    TIMES.push({ value: `${hh}:${mm}`, label });
  }
}

const ClockIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#84cc16" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
  </svg>
);

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

export default function CustomTimePicker({
  label,
  value,
  onChange,
  alignRight = false,
  blockedRanges = [],
  selectedDate = '',
}) {
  const [open, setOpen] = useState(false);
  const wrapRef         = useRef(null);
  const listRef         = useRef(null);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (open && listRef.current && value) {
      const idx = TIMES.findIndex(t => t.value === value);
      if (idx > -1) listRef.current.children[idx]?.scrollIntoView({ block: 'center' });
    }
  }, [open, value]);

  const display = value ? TIMES.find(t => t.value === value)?.label : null;

  return (
    <div ref={wrapRef} className="relative">

      {/* ── Trigger ── */}
      <div
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3.5 hover:bg-gray-100 transition-colors cursor-pointer select-none"
      >
        <ClockIcon />
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
          <p className={`text-sm font-semibold ${display ? 'text-gray-800' : 'text-gray-400'}`}>
            {display || 'Add time'}
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

      {/* ── Dropdown ── */}
      {open && (
        <div
          className={`absolute top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 w-52 overflow-hidden ${alignRight ? 'right-0' : 'left-0'}`}
          style={{ zIndex: 9999 }}
        >
          <div ref={listRef} className="overflow-y-auto max-h-60 py-2">
            {TIMES.map((t) => {
              const selected = t.value === value;
              const blocked  = isTimeBlocked(t.value, selectedDate, blockedRanges);
              return (
                <button
                  key={t.value}
                  type="button"
                  disabled={blocked}
                  onClick={() => { if (!blocked) { onChange(t.value); setOpen(false); } }}
                  className={[
                    'w-full text-left px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-between gap-2',
                    blocked  ? 'cursor-not-allowed opacity-50'  : 'cursor-pointer',
                  ].join(' ')}
                  style={{
                    backgroundColor: selected ? '#84cc16' : 'transparent',
                    color:           blocked ? '#9ca3af' : selected ? '#0a2535' : '#374151',
                    fontWeight:      selected ? 900 : 600,
                    textDecoration:  blocked ? 'line-through' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!selected && !blocked) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                  onMouseLeave={(e) => { if (!selected) e.currentTarget.style.backgroundColor = selected ? '#84cc16' : 'transparent'; }}
                >
                  <span>{t.label}</span>
                  {blocked && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-red-400 shrink-0">blocked</span>
                  )}
                </button>
              );
            })}
          </div>
          {value && (
            <div className="border-t border-gray-100 px-4 py-2">
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
