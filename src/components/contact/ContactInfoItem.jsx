export default function ContactInfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-xl bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16] shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}
