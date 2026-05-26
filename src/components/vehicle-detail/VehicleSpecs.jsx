import { UsersIcon, BoltIcon, ClockIcon, CheckBadgeIcon, ShieldCheckIcon } from '@/assets/icons';

function SpecCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function VehicleSpecs({ vehicle }) {
  const v = vehicle;
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-extrabold text-gray-900 mb-6">Technical Specifications</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SpecCard icon={UsersIcon} label="Seating" value={`${v.seatingCapacity || 4} Passengers`} />
        {v.fuel && <SpecCard icon={BoltIcon} label="Fuel Type" value={v.fuel} />}
        {v.pickupTime && <SpecCard icon={ClockIcon} label="Pickup Time" value={v.pickupTime} />}
        {v.dropTime && <SpecCard icon={ClockIcon} label="Drop-off Time" value={v.dropTime} />}
        {v.hasMinimumDays && <SpecCard icon={CheckBadgeIcon} label="Min Booking" value={`${v.minimumDays} Days`} />}
        <SpecCard icon={ShieldCheckIcon} label="Interstate" value={v.allowsOutsideState ? 'Allowed' : 'Not Allowed'} />
      </div>
    </div>
  );
}