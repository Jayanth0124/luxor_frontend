'use client';

import { useState } from 'react';
import Link from 'next/link';
import InvoiceModal from './InvoiceModal';

export default function BookingActionsCard({
  booking, resource, resourcePath,
  canCancel, isCancelled,
  onOpenSupport, onCancelClick,
}) {
  const [showInvoice, setShowInvoice] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      {/* Invoice */}
      <button
        onClick={() => setShowInvoice(true)}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 py-3 rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
        View / Print Invoice
      </button>

      {/* Support */}
      <button
        onClick={onOpenSupport}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 py-3 rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
        Get support for this booking
      </button>

      {/* Nav */}
      <div className="flex gap-3">
        <Link
          href="/"
          className="flex-1 text-center bg-[#84cc16] hover:brightness-105 text-gray-900 font-bold text-sm py-3 rounded-xl transition-all"
        >
          Home
        </Link>
        <Link
          href={`/${resourcePath}`}
          className="flex-1 text-center border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-sm py-3 rounded-xl transition-colors"
        >
          Browse More
        </Link>
      </div>

      {/* Cancel */}
      {canCancel && (
        <button
          onClick={onCancelClick}
          className="w-full text-center text-xs text-red-400 hover:text-red-600 font-semibold py-2 transition-colors"
        >
          Cancel this booking
        </button>
      )}
      {!canCancel && !isCancelled && booking.status === 'confirmed' && (
        <p className="text-center text-xs text-gray-400 pt-1">
          Cancellations are only allowed more than 2 days before the start date.
        </p>
      )}

      {showInvoice && (
        <InvoiceModal booking={booking} resource={resource} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
}
