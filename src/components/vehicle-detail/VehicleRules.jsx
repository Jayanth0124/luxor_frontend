export default function VehicleRules({ vehicle }) {
  const rules = Array.isArray(vehicle?.rules) ? vehicle.rules.filter(Boolean) : [];
  const displayRules = Array.isArray(rules) && rules.length > 0 ? rules : [];

  if (!Array.isArray(rules) && typeof vehicle?.rules === 'object') {
    if (vehicle.rules.minimumAge) displayRules.push(`Minimum Age Requirement: ${vehicle.rules.minimumAge} years`);
    if (vehicle.rules.securityDeposit) displayRules.push(`Security Deposit: ₹${vehicle.rules.securityDeposit.toLocaleString()}`);
    if (vehicle.rules.cleaningFee) displayRules.push(`Cleaning Fee: ₹${vehicle.rules.cleaningFee.toLocaleString()}`);
    if (vehicle.rules.lateReturnFee) displayRules.push(`Late Return Fee: ₹${vehicle.rules.lateReturnFee.toLocaleString()}`);
  }

  if (displayRules.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-extrabold text-gray-900 mb-6">Terms & Guidelines</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <ul className="space-y-3">
          {displayRules.map((rule, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
              <span className="text-sm font-medium text-gray-700">{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}