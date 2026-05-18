'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { updateUser } from '@/store/authSlice';
import api from '@/lib/api';

function InfoField({ label, value, verified = false }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
        {verified && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
      </div>
    </div>
  );
}

export default function AccountDetails({ user }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState(user?.name || '');
  const [error,   setError]   = useState('');

  const mutation = useMutation({
    mutationFn: (n) => api.patch('/users/me', { name: n }),
    onSuccess:  (_, n) => { dispatch(updateUser({ name: n })); setEditing(false); },
    onError:    (e)    => setError(e.response?.data?.message ?? 'Failed to update.'),
  });

  const handleSave = () => {
    setError('');
    const trimmed = name.trim();
    if (!trimmed) { setError('Name is required.'); return; }
    mutation.mutate(trimmed);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">My Profile</h2>
        {editing ? (
          <div className="flex items-center gap-2">
            {error && <span className="text-xs text-red-500">{error}</span>}
            <button
              onClick={() => { setEditing(false); setName(user?.name || ''); setError(''); }}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-lg text-[#1a2e05] transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#84cc16' }}
            >
              {mutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-lg border transition-colors hover:bg-[#f7fee7]"
            style={{ borderColor: '#84cc16', color: '#4a7c01' }}
          >
            Edit
          </button>
        )}
      </div>

      {/* General Information */}
      <div className="px-6 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4">General Information</p>
        {editing ? (
          <div className="max-w-sm">
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#84cc16] transition-colors"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoField label="Display Name" value={user?.name} />
          </div>
        )}
      </div>

      {/* Contact Details */}
      <div className="border-t border-gray-100 px-6 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4">Contact Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InfoField
            label="Mobile Number"
            value={user?.mobile ? `+91 ${user.mobile}` : null}
            verified={!!user?.mobile}
          />
          <InfoField label="Email ID" value={user?.email} />
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Contact details are used to send booking confirmations and updates.
        </p>
      </div>
    </div>
  );
}
