import { ArrowRightIcon } from '@/assets/icons';

export default function VehicleRules({ vehicle }) {
  const rules = Array.isArray(vehicle?.rules) ? vehicle.rules.filter(Boolean) : [];
  if (rules.length === 0) return null;

  return (
    <div className="mb-8 bg-gray-50 border border-gray-100 rounded-2xl p-6">
      <h2 className="text-lg font-black text-gray-900 mb-4">Rental Rules</h2>
      <ul className="space-y-3">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
            <ArrowRightIcon className="w-4 h-4 text-[#84cc16] mt-0.5 shrink-0" />
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}
