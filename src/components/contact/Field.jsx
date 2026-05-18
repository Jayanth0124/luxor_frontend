export default function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600">
        {label}{required && <span className="text-[#84cc16] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
