'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Shared singleton — reuses the same script tag as LocationAutocomplete
let _loadPromise = null;
function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.google?.maps?.places?.AutocompleteService) return Promise.resolve(true);
  if (!GMAPS_KEY) return Promise.resolve(false);
  if (_loadPromise) return _loadPromise;

  _loadPromise = new Promise((resolve) => {
    const existing = document.getElementById('gm-website-script');
    if (existing) {
      const t = setInterval(() => {
        if (window.google?.maps?.places?.AutocompleteService) { clearInterval(t); resolve(true); }
      }, 80);
      return;
    }
    const s   = document.createElement('script');
    s.id      = 'gm-website-script';
    s.src     = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places`;
    s.async   = true;
    s.onerror = () => resolve(false);
    s.onload  = () => resolve(true);
    document.head.appendChild(s);
  });
  return _loadPromise;
}

/**
 * PlaceAutocompleteInput
 * Form-field style Google Maps place autocomplete for checkout forms.
 *
 * Props:
 *   label       — visible label text
 *   value       — controlled string value
 *   onChange(text) — called on every keystroke
 *   onSelect(text) — called when user picks a suggestion (full place description)
 *   placeholder — input placeholder
 *   error       — error message string (shows red border + message)
 *   required    — boolean
 */
export default function PlaceAutocompleteInput({
  label, value, onChange, onSelect, placeholder = 'Search location',
  error, required = false,
}) {
  const wrapperRef = useRef(null);
  const timerRef   = useRef(null);

  const [inputVal,    setInputVal]    = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open,        setOpen]        = useState(false);
  const [gmReady,     setGmReady]     = useState(false);

  useEffect(() => { loadGoogleMaps().then((ok) => ok && setGmReady(true)); }, []);
  useEffect(() => { setInputVal(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback((text) => {
    if (!text.trim() || !gmReady || !window.google?.maps?.places?.AutocompleteService) {
      setSuggestions([]); setOpen(false); return;
    }
    new window.google.maps.places.AutocompleteService().getPlacePredictions(
      { input: text, componentRestrictions: { country: 'in' } },
      (preds, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && preds?.length) {
          setSuggestions(preds.slice(0, 6));
          setOpen(true);
        } else {
          setSuggestions([]); setOpen(false);
        }
      },
    );
  }, [gmReady]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    onChange?.(val);
    if (!val) { setSuggestions([]); setOpen(false); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(val), 280);
  };

  const handleSelect = (pred) => {
    const text = pred.description;
    setInputVal(text);
    setSuggestions([]);
    setOpen(false);
    onChange?.(text);
    onSelect?.(text);
  };

  const borderCls = error
    ? 'border-red-300 focus:border-red-400'
    : 'border-gray-200 focus:border-[#84cc16]';

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className={`flex items-center gap-2 border ${borderCls} rounded-xl px-4 py-3 transition-colors bg-white`}>
        {/* Map pin icon */}
        <svg className={`w-4 h-4 shrink-0 ${error ? 'text-red-400' : 'text-[#84cc16]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <input
          value={inputVal}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 min-w-0 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
        />
        {inputVal && (
          <button type="button" onClick={() => { setInputVal(''); setSuggestions([]); setOpen(false); onChange?.(''); onSelect?.(''); }}
            className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors text-base leading-none">
            ×
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
          style={{ zIndex: 9999, minWidth: '100%', width: 'max-content', maxWidth: 480 }}
        >
          {suggestions.map((s, i) => (
            <button
              key={s.place_id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-lime-50 transition-colors ${i < suggestions.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <svg className="w-4 h-4 text-[#84cc16] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {s.structured_formatting?.main_text ?? s.description}
                </p>
                {s.structured_formatting?.secondary_text && (
                  <p className="text-xs text-gray-400 truncate">{s.structured_formatting.secondary_text}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
