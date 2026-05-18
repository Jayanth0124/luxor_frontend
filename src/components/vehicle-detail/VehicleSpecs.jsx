import { UsersIcon, BoltIcon, ClockIcon, CheckBadgeIcon, ShieldCheckIcon } from '@/assets/icons';

function Chip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
      <Icon className="w-4 h-4 shrink-0 text-[#65a30d]" />
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-0.5">{label}</p>
        <p className="text-xs font-bold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export default function VehicleSpecs({ vehicle }) {
  const v = vehicle;
  return (
    <div className="mb-8">
      <h2 className="text-base font-black text-gray-900 mb-3">Vehicle Specs</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Chip icon={UsersIcon}       label="Seating"          value={`${v.seatingCapacity} Passengers`} />
        <Chip icon={BoltIcon}        label="Fuel"             value={v.fuel} />
        <Chip icon={ClockIcon}       label="Pickup"           value={v.pickupTime} />
        <Chip icon={ClockIcon}       label="Drop-off"         value={v.dropTime} />
        {v.hasMinimumDays && (
          <Chip icon={CheckBadgeIcon} label="Min. Booking"    value={`${v.minimumDays} Days`} />
        )}
        <Chip icon={ShieldCheckIcon} label="Outside State"    value={v.allowsOutsideState ? 'Allowed' : 'Not Allowed'} />
        {v.hasSleepingCapacity && (
          <Chip icon={UsersIcon}     label="Sleeping"         value={`${v.sleepingCapacity} Berths`} />
        )}
      </div>
    </div>
  );
}
