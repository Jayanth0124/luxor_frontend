export default function PricingTable({ prices = [] }) {
  if (!prices.length) return null;
  return (
    <div className="mb-8">
      <h2 className="text-lg font-black text-gray-900 mb-4">Pricing by Day</h2>
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Day</th>
              <th className="text-right px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Price / Day</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((row, i) => (
              <tr key={row.day} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-5 py-3 font-semibold text-gray-800">{row.day}</td>
                <td className="px-5 py-3 text-right font-black text-gray-900">
                  ₹{row.price.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
