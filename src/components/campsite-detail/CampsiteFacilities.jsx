export default function CampsiteFacilities({ facilities = [] }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-black text-gray-900 mb-4">Facilities &amp; Amenities</h2>
      <div className="flex flex-wrap gap-2">
        {facilities.map((f) => (
          <span
            key={f}
            className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] shrink-0" />
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
