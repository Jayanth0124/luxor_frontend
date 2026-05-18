'use client';

import { useState } from 'react';
import EyeToggle from './EyeToggle';

export default function PasswordField({ label, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 focus:outline-none focus:border-[#84cc16] transition-colors"
        />
        <EyeToggle show={show} onToggle={() => setShow(v => !v)} />
      </div>
    </div>
  );
}
