export default function VehicleFacilities({ facilities }) {
  if (!facilities || facilities.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-extrabold text-gray-900 mb-6">Included Amenities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
        {facilities.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#84cc16] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">{f.name ?? f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}