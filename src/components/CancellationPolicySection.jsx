'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/** Fetch the effective cancellation policy for a partner */
const fetchPolicy = (partnerId) =>
  api.get(`/public/cancellation-policy/${partnerId}`).then((r) => r.data.data);

/** Render one refund tier row */
function TierRow({ tier, isLast }) {
  const label = tier.daysBeforeStart === 0
    ? 'Less than 1 day before'
    : `More than ${tier.daysBeforeStart} day${tier.daysBeforeStart !== 1 ? 's' : ''} before`;

  return (
    <div className={`flex items-center justify-between py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${
        tier.refundPercentage === 100 ? 'text-green-600' :
        tier.refundPercentage > 0   ? 'text-amber-600' : 'text-red-500'
      }`}>
        {tier.refundPercentage === 0 ? 'No refund' : `${tier.refundPercentage}% refund`}
      </span>
    </div>
  );
}

export default function CancellationPolicySection({ partnerId }) {
  const { data: policy, isLoading } = useQuery({
    queryKey: ['cancellation-policy', partnerId],
    queryFn:  () => fetchPolicy(partnerId),
    enabled:  Boolean(partnerId),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !policy) return null;

  // Sort tiers highest-first for display
  const tiers = [...(policy.refundTiers ?? [])].sort((a, b) => b.daysBeforeStart - a.daysBeforeStart);

  return (
    <div className="mb-8 bg-gray-50 border border-gray-100 rounded-2xl p-6" id="cancellation-section">
      <h2 className="text-lg font-black text-gray-900 mb-1">Cancellation Policy</h2>

      {policy.isNonRefundable ? (
        <>
          <p className="text-sm text-gray-500 mb-4">This booking is non-refundable.</p>
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-semibold text-red-700">Non-refundable — no refund will be issued for cancellations.</p>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            You may cancel at least{' '}
            <span className="font-semibold text-gray-700">
              {policy.minCancellationHours >= 24
                ? `${Math.floor(policy.minCancellationHours / 24)} day${Math.floor(policy.minCancellationHours / 24) !== 1 ? 's' : ''}`
                : `${policy.minCancellationHours} hour${policy.minCancellationHours !== 1 ? 's' : ''}`}
            </span>{' '}
            before the start date. Refund amounts depend on how far in advance you cancel.
          </p>

          {tiers.length > 0 ? (
            <div>
              {tiers.map((tier, i) => (
                <TierRow key={i} tier={tier} isLast={i === tiers.length - 1} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No specific refund tiers configured.</p>
          )}
        </>
      )}
    </div>
  );
}
