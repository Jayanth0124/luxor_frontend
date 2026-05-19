'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { MapPinIcon } from '@/assets/icons';

const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Module-level singleton — loads once, never re-loads
let _loadPromise = null;
function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.google?.maps?.places?.AutocompleteService) return Promise.resolve(true);
  if (!GMAPS_KEY) return Promise.resolve(false);
  if (_loadPromise) return _loadPromise;

  _loadPromise = new Promise((resolve) => {
    const existing = document.getElementById('gm-website-script');
    if (existing) {
      // Script tag already added by a previous call — poll until ready
      const t = setInterval(() => {
        if (window.google?.maps?.places?.AutocompleteService) {
          clearInterval(t); resolve(true);
        }
      }, 80);
      return;
    }
    const s = document.createElement('script');
    s.id = 'gm-website-script';
    // No "loading=async" — that breaks the onload-based detection
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places`;
    s.async = true;
    s.onerror = () => resolve(false);
    s.onload = () => resolve(true);
    document.head.appendChild(s);
  });
  return _loadPromise;
}

function extractCityState(components = []) {
  let city = '', state = '';
  for (const c of components) {
    if (c.types.includes('locality')) city = c.long_name;
    if (c.types.includes('administrative_area_level_1')) state = c.long_name;
  }
  return { city, state };
}

/**
 * LocationAutocomplete
 * Uses AutocompleteService (works for all API keys, including new ones)
 * + a custom styled dropdown — no Autocomplete widget.
 *
 * Props: label, value, onChange(text), onSelect({ city, state, lat, lng, display }), placeholder
 */
export default function LocationAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  placeholder = 'City or state',
  wrapperClassName = "relative flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3.5 hover:bg-gray-100 transition-colors cursor-text",
  inputClassName = "w-full bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none",
  hideIcon = false,
  hideLabel = false,
}) {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const timerRef = useRef(null);

  const [inputVal, setInputVal] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [gmReady, setGmReady] = useState(false);

  // Load Google Maps on mount
  useEffect(() => {
    loadGoogleMaps().then((ok) => ok && setGmReady(true));
  }, []);

  // Keep value in sync when parent resets it
  useEffect(() => { setInputVal(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
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
      }
    );
  }, [gmReady]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    onChange?.(val);
    if (!val) {
      onSelect?.({ city: '', state: '', lat: null, lng: null, display: '' });
      setSuggestions([]); setOpen(false); return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (pred) => {
    setOpen(false); setSuggestions([]);
    if (!window.google?.maps?.Geocoder) {
      setInputVal(pred.description);
      onChange?.(pred.description);
      onSelect?.({ city: '', state: '', lat: null, lng: null, display: pred.description });
      return;
    }
    new window.google.maps.Geocoder().geocode({ placeId: pred.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const { city, state } = extractCityState(results[0].address_components);
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        const display = [city, state].filter(Boolean).join(', ') || pred.description;
        setInputVal(display);
        onChange?.(display);
        onSelect?.({ city, state, lat, lng, display });
      } else {
        setInputVal(pred.description);
        onChange?.(pred.description);
        onSelect?.({ city: '', state: '', lat: null, lng: null, display: pred.description });
      }
    });
  };

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      {!hideIcon && <MapPinIcon className="w-4 h-4 shrink-0" stroke="#84cc16" />}
      <div className="flex-1 min-w-0">
        {!hideLabel && label && (
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
        )}
        <input
          ref={inputRef}
          value={inputVal}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={inputClassName}
        />
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div
          className={dropdownClassName || "absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden"}
          style={{ zIndex: 9999, minWidth: 320, width: 'max-content', maxWidth: 480 }}
        >
          {suggestions.map((s, i) => (
            <button
              key={s.place_id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              className={`w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-[#f4f7ef] transition-colors ${i < suggestions.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <svg className="w-5 h-5 text-[#84cc16] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#243018] truncate">
                  {s.structured_formatting?.main_text ?? s.description}
                </p>
                {s.structured_formatting?.secondary_text && (
                  <p className="text-xs text-gray-400 font-medium truncate mt-0.5">{s.structured_formatting.secondary_text}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
