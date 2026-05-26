import { ArrowRightIcon } from '@/assets/icons';

export default function CampsiteRules({ campsite }) {
  const rules = Array.isArray(campsite?.rules) ? campsite.rules.filter(Boolean) : [];
  if (rules.length === 0) return null;

  return (
    <div className="mb-10 relative bg-white border border-gray-100/80 rounded-[2rem] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden group z-10">
      
      {/* Decorative Glow */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-50 rounded-full blur-3xl -z-10 group-hover:bg-rose-100/60 transition-colors duration-1000 pointer-events-none" />

      {/* Editorial Header */}
      <div className="mb-8 border-b border-gray-100/80 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500 mb-1.5 drop-shadow-sm">CAMP RULES</p>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">
          Community Guidelines
        </h2>
        <p className="text-xs text-gray-400 mt-2 max-w-sm">
          Please read through our community and safety guidelines carefully before booking your stay in the wild.
        </p>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule, i) => (
          <li key={i} className="group flex items-start gap-3 bg-gray-50/50 hover:bg-lime-50/20 rounded-xl p-3.5 border border-gray-100/80 transition-all duration-200">
            <div className="w-5 h-5 rounded-full bg-lime-100 flex items-center justify-center shrink-0 text-[#84cc16] mt-0.5 group-hover:bg-[#84cc16] group-hover:text-gray-900 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
              {rule}
            </span>
          </li>
        ))}
      </ul>

    </div>
  );
}
