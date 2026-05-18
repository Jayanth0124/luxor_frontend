'use client';

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getUserBookings } from '@/services/vehicles.service';
import BookingCard from './BookingCard';

const STATUSES = [
  { key: '',          label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'active',    label: 'Active'    },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function BookingsTab({ isAuth }) {
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['user-bookings', statusFilter],
    queryFn:  () => getUserBookings({ status: statusFilter || undefined, limit: 50 }),
    enabled:  isAuth,
  });

  const bookings = data?.bookings ?? [];

  return (
    <div>
      {/* Filter */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {STATUSES.map(({ key, label }) => {
          const active = statusFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                active
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length > 0 ? (
        <>
          <p className="text-xs text-gray-400 mb-4">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
          <div className="space-y-3">
            {bookings.map((b) => <BookingCard key={b._id} booking={b} />)}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {statusFilter ? `No ${statusFilter} bookings` : 'No bookings yet'}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {statusFilter
              ? 'Try a different filter.'
              : 'Explore vehicles and campsites to make your first booking.'}
          </p>
          {!statusFilter ? (
            <div className="flex items-center justify-center gap-3">
              <Link href="/vehicles" className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#84cc16', color: '#1a2e05' }}>
                Browse Vehicles
              </Link>
              <Link href="/campsites" className="text-sm font-medium border border-gray-200 text-gray-700 hover:border-gray-400 px-4 py-2 rounded-lg transition-colors">
                Browse Campsites
              </Link>
            </div>
          ) : (
            <button onClick={() => setStatusFilter('')} className="text-sm font-medium" style={{ color: '#84cc16' }}>
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
