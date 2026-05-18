'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { selectIsAuthenticated } from '@/store/authSlice';
import { getUserBookings } from '@/services/vehicles.service';
import BookingCard from '@/components/profile/BookingCard';

const STATUSES = [
  { key: '',                label: 'All'         },
  { key: 'pending',         label: 'Pending'     },
  { key: 'confirmed',       label: 'Confirmed'   },
  { key: 'active',          label: 'Active'      },
  { key: 'pending_balance', label: 'Balance Due' },
  { key: 'completed',       label: 'Completed'   },
  { key: 'cancelled',       label: 'Cancelled'   },
];

export default function BookingsPage() {
  const isAuth = useSelector(selectIsAuthenticated);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['user-bookings', statusFilter],
    queryFn:  () => getUserBookings({ status: statusFilter || undefined, limit: 50 }),
    enabled:  isAuth,
  });

  const bookings = data?.bookings ?? [];

  if (!isAuth) return (
    <div className="bg-gray-50 min-h-screen pt-16 flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-2">
        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <p className="text-gray-900 font-bold text-lg">Sign in to view bookings</p>
      <p className="text-gray-400 text-sm text-center max-w-xs">
        Access your booking history, manage payments, and get support for your trips.
      </p>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('luxor:require-login', { detail: { redirect: '/bookings' } }))}
        className="mt-2 text-gray-900 font-bold text-sm px-6 py-3 rounded-xl transition-all hover:brightness-105"
        style={{ backgroundColor: '#84cc16' }}
      >
        Sign In
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-24">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-400 mt-0.5">All your vehicle and campsite bookings</p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
          {STATUSES.map(({ key, label }) => {
            const active = statusFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  active ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length > 0 ? (
          <>
            <p className="text-xs text-gray-400 mb-3">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
              {statusFilter && ` · ${statusFilter.replace('_', ' ')}`}
            </p>
            <div className="space-y-3">
              {bookings.map((b) => <BookingCard key={b._id} booking={b} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {statusFilter ? `No ${statusFilter.replace('_', ' ')} bookings` : 'No bookings yet'}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {statusFilter
                ? 'Try a different filter to see more bookings.'
                : 'Start exploring vehicles and campsites to make your first booking.'}
            </p>
            {statusFilter ? (
              <button
                onClick={() => setStatusFilter('')}
                className="text-sm font-semibold"
                style={{ color: '#84cc16' }}
              >
                Show all bookings
              </button>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/vehicles"
                  className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:brightness-105"
                  style={{ backgroundColor: '#84cc16', color: '#1a2e05' }}
                >
                  Browse Vehicles
                </Link>
                <Link
                  href="/campsites"
                  className="text-sm font-bold border border-gray-200 text-gray-700 hover:border-gray-300 px-5 py-2.5 rounded-xl transition-colors"
                >
                  Browse Campsites
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
