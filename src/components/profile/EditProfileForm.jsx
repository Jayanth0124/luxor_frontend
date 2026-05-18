'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { updateUser } from '@/store/authSlice';
import api from '@/lib/api';

export default function EditProfileForm({ user, onDone }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (name) => api.patch('/users/me', { name }),
    onSuccess: (_, name) => { dispatch(updateUser({ name })); onDone(); },
    onError:   (e)       => setError(e.response?.data?.message ?? 'Failed to update.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = name.trim();
    if (!trimmed) { setError('Name is required.'); return; }
    mutation.mutate(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-1.5">Display Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#84cc16] transition-colors" />
      </div>
      {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={mutation.isPending}
          className="flex-1 bg-[#84cc16] hover:bg-lime-400 text-gray-900 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-colors disabled:opacity-50">
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" onClick={onDone}
          className="flex-1 border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
